#!/usr/bin/env python3
"""Export articles from tuvi.cohoc.net/hoc-tu-vi.html to a Tàng Thư JSON import file.

Run: python scripts/crawl_tang_thu.py
Optional: python scripts/crawl_tang_thu.py --start-url URL --max-pages 5 --output tang-thu-import.json
The script intentionally stops on anti-bot/challenge pages; it never treats them as article content.
"""
from __future__ import annotations
import argparse, json, re, sys, time
from datetime import datetime, timezone
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

BASE = "https://tuvi.cohoc.net/hoc-tu-vi.html"
HOST = "tuvi.cohoc.net"
BLOCK_MARKERS = ("xử lý nghiệp vụ", "chờ -- giây", "ip-spam", "access denied", "captcha")

def clean_text(value: str) -> str:
    value = re.sub(r"\r", "", value)
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r"\n[ \t]*\n+", "\n\n", value)
    return value.strip()

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.links = []
        self.blocks = []
        self.current = []
        self.capture_depth = None
        self.title = ""
        self.in_title = False
        self.in_body = False
        self.body_depth = 0
        self.article_depth = None
        self.best_blocks = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        depth = len(self.stack)
        classes = (attrs.get("class") or "").lower()
        ident = (attrs.get("id") or "").lower()
        if tag == "a" and attrs.get("href"):
            self.links.append((attrs["href"], ""))
        if tag == "title" or tag == "h1":
            self.in_title = True
        if tag == "body":
            self.in_body = True
            self.body_depth = depth
        if self.article_depth is None and (
            tag in ("article", "main") or
            any(token in classes + " " + ident for token in ("article-content", "post-content", "entry-content", "content-detail", "detail-content", "news-content"))
        ):
            self.article_depth = depth
            self.current = []
        if tag in ("p", "h1", "h2", "h3", "h4", "li", "blockquote", "pre", "br"):
            self.blocks.append((tag, depth))
        self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag in ("title", "h1"):
            self.in_title = False
        if self.stack:
            try:
                idx = len(self.stack) - 1 - self.stack[::-1].index(tag)
                self.stack = self.stack[:idx]
            except ValueError:
                pass
        if self.article_depth is not None and len(self.stack) <= self.article_depth:
            self.article_depth = None

    def handle_data(self, data):
        text = clean_text(data)
        if not text:
            return
        if self.in_title and not self.title:
            self.title = text
        if self.links:
            href, label = self.links[-1]
            self.links[-1] = (href, (label + " " + text).strip())
        if self.article_depth is not None:
            self.current.append(text)
        elif self.in_body:
            self.best_blocks.append(text)

def fetch(url: str) -> str:
    req = Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; TangThuResearchImporter/1.0)", "Accept-Language": "vi,en;q=0.8"})
    with urlopen(req, timeout=25) as response:
        raw = response.read()
        charset = response.headers.get_content_charset() or "utf-8"
    return raw.decode(charset, errors="replace")

def is_challenge(html: str) -> bool:
    sample = re.sub(r"<[^>]+>", " ", html).lower()
    return any(marker in sample for marker in BLOCK_MARKERS)

def parse_page(url: str, html: str):
    parser = PageParser()
    parser.feed(html)
    return parser

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--start-url", default=BASE)
    ap.add_argument("--max-pages", type=int, default=5)
    ap.add_argument("--output", default="tang-thu-import.json")
    ap.add_argument("--delay", type=float, default=1.0)
    args = ap.parse_args()

    queue = [args.start_url]
    visited_pages, article_urls = set(), []
    page_parsers = []
    while queue and len(visited_pages) < max(1, args.max_pages):
        page_url = queue.pop(0)
        if page_url in visited_pages:
            continue
        visited_pages.add(page_url)
        try:
            html = fetch(page_url)
        except Exception as exc:
            print(f"[WARN] Không tải được trang danh sách {page_url}: {exc}", file=sys.stderr)
            continue
        if is_challenge(html):
            print(f"[BLOCKED] Website trả trang chống truy cập tại {page_url}. Dừng để tránh nhập nhầm trang chặn.", file=sys.stderr)
            continue
        parser = parse_page(page_url, html)
        page_parsers.append((page_url, parser))
        for href, label in parser.links:
            absolute = urljoin(page_url, href).split("#")[0]
            parsed = urlparse(absolute)
            if parsed.netloc and parsed.netloc != HOST:
                continue
            if re.search(r"(page|trang|list|hoc-tu-vi)", absolute, re.I) and absolute not in visited_pages and absolute not in queue:
                if len(visited_pages) + len(queue) < args.max_pages:
                    queue.append(absolute)
            elif absolute.startswith("http") and absolute != page_url and absolute not in article_urls:
                if parsed.netloc.endswith(HOST):
                    article_urls.append(absolute)
        time.sleep(max(0, args.delay))

    records, failed = [], []
    for article_url in article_urls:
        try:
            html = fetch(article_url)
            if is_challenge(html):
                failed.append({"url": article_url, "reason": "anti-bot/challenge"})
                continue
            parser = parse_page(article_url, html)
            title = parser.title or ""
            body = clean_text("\n\n".join(parser.current))
            body_lower = body.lower()
            if not title or len(body) < 80 or any(marker in body_lower for marker in BLOCK_MARKERS):
                failed.append({"url": article_url, "reason": "Không nhận diện được nội dung bài viết"})
                continue
            records.append({
                "title": title[:200],
                "summary": body[:220].replace("\n", " ").strip(),
                "content": body,
                "category": "Tử Vi",
                "tags": ["Tử Vi", "Tàng Thư", "Tư liệu sưu tầm"],
                "author": "Chưa xác định (cần biên tập)",
                "sourceUrl": article_url,
                "sourceType": "tuvi.cohoc.net",
                "createdAt": datetime.now(timezone.utc).isoformat(),
            })
        except Exception as exc:
            failed.append({"url": article_url, "reason": str(exc)})
        time.sleep(max(0, args.delay))

    payload = {"source": BASE, "exportedAt": datetime.now(timezone.utc).isoformat(), "articles": records, "failed": failed}
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print(f"Đã xuất {len(records)} bài; {len(failed)} URL cần kiểm tra -> {args.output}")
    if not records:
        print("Không có bài nào được xuất. Kiểm tra anti-bot hoặc cấu trúc HTML trước khi nhập.", file=sys.stderr)
        return 2
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
