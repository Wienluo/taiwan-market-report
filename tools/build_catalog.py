"""Build search data from published article HTML; standard library only."""
from html.parser import HTMLParser
from pathlib import Path
import json
import re
import hashlib

ROOT = Path(__file__).resolve().parents[1]
COMPANIES = {
    '台積電':'2330', '鴻海':'2317', '廣達':'2382', '緯創':'3231', '緯穎':'6669',
    '英業達':'2356', '仁寶':'2324', '和碩':'4938', '創意':'3443', '世芯':'3661',
    '聯發科':'2454', '智原':'3035', '晶心科':'6533', '力旺':'3529', '台光電':'2383',
    '台燿':'6274', '聯茂':'6213', '欣興':'3037', '南電':'8046', '景碩':'3189',
    '臻鼎':'4958', '華通':'2313', '金像電':'2368', '健鼎':'3044', '尖點':'8021',
    '聯亞':'3081', '全新':'2455', '光聖':'6442', '上詮':'3363', '波若威':'3163',
    '華星光':'4979', '南亞科':'2408', '華邦電':'2344', '旺宏':'2337', '群聯':'8299',
    '威剛':'3260', '國巨':'2327', '華新科':'2492', '禾伸堂':'3026', '光頡':'3624',
    '台半':'5425', '強茂':'2481', '漢磊':'3707', '環球晶':'6488', '台勝科':'3532',
    '合晶':'6182', '京元電':'2449', '精測':'6510', '德律':'3030', '穎崴':'6515',
    '旺矽':'6223', '雍智':'6683', '帆宣':'6196', '弘塑':'3131', '辛耘':'3583',
    '萬潤':'6187', '貿聯':'3665', '信邦':'3023', '嘉澤':'3533', '良維':'6290',
    '台玻':'1802', '德宏':'5475', '金居':'8358', '富喬':'1815', '川湖':'2059',
    '勤誠':'8210', '晟銘電':'3013', '奇鋐':'3017', '雙鴻':'3324', '健策':'3653',
    '啟碁':'6285', '智易':'3596', '研華':'2395', '台達電':'2308', '光寶科':'2301',
    '聯電':'2303', '瑞昱':'2379', '日月光':'3711', '鈊象':'3293', '聯詠':'3034',
    '美光':'MU', 'NVIDIA':'NVDA', 'AMD':'AMD', '博通':'AVGO', 'Marvell':'MRVL',
    'Dell':'DELL', 'Supermicro':'SMCI',
}
INDUSTRIES = {
    'AI Server':['ai server','ai伺服器','ai 伺服器','gb300','gb200','ai rack'],
    'ASIC':['asic','客製化晶片','客製晶片'],
    'PCB／ABF／CCL':['pcb','abf','ccl','覆銅板','銅箔基板','載板'],
    'CPO／矽光子／InP':['cpo','矽光子','inp','光通訊','矽光'],
    '記憶體':['記憶體','dram','nand','hbm'],
    'MLCC／被動元件':['mlcc','被動元件','被動','電阻'],
    '功率半導體':['功率半導體','mosfet','sic','碳化矽','igbt'],
    '矽晶圓':['矽晶圓','矽晶片','環球晶','台勝科','合晶'],
    '半導體設備／測試':['半導體設備','半導體測試','測試','探針','廠務','amat','klac'],
    '連接線束':['線束','連接器','連接線','貿聯','信邦'],
    '玻纖布／銅箔':['玻纖布','玻纖','銅箔','t-glass','low dk'],
    '滑軌／機殼／AI沖壓件':['滑軌','機殼','沖壓','川湖','勤誠','晟銘電'],
}

class ArticleParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.div_depth = 0
        self.active = None
        self.words = []
        self.title_parts = []
        self.in_title = False
        self.date = ''
        self.meta = {}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'div':
            self.div_depth += 1
            if 'article-content' in attrs.get('class','').split():
                self.active = self.div_depth
        if tag == 'h1': self.in_title = True
        if tag == 'time' and not self.date: self.date = attrs.get('datetime','')
        if tag == 'meta' and attrs.get('name','').startswith('perspective-'):
            self.meta[attrs['name']] = attrs.get('content','')
        if self.active and tag in ('p','li','h2','h3','h4','td','th','br'):
            self.words.append('\n')

    def handle_endtag(self, tag):
        if tag == 'div':
            if self.active == self.div_depth: self.active = None
            self.div_depth -= 1
        if tag == 'h1': self.in_title = False
        if self.active and tag in ('p','li','h2','h3','h4','td','th'):
            self.words.append('\n')

    def handle_data(self, text):
        if self.active: self.words.append(text)
        if self.in_title: self.title_parts.append(text)

def build():
    records = []
    for folder,kind in [('reports','daily'),('broker-reports','broker'),('perspectives','perspective')]:
        for file in sorted((ROOT/folder).glob('????-??-??*.html')):
            parser = ArticleParser()
            parser.feed(file.read_text(encoding='utf-8'))
            text = re.sub(r'[ \t]+',' ',''.join(parser.words))
            text = re.sub(r'\n\s*\n','\n',text).strip()
            plain = re.sub(r'\s+',' ',text)
            lower = plain.casefold()
            companies = [name for name,code in COMPANIES.items() if name.casefold() in lower
                         or re.search(r'(?<![\w.])'+re.escape(code)+r'(?![\w.])',plain,re.I)]
            def mentions(key):
                key = key.casefold()
                if key.isascii() and key.isalpha():
                    return bool(re.search(r'(?<![a-z])'+re.escape(key)+r'(?![a-z])',lower))
                return key in lower
            industries = [name for name,keys in INDUSTRIES.items() if any(mentions(key) for key in keys)]
            lines = [line.strip() for line in text.splitlines() if line.strip()]
            excerpt = next((line for line in lines if len(line)>50),plain)[:190]
            record = {'path':file.relative_to(ROOT).as_posix(),'date':parser.date or file.stem[:10],
                      'kind':kind,'title':''.join(parser.title_parts).strip(),'excerpt':excerpt,
                      'companies':companies,'industries':industries,'text':plain}
            if kind == 'perspective':
                record['excerpt'] = parser.meta.get('perspective-summary',excerpt)
                record['perspective'] = {key.removeprefix('perspective-'):value for key,value in parser.meta.items()}
            records.append(record)
    records.sort(key=lambda r:(r['date'],r['path']),reverse=True)
    payload = {'records':records,'companies':COMPANIES,'industries':list(INDUSTRIES)}
    encoded = json.dumps(payload,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c').replace('\u2028','\\u2028').replace('\u2029','\\u2029')
    output = ROOT/'js'/'research-catalog.js'
    output.parent.mkdir(exist_ok=True)
    output.write_text('// Generated by tools/build_catalog.py; edit article HTML, then rebuild.\nwindow.MARKET_CATALOG = '+encoded+';\n',encoding='utf-8')
    lightweight = {**payload,'records':[{key:value for key,value in record.items() if key!='text'} for record in records]}
    small = json.dumps(lightweight,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
    (ROOT/'js'/'catalog.js').write_text('// Generated lightweight metadata; full text loads on the research page only.\nwindow.MARKET_CATALOG = '+small+';\n',encoding='utf-8')
    # GitHub Pages and browsers may retain an asset for several minutes. Version by content.
    assets = ['css/style.css','js/catalog.js','js/research-catalog.js','js/site.js']
    versions = {asset:hashlib.sha256((ROOT/asset).read_bytes()).hexdigest()[:12] for asset in assets}
    pattern = re.compile(r'((?:href|src)=")((?:\.\./)?(?:css/style\.css|js/(?:catalog|research-catalog|site)\.js))(?:\?[^"\s]*)?(")')
    for page in ROOT.rglob('*.html'):
        source = page.read_text(encoding='utf-8')
        def version(match):
            relative = match[2]
            asset = relative.removeprefix('../')
            return match[1]+relative+'?v='+versions[asset]+match[3]
        page.write_text(pattern.sub(version,source),encoding='utf-8')
    print(f'Indexed {len(records)} published articles; versioned shared assets.')

if __name__ == '__main__': build()
