/* Progressive enhancement: every article and archive works without JavaScript. */
(() => {
  'use strict';
  const script = document.currentScript;
  const root = new URL('../', script.src);
  const catalog = window.MARKET_CATALOG;
  const records = catalog ? catalog.records : [];
  const urlFor = path => new URL(path, root).href;
  const kindNames = { daily: '台股日報', broker: '券商研究', perspective: '我的觀點' };
  const dateLabel = date => date.replaceAll('-', ' / ');
  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const link = (text, path, className) => {
    const a = node('a', className, text); a.href = urlFor(path); return a;
  };
  function tags(record, limit = 6) {
    const container = node('div', 'tags');
    const entries = [...record.companies.map(value => ['company', value]), ...record.industries.map(value => ['industry', value])];
    entries.slice(0, limit).forEach(([key,value]) => {
      const query = new URLSearchParams({ [key]: value });
      container.append(link(value, 'research/?' + query, 'tag'));
    });
    return container;
  }
  function resultCard(record) {
    const card = node('article', 'research-result');
    const meta = node('div', 'report-meta');
    const time = node('time', '', dateLabel(record.date)); time.dateTime = record.date;
    meta.append(time, node('span', '', '· ' + kindNames[record.kind]));
    const heading = node('h2'); heading.append(link(record.title + ' →', record.path));
    card.append(meta, heading, node('p', 'summary', record.excerpt), tags(record));
    return card;
  }

  // Reading sections are constructed from the original nodes, preserving source links and IDs.
  const content = document.querySelector('.article-content');
  if (content) {
    const headings = [...content.children].filter(child => child.tagName === 'H2');
    const sections = [];
    let currentBody;
    [...content.childNodes].forEach(child => {
      if (child.nodeType === 1 && child.tagName === 'H2') {
        const index = sections.length;
        if (!child.id) child.id = 'section-' + index;
        const details = node('details', 'report-section');
        const firstOpen = location.pathname.includes('/reports/') && headings.length > 2 ? 1 : 0;
        details.open = index === firstOpen || index === headings.length - 1;
        const summary = node('summary');
        child.before(details); summary.append(child);
        currentBody = node('div', 'section-body');
        details.append(summary, currentBody); sections.push(details);
      } else if (currentBody) currentBody.append(child);
    });
    content.querySelectorAll('table').forEach((table,index) => {
      const wrap = node('div', 'table-wrap');
      wrap.tabIndex = 0; wrap.setAttribute('role', 'region');
      wrap.setAttribute('aria-label', '資料表 ' + (index + 1) + '，可左右捲動');
      table.before(wrap); wrap.append(table);
      const hint = node('p', 'table-help', '表格較寬時，可左右捲動查看。');
      wrap.after(hint);
    });
    content.classList.add('enhanced');
    if (sections.length) {
      const firstText = content.querySelector('.section-body > p');
      if (firstText && location.pathname.includes('/reports/')) {
        const summary = node('aside', 'reading-summary');
        summary.setAttribute('aria-label', '日報摘要');
        summary.append(node('p', 'eyebrow', 'Market overview'), node('p', '', firstText.textContent));
        content.before(summary);
      }
      const tools = node('div', 'reading-tools');
      tools.append(node('span', '', sections.length + ' 個章節 · 按章節閱讀'));
      const actions = node('div', 'actions');
      for (const [label,open] of [['展開全部',true],['收合全部',false]]) {
        const button = node('button', 'button', label); button.type = 'button';
        button.addEventListener('click', () => sections.forEach(section => { section.open = open; }));
        actions.append(button);
      }
      tools.append(actions); content.before(tools);
      // Existing broker table-of-contents links retain their anchor behavior.
      if (!content.querySelector('nav[aria-label="本文目錄"]')) {
        const index = node('details', 'chapter-index');
        index.append(node('summary', '', '章節目錄'));
        const list = node('ol');
        headings.forEach(heading => {
          const li = node('li'); const a = node('a', '', heading.textContent);
          a.href = '#' + heading.id; li.append(a); list.append(li);
        });
        index.append(list); content.before(index);
      }
      const openHash = () => {
        let id;
        try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
        if (!id) return;
        const target = document.getElementById(id);
        if (!target) return;
        const parent = target.closest('.report-section');
        if (parent) parent.open = true;
        target.scrollIntoView({ block: 'start' });
      };
      window.addEventListener('hashchange', openHash);
      if (location.hash) requestAnimationFrame(openHash);
      // Clicking the same anchor again still opens a previously closed section.
      document.addEventListener('click', event => {
        const a = event.target.closest('a[href^="#"]');
        if (a && a.hash === location.hash) requestAnimationFrame(openHash);
      });
      let printState;
      window.addEventListener('beforeprint', () => {
        if (!printState) printState = sections.map(section => section.open);
        sections.forEach(section => { section.open = true; });
      });
      window.addEventListener('afterprint', () => {
        if (printState) sections.forEach((section,index) => { section.open = printState[index]; });
        printState = undefined;
      });
    }
    const relativePath = decodeURIComponent(location.pathname).slice(root.pathname.length);
    const record = records.find(item => item.path === relativePath);
    if (record) {
      const list = tags(record, 8); list.classList.add('article-tags');
      list.setAttribute('aria-label', '文章提及的公司與產業');
      document.querySelector('.article-heading').append(list);
    }
  }

  const latestDaily = document.querySelector('[data-latest-daily]');
  if (latestDaily && catalog) {
    const record = records.find(item => item.kind === 'daily');
    if (record && ![...latestDaily.querySelectorAll('a')].some(a => a.href === urlFor(record.path))) {
      const card = node('article', 'latest-report');
      const meta = node('div', 'report-meta');
      const time = node('time', '', dateLabel(record.date)); time.dateTime = record.date;
      meta.append(time, node('span', '', '· 台股日報'));
      const h3 = node('h3'); h3.append(link(record.title, record.path));
      card.append(meta, h3, node('p', 'summary', record.excerpt), tags(record,4), link('閱讀日報 →',record.path,'button primary'));
      latestDaily.replaceChildren(card);
    }
  }
  const latestBrokers = document.querySelector('[data-latest-brokers]');
  if (latestBrokers && catalog) {
    latestBrokers.replaceChildren();
    records.filter(item => item.kind === 'broker').slice(0,3).forEach(record => {
      const li = node('li'); const a = link('',record.path);
      const text = node('span','',record.title);
      text.append(node('small','',record.companies.slice(0,3).join(' · ') || '研究摘要'));
      const time = node('time','',record.date.slice(5).replace('-',' / ') + ' ↗'); time.dateTime = record.date;
      a.append(text,time); li.append(a); latestBrokers.append(li);
    });
  }

  // Personal perspective versions appear only after an actual dated article is published.
  const opinions = records.filter(item => item.kind === 'perspective');
  const opinionPanel = document.querySelector('[data-perspective-latest]');
  if (opinionPanel && opinions.length) {
    const latest = opinions[0];
    const main = node('div','thesis-main');
    main.append(node('span','status','最新觀點'));
    const h2 = node('h2','empty-title'); h2.append(link(latest.title,latest.path));
    main.append(h2,node('p','empty-copy',latest.excerpt),link('閱讀完整觀點 →',latest.path,'text-link'),node('p','note-meta','更新於 ' + dateLabel(latest.date) + ' · 不定期更新'));
    const index = node('dl','thesis-index');
    for (const [key,label] of [['market','盤勢判斷'],['focus','關注方向'],['risk','主要風險'],['falsification','改變看法']]) {
      const row = node('div','index-row');
      row.append(node('dt','',label),node('dd','',latest.perspective[key] || '本文未另列摘要'));
      index.append(row);
    }
    opinionPanel.className = 'thesis'; opinionPanel.replaceChildren(main,index);
  }
  const opinionHistory = document.querySelector('[data-perspective-history]');
  if (opinionHistory && opinions.length) opinionHistory.replaceChildren(...opinions.map(resultCard));

  const form = document.querySelector('#research-form');
  if (!form) return;
  const results = document.querySelector('#research-results');
  const fallback = document.querySelector('#search-fallback');
  if (!catalog || !Array.isArray(catalog.records)) {
    form.hidden = true;
    document.querySelector('.results-heading').hidden = true;
    fallback.hidden = false; return;
  }
  fallback.hidden = true;
  const query = document.querySelector('#query');
  const clear = document.querySelector('#clear-search');
  const count = document.querySelector('#result-count');
  const empty = document.querySelector('#no-results');
  const more = document.querySelector('#load-more');
  const controls = Object.fromEntries(['kind','company','industry','month'].map(key => [key,form.elements.namedItem(key)]));
  const normalize = value => value.normalize('NFKC').toLocaleLowerCase().trim().replace(/\s+/g,' ');
  const searchable = new Map(records.map(record => [record,normalize(record.title + ' ' + record.date + ' ' + record.text + ' ' + record.companies.join(' ') + ' ' + record.industries.join(' '))]));
  const usedCompanies = new Set(records.flatMap(record => record.companies));
  [...usedCompanies].sort((a,b) => a.localeCompare(b,'zh-TW')).forEach(value => controls.company.add(new Option(value + ' ' + catalog.companies[value],value)));
  catalog.industries.forEach(value => controls.industry.add(new Option(value,value)));
  [...new Set(records.map(record => record.date.slice(0,7)))].sort().reverse().forEach(value => controls.month.add(new Option(value.replace('-',' / '),value)));
  let limit = 12;
  let composing = false;
  const restore = () => {
    const params = new URLSearchParams(location.search);
    query.value = params.get('q') || '';
    Object.entries(controls).forEach(([key,select]) => {
      const value = params.get(key) || '';
      // Preserve an unavailable linked filter as a visible zero-result state.
      if (value && ![...select.options].some(option => option.value === value)) select.add(new Option(value + '（尚無收錄）',value));
      select.value = value;
    });
    limit = 12;
  };
  const save = (push = false) => {
    const url = new URL(location.href);
    url.search = '';
    const value = query.value.trim(); if (value) url.searchParams.set('q',value);
    Object.entries(controls).forEach(([key,select]) => { if (select.value) url.searchParams.set(key,select.value); });
    if (url.href !== location.href) history[push ? 'pushState' : 'replaceState'](null,'',url);
  };
  const render = () => {
    const terms = normalize(query.value).split(' ').filter(Boolean);
    const matches = records.filter(record =>
      (!controls.kind.value || record.kind === controls.kind.value) &&
      (!controls.company.value || record.companies.includes(controls.company.value)) &&
      (!controls.industry.value || record.industries.includes(controls.industry.value)) &&
      (!controls.month.value || record.date.startsWith(controls.month.value)) &&
      terms.every(term => searchable.get(record).includes(term))
    );
    const shown = matches.slice(0,limit);
    results.replaceChildren(...shown.map(resultCard));
    count.textContent = '找到 ' + matches.length + ' 篇研究' + (matches.length ? ' · 顯示 ' + shown.length + ' 篇' : '');
    empty.hidden = matches.length !== 0;
    clear.hidden = query.value.length === 0;
    more.hidden = matches.length <= limit;
    more.textContent = '顯示更多（還有 ' + Math.max(0,matches.length-limit) + ' 篇）';
  };
  const reset = () => {
    query.value = ''; Object.values(controls).forEach(select => { select.value = ''; });
    limit = 12; save(true); render(); query.focus();
  };
  form.addEventListener('submit', event => { event.preventDefault(); if (composing) return; limit = 12; save(true); render(); });
  query.addEventListener('compositionstart', () => { composing = true; });
  query.addEventListener('compositionend', () => { composing = false; limit = 12; save(); render(); });
  query.addEventListener('input', () => { if (!composing) { limit = 12; save(); render(); } });
  clear.addEventListener('click', () => { query.value = ''; limit = 12; save(true); render(); query.focus(); });
  Object.values(controls).forEach(select => select.addEventListener('change', () => { limit = 12; save(true); render(); }));
  document.querySelector('#reset-filters').addEventListener('click',reset);
  document.querySelector('#empty-reset').addEventListener('click',reset);
  more.addEventListener('click', () => { limit += 12; render(); });
  window.addEventListener('popstate', () => { restore(); render(); });
  restore(); render();
})();
