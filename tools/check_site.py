"""Verify published paths, internal links and catalog before deploying."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote, parse_qs
import hashlib
import json
import re
ROOT = Path(__file__).resolve().parents[1]

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.ids = set()
    def handle_starttag(self,tag,attrs):
        attrs = dict(attrs)
        if attrs.get('id'): self.ids.add(attrs['id'])
        for key in ('href','src'):
            if attrs.get(key): self.links.append(attrs[key])

def check():
    errors = []
    pages = {}
    versions = {(ROOT/path).resolve():hashlib.sha256((ROOT/path).read_bytes()).hexdigest()[:12]
                for path in ['css/style.css','js/site.js','js/catalog.js','js/research-catalog.js']}
    for file in ROOT.rglob('*.html'):
        parser = Links()
        parser.feed(file.read_text(encoding='utf-8'))
        pages[file.resolve()] = parser
    for file,parser in pages.items():
        for value in parser.links:
            url = urlsplit(value)
            if url.scheme or url.netloc: continue
            target = (file.parent/unquote(url.path)).resolve() if url.path else file
            if target.is_dir(): target = target/'index.html'
            if not target.is_file(): errors.append(f'{file.relative_to(ROOT)}: missing {value}')
            if target in versions and parse_qs(url.query).get('v') != [versions[target]]:
                errors.append(f'{file.relative_to(ROOT)}: stale asset version {value}')
            if url.fragment and target in pages and not re.fullmatch(r'section-\d+',url.fragment):
                if unquote(url.fragment) not in pages[target].ids:
                    errors.append(f'{file.relative_to(ROOT)}: missing anchor {value}')
    source = (ROOT/'js/research-catalog.js').read_text(encoding='utf-8')
    payload = json.loads(source.split('window.MARKET_CATALOG = ',1)[1].rstrip(';\n'))
    seen = set()
    for record in payload['records']:
        path = record['path']
        if path in seen: errors.append(f'Duplicate catalog entry: {path}')
        seen.add(path)
        if not (ROOT/path).is_file(): errors.append(f'Missing catalog article: {path}')
        if not record['title'] or not record['text']: errors.append(f'Empty article: {path}')
        if not re.fullmatch(r'\d{4}-\d{2}-\d{2}',record['date']): errors.append(f'Invalid date: {path}')
    if errors: raise SystemExit('\n'.join(errors))
    print(f'PASS: {len(pages)} pages, all internal links and {len(seen)} indexed articles.')

if __name__ == '__main__': check()
