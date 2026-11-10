#!/usr/bin/env python3
"""Collect Tàng Thư source articles through a visible, user-controlled Chrome session.

Install:
  pip install playwright
  playwright install chrome

Run:
  python scripts/crawl_tang_thu.py

The browser is visible. If the source site presents a verification page, complete it
yourself in the opened browser and press Enter in this terminal. This tool does not
solve CAPTCHAs, evade access controls, rotate IPs, or disguise automation.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlparse

try:
    from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
except ImportError:
    print("Thiếu Playwright. Cài bằng: pip install playwright", file=sys.stderr)
    raise SystemExit(2)

BASE = "https://tuvi.cohoc.net/hoc-tu-vi.html"
HOST = "tuvi.cohoc.net"
ARTICLE_RE = re.compile(r"-nid-\d+\.html(?:$|[?#])", re.I)
CHALLENGE_MARKERS = ("xử lý nghiệp vụ", "ip-spam", "captcha", "access denied", "chờ -- giây")
CONTENT_SELECTORS = (
    "article",
    '[itemprop="articleBody"]',
    ".article-content", ".article-body", ".article-detail",
    ".post-content", ".post-body", ".entry-content",
    ".noi-dung",
    ".content-detail", ".detail-content", ".news-content",
    "#article-content", "#content-detail", "#main-content",
)

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def same_host(url: str) -> bool:
    host = urlparse(url).netloc.lower().split(":")[0]
    return host == HOST or host.endswith("." + HOST)

def is_challenge(page) -> bool:
    try:
        text = page.locator("body").inner_text(timeout=5000).lower()
    except Exception:
        return True
    return any(marker in text for marker in CHALLENGE_MARKERS)

def wait_for_manual_verification(page, label: str) -> bool:
    if not is_challenge(page):
        return True
    print(f"\n[CAN XAC MINH] Website đang hiển thị trang xác minh: {label}")
    print("Hãy tự xử lý trên cửa sổ Chrome vừa mở. Không chia sẻ mã xác minh hoặc cookie.")
    input("Khi Chrome đã hiển thị nội dung bình thường, quay lại đây và nhấn Enter...")
    page.wait_for_timeout(1500)
    if is_challenge(page):
        print("[BLOCKED] Trang vẫn đang ở trạng thái xác minh; bỏ qua URL này.")
        return False
    return True

def collect_links(page, page_url: str):
    return page.locator("a[href]").evaluate_all(
        """els => els.map(a => ({href:a.href, text:(a.innerText||a.textContent||'').trim()}))"""
    )

def extract_index(page, page_url: str):
    links = collect_links(page, page_url)
    articles, pagination = [], []
    for item in links:
        url = urljoin(page_url, item.get("href", "")).split("#")[0]
        if not same_host(url):
            continue
        if ARTICLE_RE.search(url):
            if url not in articles:
                articles.append(url)
            continue
        label = (item.get("text") or "").strip().lower()
        parsed = urlparse(url)
        path = parsed.path.lower()
        looks_like_page = (
            any(token in path for token in ("hoc-tu-vi", "page", "trang", "list"))
            and (url != page_url)
        ) or label in {"2", "3", "4", "5", "sau", "tiếp", "next", "»", "›"}
        if looks_like_page and url not in pagination:
            pagination.append(url)
    return articles, pagination

def extract_article(page, url: str):
    # The source site uses <h1> for title and <div class="noi-dung"> for article text.
    title = ""
    for selector in ('h1', 'meta[property="og:title"]', 'title'):
        try:
            locator = page.locator(selector).first
            if selector.startswith("meta"):
                value = locator.get_attribute("content", timeout=1500)
            else:
                value = locator.inner_text(timeout=1500)
            if value and value.strip():
                title = value.strip()
                break
        except Exception:
            pass

    # Prefer the site's exact article body container; generic selectors are fallbacks.
    body = ""
    for selector in (".noi-dung", *CONTENT_SELECTORS):
        try:
            locator = page.locator(selector).first
            if locator.count():
                candidate = locator.inner_text(timeout=2500).strip()
                if len(candidate) > len(body):
                    body = candidate
                # The exact source container is authoritative; don't include page chrome.
                if selector == ".noi-dung" and len(candidate) >= 40:
                    body = candidate
                    break
        except Exception:
            continue

    body = re.sub(r"\n[ \t]*\n[ \t]*\n+", "\n\n", body).strip()
    if len(body) < 80:
        return None, "Không tìm thấy .noi-dung hoặc nội dung bài viết dưới 80 ký tự"
    if any(marker in body.lower() for marker in CHALLENGE_MARKERS):
        return None, "Nội dung có dấu hiệu là trang xác minh"
    if not title:
        title = body.splitlines()[0][:200]

    # Read the site's visible tag links instead of assigning generic placeholder tags.
    tags = []
    try:
        tags = page.locator(".tags a").evaluate_all(
            """els => els.map(a => (a.innerText || a.textContent || '').trim()).filter(Boolean)"""
        )
    except Exception:
        pass
    tags = list(dict.fromkeys(tag[:80] for tag in tags if tag.strip()))
    if not tags:
        tags = ["Tử Vi", "Tàng Thư"]

    # Prefer a visible byline, then structured metadata author.
    author = ""
    for selector in (".noi-dung b", '[rel="author"]', '[itemprop="author"]', ".author", ".post-author"):
        try:
            candidate = page.locator(selector).first.inner_text(timeout=1000).strip()
            if candidate:
                author = candidate[:200]
                break
        except Exception:
            pass

    description = ""
    for selector in ('meta[name="description"]', 'meta[property="og:description"]'):
        try:
            description = page.locator(selector).first.get_attribute("content", timeout=1000) or ""
            if description.strip():
                break
        except Exception:
            pass

    published_at = ""
    structured_author = ""
    # Article date and author are embedded in JSON-LD on this site.
    try:
        scripts = page.locator('script[type="application/ld+json"]').all_inner_texts()
        for raw in scripts:
            try:
                data = json.loads(raw)
            except Exception:
                continue
            objects = data if isinstance(data, list) else [data]
            for obj in objects:
                if not isinstance(obj, dict):
                    continue
                published_at = published_at or str(obj.get("datePublished") or "")
                person = obj.get("author")
                if isinstance(person, dict):
                    structured_author = structured_author or str(person.get("name") or "")
                elif isinstance(person, str):
                    structured_author = structured_author or person
    except Exception:
        pass

    return {
        "title": title[:200],
        "summary": (description or re.sub(r"\s+", " ", body)[:220]).strip()[:500],
        "content": body,
        "category": "Tử Vi",
        "tags": tags,
        "author": author or structured_author or "Chưa xác định (cần biên tập)",
        "publishedAt": published_at or None,
        "sourceUrl": url,
        "sourceType": "tuvi.cohoc.net",
        "createdAt": now_iso(),
    }, None

def load_json(path: Path, default):
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        backup = path.with_name(path.name + ".corrupt-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
        try:
            path.replace(backup)
            print(f"[WARN] Cache lỗi JSON; đã giữ bản gốc tại: {backup}")
        except OSError:
            print(f"[WARN] Không đọc được {path}: {exc}. Giữ nguyên file và dùng cache rỗng.")
        return default


def atomic_write_json(path: Path, payload):
    """Write to a sibling temp file, then replace; a crash won't leave half a JSON file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(path.name + ".tmp")
    temp.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    temp.replace(path)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--start-url", default=BASE)
    parser.add_argument("--max-pages", type=int, default=5)
    parser.add_argument("--delay", type=float, default=2.0)
    parser.add_argument("--output", default="tang-thu-import.json")
    parser.add_argument("--state", default=".cache/tang-thu-crawl-state.json")
    parser.add_argument("--profile-dir", default=".cache/tang-thu-chrome")
    parser.add_argument(
        "--retry-failed", action=argparse.BooleanOptionalAction, default=True,
        help="Mặc định thử lại URL lỗi từ lần chạy trước; dùng --no-retry-failed để bỏ qua.",
    )
    args = parser.parse_args()

    output_path = Path(args.output)
    state_path = Path(args.state)
    output_data = load_json(output_path, {})
    if not isinstance(output_data, dict):
        output_data = {}

    # Keep every existing article and merge new results by canonical source URL.
    records_by_url = {}
    for record in output_data.get("articles", []):
        if isinstance(record, dict) and record.get("sourceUrl"):
            records_by_url[record["sourceUrl"]] = record

    previous_failed = {
        item.get("url"): item for item in output_data.get("failed", [])
        if isinstance(item, dict) and item.get("url")
    }
    state = load_json(state_path, {})
    if not isinstance(state, dict):
        state = {}

    visited_pages = set(state.get("visitedIndexPages", []))
    article_urls = list(dict.fromkeys(state.get("articleUrls", [])))
    saved_queue = list(dict.fromkeys(state.get("queuedIndexPages", [])))
    list_failures = {
        item.get("url"): item for item in state.get("failedIndexPages", [])
        if isinstance(item, dict) and item.get("url")
    }
    statuses = state.get("articleStatus", {})
    if not isinstance(statuses, dict):
        statuses = {}

    # A record already present in the export is considered successfully collected,
    # even if this is the first run using the new cache format.
    for url in records_by_url:
        statuses[url] = {"status": "done", "updatedAt": now_iso()}

    def save_all():
        nonlocal previous_failed
        pending_failed = []
        for url in article_urls:
            status = statuses.get(url, {})
            if status.get("status") == "failed":
                pending_failed.append({
                    "url": url,
                    "reason": status.get("reason", "Lỗi chưa xác định"),
                    "lastAttemptAt": status.get("updatedAt"),
                })
        # Preserve failures for URLs not yet rediscovered in this run.
        known = {item["url"] for item in pending_failed}
        for url, item in previous_failed.items():
            if url not in known and url not in records_by_url and url not in article_urls:
                pending_failed.append(item)

        payload = dict(output_data)
        payload.update({
            "source": args.start_url,
            "exportedAt": now_iso(),
            "articles": list(records_by_url.values()),
            "failed": pending_failed,
            "stats": {
                "indexPagesVisited": len(visited_pages),
                "articleUrlsFound": len(article_urls),
                "articlesCollected": len(records_by_url),
                "articlesPendingOrFailed": sum(
                    1 for url in article_urls
                    if statuses.get(url, {}).get("status") != "done"
                ),
            },
        })
        atomic_write_json(output_path, payload)
        atomic_write_json(state_path, {
            "version": 1,
            "source": args.start_url,
            "updatedAt": now_iso(),
            "visitedIndexPages": sorted(visited_pages),
            "queuedIndexPages": queue,
            "articleUrls": article_urls,
            "failedIndexPages": list(list_failures.values()),
            "articleStatus": statuses,
        })

    # Retry previously failed index pages first. Successfully visited pages are not
    # downloaded again. The start page is added only if there is no prior state.
    queue = list(dict.fromkeys([*list_failures.keys(), *saved_queue]))
    if not visited_pages and args.start_url not in queue:
        queue.append(args.start_url)

    with sync_playwright() as playwright:
        context = playwright.chromium.launch_persistent_context(
            user_data_dir=args.profile_dir,
            channel="chrome",
            headless=False,
            viewport={"width": 1440, "height": 950},
            args=["--start-maximized"],
        )
        page = context.pages[0] if context.pages else context.new_page()
        try:
            while queue and len(visited_pages) < max(1, args.max_pages):
                url = queue.pop(0)
                if url in visited_pages:
                    continue
                print(f"[LIST] {url}")
                try:
                    page.goto(url, wait_until="domcontentloaded", timeout=60000)
                    page.wait_for_timeout(1800)
                    if not wait_for_manual_verification(page, url):
                        raise RuntimeError("Trang danh sách vẫn bị chặn sau khi người dùng kiểm tra")
                    found, pages = extract_index(page, url)
                    for article_url in found:
                        if article_url not in article_urls:
                            article_urls.append(article_url)
                            statuses.setdefault(article_url, {"status": "pending"})
                    visited_pages.add(url)
                    list_failures.pop(url, None)
                    for next_url in pages:
                        if (next_url not in visited_pages and next_url not in queue
                                and len(visited_pages) + len(queue) < args.max_pages):
                            queue.append(next_url)
                except Exception as exc:
                    list_failures[url] = {"url": url, "reason": f"Lỗi tải trang danh sách: {exc}"}
                    print(f"  [LIST-FAIL] {exc}")
                save_all()
                time.sleep(max(0, args.delay))

            # Persist any discovered URLs before article processing begins.
            save_all()
            print(f"\nCó {len(article_urls)} URL bài viết trong cache.")
            for index, url in enumerate(article_urls, 1):
                status = statuses.get(url, {})
                if status.get("status") == "done" or url in records_by_url:
                    print(f"[{index}/{len(article_urls)}] [SKIP-DONE] {url}")
                    continue
                if status.get("status") == "failed" and not args.retry_failed:
                    print(f"[{index}/{len(article_urls)}] [SKIP-FAILED] {url}")
                    continue

                print(f"[{index}/{len(article_urls)}] {url}")
                statuses[url] = {"status": "in_progress", "updatedAt": now_iso()}
                save_all()
                try:
                    page.goto(url, wait_until="domcontentloaded", timeout=60000)
                    page.wait_for_timeout(1400)
                    if not wait_for_manual_verification(page, url):
                        raise RuntimeError("Trang bài viết vẫn bị chặn sau khi người dùng kiểm tra")
                    record, reason = extract_article(page, url)
                    if not record:
                        raise RuntimeError(reason)
                    # Preserve original fields such as createdAt when an existing
                    # record is encountered; replace only with the newly extracted data.
                    old_record = records_by_url.get(url, {})
                    records_by_url[url] = {**old_record, **record}
                    statuses[url] = {"status": "done", "updatedAt": now_iso()}
                    previous_failed.pop(url, None)
                    print(f"  [OK] {record['title']}")
                except PlaywrightTimeoutError:
                    reason = "Hết thời gian chờ tải trang"
                    statuses[url] = {"status": "failed", "reason": reason, "updatedAt": now_iso()}
                    print(f"  [FAIL] {reason}")
                except Exception as exc:
                    reason = str(exc)
                    statuses[url] = {"status": "failed", "reason": reason, "updatedAt": now_iso()}
                    print(f"  [FAIL] {reason}")
                # Save immediately after every URL, including failures.
                save_all()
                time.sleep(max(0, args.delay))
        finally:
            # Save cache one last time even if the browser closes unexpectedly.
            save_all()
            context.close()

    done_count = sum(1 for value in statuses.values() if value.get("status") == "done")
    failed_count = sum(1 for value in statuses.values() if value.get("status") == "failed")
    print(f"\nCache: {done_count} bài đã thu thập; {failed_count} URL lỗi/chờ thử lại.")
    print(f"File kết quả: {output_path}")
    print(f"File trạng thái: {state_path}")
    return 0 if done_count else 2

if __name__ == "__main__":
    raise SystemExit(main())
