#!/usr/bin/env python3
"""Generate sitemap.xml from frontend page files.
Usage:
  python scripts/generate_sitemap.py --base-url https://example.com

Outputs to `frontend/public/sitemap.xml` by default.
"""
import argparse
import os
import re
from datetime import date

PAGE_EXTS = {'.jsx', '.js', '.tsx', '.ts', '.html'}


def camel_to_kebab(name: str) -> str:
    # Remove file extension if present
    name = re.sub(r"\..+$", "", name)
    # If name already contains hyphens or underscores, normalize
    if '-' in name or '_' in name:
        s = name.replace('_', '-').lower()
        return s
    # Convert CamelCase or PascalCase to kebab-case
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1-\2', name)
    s2 = re.sub('([a-z0-9])([A-Z])', r'\1-\2', s1)
    return s2.replace('--', '-').lower()


def page_to_path(filename: str) -> str:
    name = os.path.splitext(filename)[0]
    lower = name.lower()
    if lower in {'home', 'index', 'app'}:
        return '/'
    # map AboutUs -> /about-us
    path = '/' + camel_to_kebab(name)
    return path


def find_pages(pages_dir: str):
    pages = []
    if not os.path.isdir(pages_dir):
        return pages
    for entry in os.listdir(pages_dir):
        full = os.path.join(pages_dir, entry)
        if os.path.isfile(full) and os.path.splitext(entry)[1] in PAGE_EXTS:
            pages.append(entry)
    return sorted(pages)


def build_sitemap(base_url: str, pages: list, output_path: str):
    today = date.today().isoformat()
    lines = ["<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for p in pages:
        path = page_to_path(p)
        loc = base_url.rstrip('/') + path
        lines.append('  <url>')
        lines.append(f'    <loc>{loc}</loc>')
        lines.append(f'    <lastmod>{today}</lastmod>')
        lines.append('    <changefreq>weekly</changefreq>')
        lines.append('    <priority>0.6</priority>')
        lines.append('  </url>')
    lines.append('</urlset>')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print(f'Wrote sitemap with {len(pages)} entries to {output_path}')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--base-url', required=True, help='Base site URL, e.g. https://example.com')
    parser.add_argument('--pages-dir', default='frontend/src/pages', help='Path to pages directory')
    parser.add_argument('--output', default='frontend/public/sitemap.xml', help='Output sitemap path')
    args = parser.parse_args()

    pages = find_pages(args.pages_dir)
    if not pages:
        print(f'No page files found in {args.pages_dir}; exiting.')
        return
    build_sitemap(args.base_url, pages, args.output)


if __name__ == '__main__':
    main()
