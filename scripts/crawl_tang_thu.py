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

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--start-url", default=BASE)
    parser.add_argument("--max-pages", type=int, default=5)
    parser.add_argument("--delay", type=float, default=2.0)
    parser.add_argument("--output", default="tang-thu-import.json")
    parser.add_argument("--profile-dir", default=".cache/tang-thu-chrome")
    args = parser.parse_args()

    visited_pages, article_urls = set(), []
    failed, records = [], []
    queue = [args.start_url]

    with sync_playwright() as playwright:
        # Dedicated persistent profile; does not read or copy the user's normal Chrome profile.
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
                visited_pages.add(url)
                print(f"[LIST] {url}")
                try:
                    page.goto(url, wait_until="domcontentloaded", timeout=60000)
                    page.wait_for_timeout(1800)
                    if not wait_for_manual_verification(page, url):
                        failed.append({"url": url, "reason": "Trang danh sách vẫn bị chặn sau khi người dùng kiểm tra"})
                        continue
                    found, pages = extract_index(page, url)
                    for article_url in found:
                        if article_url not in article_urls:
                            article_urls.append(article_url)
                    for next_url in pages:
                        if next_url not in visited_pages and next_url not in queue and len(visited_pages) + len(queue) < args.max_pages:
                            queue.append(next_url)
                except Exception as exc:
                    failed.append({"url": url, "reason": f"Lỗi tải trang danh sách: {exc}"})
                time.sleep(max(0, args.delay))

            print(f"\nTìm thấy {len(article_urls)} URL bài viết. Bắt đầu đọc tuần tự...")
            for index, url in enumerate(article_urls, 1):
                print(f"[{index}/{len(article_urls)}] {url}")
                try:
                    page.goto(url, wait_until="domcontentloaded", timeout=60000)
                    page.wait_for_timeout(1400)
                    if not wait_for_manual_verification(page, url):
                        failed.append({"url": url, "reason": "Trang bài viết vẫn bị chặn sau khi người dùng kiểm tra"})
                        continue
                    record, reason = extract_article(page, url)
                    if record:
                        records.append(record)
                        print(f"  [OK] {record['title']}")
                    else:
                        failed.append({"url": url, "reason": reason})
                        print(f"  [SKIP] {reason}")
                except PlaywrightTimeoutError:
                    failed.append({"url": url, "reason": "Hết thời gian chờ tải trang"})
                except Exception as exc:
                    failed.append({"url": url, "reason": str(exc)})
                payload = {
                    "source": args.start_url,
                    "exportedAt": now_iso(),
                    "articles": records,
                    "failed": failed,
                    "stats": {"indexPagesVisited": len(visited_pages), "articleUrlsFound": len(article_urls)},
                }
                Path(args.output).write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
                time.sleep(max(0, args.delay))
        finally:
            context.close()

    print(f"\nĐã xuất {len(records)} bài; {len(failed)} URL cần kiểm tra -> {args.output}")
    if not records:
        print("Không có bài nào được xuất. Xem danh sách lỗi trong file JSON.", file=sys.stderr)
        return 2
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
