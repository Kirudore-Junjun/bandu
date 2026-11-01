(function(){
'use strict';
const app=document.getElementById('app');
const S={books:[],chapters:{},loading:{},chFail:{},loaded:false,failed:false,epubs:{},prog:{status:{},notes:{},starred:{}},updated:''};

/* ---------- helpers ---------- */
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inline=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/(^|[^*])\*([^*\n]+?)\*/g,'$1<em class="en">$2</em>');
function md(src){
  const lines=String(src||'').split('\n');let out='',list=false;
  const close=()=>{if(list){out+='</ul>';list=false}};
  for(const raw of lines){const l=raw.trim();
    if(!l){close();continue}
    if(l.startsWith('- ')){if(!list){out+='<ul>';list=true}out+='<li>'+inline(l.slice(2))+'</li>';continue}
    close();
    if(l.startsWith('> '))out+='<blockquote>'+inline(l.slice(2))+'</blockquote>';
    else out+='<p>'+inline(l)+'</p>';
  }close();return out;
}
function toast(t){const el=document.getElementById('toast');el.textContent=t;el.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>el.hidden=true,2000)}
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
const bookOf=bid=>S.books.find(b=>b.id===bid);
const chOf=bid=>(S.chapters[bid]||[]).slice().sort((a,b)=>(a.order||0)-(b.order||0));
const findCh=cid=>{for(const k in S.chapters){const c=(S.chapters[k]||[]).find(x=>x.id===cid);if(c)return c}return null};
/* chapter ids are "<bookId>-<key>"; recover the book id from the shelf */
const bookIdOfCh=cid=>{const b=S.books.filter(b=>cid.startsWith(b.id+'-')).sort((a,c)=>c.id.length-a.id.length)[0];return b&&b.id};

/* ---------- data ---------- */
async function getJSON(u){const r=await fetch(u,{cache:'no-cache'});if(!r.ok)throw new Error(r.status);return r.json()}
async function loadShelf(){
  try{const d=await getJSON('data/books.json');S.books=d.books||[];S.updated=d.updated||'';S.loaded=true;S.failed=false}
  catch(e){S.failed=true;S.loaded=true}
  render();
  /* warm the offline cache with every book's guides once the shelf is up */
  if('serviceWorker' in navigator&&S.books.length&&!S.failed)
    navigator.serviceWorker.ready.then(reg=>reg.active&&reg.active.postMessage({type:'prefetch',urls:['data/books.json',...S.books.map(b=>'data/chapters/'+b.id+'.json')]})).catch(()=>{});
}
function ensureChapters(bid){
  if(!bid||S.chapters[bid]||S.loading[bid]||S.chFail[bid])return;
  S.loading[bid]=getJSON('data/chapters/'+bid+'.json').then(l=>{S.chapters[bid]=l}).catch(()=>{S.chFail[bid]=true;toast('没有网络，这本书的导读还没存到本机')})
    .finally(()=>{delete S.loading[bid];render()});
}

/* ---------- progress (on this device) ---------- */
function loadProg(){try{const p=JSON.parse(ls('bandu-prog')||'null');if(p)S.prog={status:p.status||{},notes:p.notes||{},starred:p.starred||{}}}catch(e){}}
function saveProg(){ls('bandu-prog',JSON.stringify(S.prog));idbPut('prog-backup',JSON.stringify(S.prog))}
function setStatus(cid,val){S.prog.status[cid]=S.prog.status[cid]===val?'':val;if(!S.prog.status[cid])delete S.prog.status[cid];saveProg();render()}
function toggleStar(key){if(S.prog.starred[key])delete S.prog.starred[key];else S.prog.starred[key]=true;saveProg();render()}
let noteTimer=null;
function noteInput(cid,val){S.prog.notes[cid]=val;const s=document.getElementById('saved');if(s)s.textContent='编辑中…';
  clearTimeout(noteTimer);noteTimer=setTimeout(()=>{if(!S.prog.notes[cid])delete S.prog.notes[cid];saveProg();const s2=document.getElementById('saved');if(s2)s2.textContent='已保存在这台设备上'},700)}
function backup(){
  const blob=new Blob([JSON.stringify({app:'bandu',saved:new Date().toISOString(),progress:S.prog},null,1)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='伴读书房-进度-'+new Date().toISOString().slice(0,10)+'.json';
  document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);
}
async function restore(file){
  try{const d=JSON.parse(await file.text());const p=d.progress||d;
    if(!p||typeof p!=='object'||!('status' in p||'notes' in p||'starred' in p))throw 0;
    /* merge: keep what is here, add what the backup has */
    S.prog.status=Object.assign({},p.status,S.prog.status);
    S.prog.starred=Object.assign({},p.starred,S.prog.starred);
    for(const k in (p.notes||{})){const a=S.prog.notes[k],b=p.notes[k];S.prog.notes[k]=!a?b:(a===b||a.includes(b)?a:a+'\n\n'+b)}
    saveProg();render();toast('已恢复备份');
  }catch(e){toast('这个文件不是伴读书房的备份')}
}

/* ---------- views ---------- */
function bar(backHash,backLabel,crumb,tools=''){
  return `<div class="bar"><button class="back" data-go="${esc(backHash)}">‹ ${esc(backLabel)}</button><div class="crumb">${esc(crumb)}</div><div class="tools">${tools}</div></div>`;
}
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function installTip(){
  if(standalone()||ls('bandu-tip')==='off')return '';
  const ios=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const how=ios?'在 Safari 里点底部的「分享」按钮，选「添加到主屏幕」。':'在浏览器菜单里选「安装应用」或「添加到主屏幕」。';
  return `<div class="install"><button class="x" data-tipoff aria-label="不再提示">×</button><b>装到手机主屏幕</b>${how}之后就像 App 一样打开，没网也能看。</div>`;
}
function viewShelf(){
  const starCount=Object.keys(S.prog.starred).length;
  let h=`<div class="view"><div class="shelf-head"><div class="eyebrow">伴读书房</div><h1>我的书架</h1><p>先看导读抓重点，再回原书精读。</p></div>`;
  h+=installTip();
  if(!S.books.length)h+=`<div class="empty">${S.failed?'书架数据暂时打不开。第一次使用需要联网，请稍后刷新。':S.loaded?'书架还是空的。':'加载中…'}</div>`;
  h+='<div class="books">';
  for(const b of S.books){
    const guided=b.guided||[],total=b.chapterCount||guided.length;
    const done=guided.filter(k=>S.prog.status[b.id+'-'+k]).length;
    h+=`<button class="book" data-go="b-${esc(b.id)}"><div class="spine">${esc(b.spine||String(b.titleZh).slice(0,6))}</div><div>
      <h2>${esc(b.titleZh)}</h2><div class="en">${esc(b.titleEn)}</div>
      <div class="meta">${esc(b.author)} · 导读 ${guided.length}/${total} 章 · 已读 ${done}</div>
      <div class="meter"><i style="width:${total?Math.round(done/total*100):0}%"></i></div></div></button>`;
  }
  h+='</div>';
  if(starCount)h+=`<div class="actions" style="margin-top:24px"><button class="btn" data-go="starred">★ 收藏的表达（${starCount}）</button></div>`;
  h+=`<div class="shelf-foot">已读、收藏和笔记保存在这台设备上。换手机或清理浏览器数据前，先备份一下。${S.updated?`<br>导读更新于 ${esc(S.updated)}`:''}
    <div class="actions"><button class="btn" data-backup>备份我的进度</button><button class="btn" data-restore>从备份恢复</button></div></div>`;
  return h+'</div>';
}
function viewBook(bid){
  const b=bookOf(bid);if(!b)return notFound();
  ensureChapters(bid);
  const chs=chOf(bid);
  let h=bar('home','书架',b.titleZh)+`<div class="view bookhead"><div class="eyebrow">${esc(b.author)}${b.year?' · '+esc(b.year):''}</div><h1>${esc(b.titleZh)}</h1><div class="en">${esc(b.titleEn)}</div>`;
  if(b.intro)h+=`<div class="md" style="margin-top:12px">${md(b.intro)}</div>`;
  h+='<ol class="toc">';
  const outline=b.outline&&b.outline.length?b.outline:chs.map(c=>({key:c.key,label:c.label,titleEn:c.titleEn,titleZh:c.titleZh}));
  const guided=new Set(b.guided||chs.map(c=>c.key));
  for(const o of outline){
    const c=chs.find(x=>x.key===o.key),has=guided.has(o.key),cid=b.id+'-'+o.key;
    const st=has?S.prog.status[cid]:'';
    const pill=!has?'<span class="pill">待导读</span>':st==='deep'?'<span class="pill deep">想精读</span>':st==='read'?'<span class="pill read">已读</span>':'';
    h+=`<li><button ${has?`data-go="c-${esc(cid)}"`:'disabled class="pending"'}><span class="no">${esc(o.label)}</span>
      <span class="t"><b>${esc(o.titleZh)}</b><span>${esc(o.titleEn)}</span>${c&&c.lede?`<small>${esc(c.lede)}</small>`:''}</span>${pill}</button></li>`;
  }
  return h+'</ol></div>';
}
function viewChapter(cid){
  const bid=bookIdOfCh(cid);if(!bid)return notFound();
  ensureChapters(bid);
  const c=findCh(cid);if(!c)return notFound(!S.chFail[bid]&&(S.chapters[bid]===undefined||!!S.loading[bid]));
  const b=bookOf(bid)||{titleZh:''};
  const chs=chOf(bid),i=chs.findIndex(x=>x.id===cid),prev=chs[i-1],next=chs[i+1];
  const st=S.prog.status[cid]||'';
  let h=bar('b-'+bid,'目录',b.titleZh)+`<div class="view"><div class="chhead"><div class="no">${esc(c.label)}</div><h1>${esc(c.titleZh)}</h1><div class="en">${esc(c.titleEn)}</div></div>`;
  if(c.lede)h+=`<p class="lede">${inline(c.lede)}</p>`;
  h+=`<div class="actions"><button class="btn primary" data-go="r-${esc(cid)}">读原文</button>
    <button class="btn" aria-pressed="${st==='read'}" data-status="read" data-cid="${esc(cid)}">已读</button>
    <button class="btn deepbtn" aria-pressed="${st==='deep'}" data-status="deep" data-cid="${esc(cid)}">想精读</button></div>`;
  if(c.points&&c.points.length){h+='<section class="block"><h2>重点</h2>';
    c.points.forEach((p,k)=>{h+=`<div class="point"><h3><span class="n">${k+1}</span>${esc(p.h)}</h3><div class="md">${md(p.body)}</div></div>`});h+='</section>'}
  if(c.expressions&&c.expressions.length){h+='<section class="block"><h2>有趣的表达</h2>';
    c.expressions.forEach((e,k)=>{const key=cid+'_'+k;h+=`<div class="expr"><div><q>${esc(e.en)}</q><div class="zh md">${md(e.zh)}</div></div>
      <button class="star" aria-label="收藏" aria-pressed="${!!S.prog.starred[key]}" data-star="${esc(key)}">${S.prog.starred[key]?'★':'☆'}</button></div>`});h+='</section>'}
  if(c.questions&&c.questions.length){h+='<section class="block"><h2>想一想</h2><ol class="qs">'+c.questions.map(q=>`<li>${inline(q)}</li>`).join('')+'</ol></section>'}
  if(c.qa&&c.qa.length){h+='<section class="block"><h2>我的提问</h2>'+c.qa.map(x=>`<div class="qa"><div class="ask">${inline(x.q)}</div><div class="ans md">${md(x.a)}</div>${x.date?`<div class="when">${esc(x.date)}</div>`:''}</div>`).join('')+'</section>'}
  h+=`<section class="block"><h2>我的笔记</h2><p class="note">读原文时选中句子，点「摘录选中」也会存到这里。</p>
    <textarea id="note-${esc(cid)}" data-note="${esc(cid)}" placeholder="写下你的想法、疑问，或想回头精读的段落…">${esc(S.prog.notes[cid]||'')}</textarea><div class="saved" id="saved"></div></section>`;
  h+=`<div class="pager"><button ${prev?`data-go="c-${esc(prev.id)}"`:'disabled'}><small>上一章</small>${prev?esc(prev.titleZh):''}</button>
    <button ${next?`data-go="c-${esc(next.id)}"`:'disabled'}><small>下一章</small>${next?esc(next.titleZh):''}</button></div>`;
  return h+'</div>';
}
function viewStarred(){
  const keys=Object.keys(S.prog.starred);
  for(const key of keys){const m=key.match(/^(.*)_(\d+)$/);if(m)ensureChapters(bookIdOfCh(m[1]))}
  let h=bar('home','书架','收藏的表达')+'<div class="view"><h1 style="font-size:24px">收藏的表达</h1><div class="starred-list" style="margin-top:12px">';
  if(!keys.length)h+='<div class="empty">还没有收藏。在章节导读里点 ☆ 收藏。</div>';
  for(const key of keys){const m=key.match(/^(.*)_(\d+)$/);if(!m)continue;const c=findCh(m[1]);const e=c&&c.expressions&&c.expressions[+m[2]];if(!e)continue;
    const b=bookOf(c.bookId)||{titleZh:''};
    h+=`<div class="expr"><div><q>${esc(e.en)}</q><div class="zh md">${md(e.zh)}</div><div class="from">${esc(b.titleZh)} · ${esc(c.label)} ${esc(c.titleZh)} · <a href="#c-${esc(c.id)}">去导读</a></div></div>
      <button class="star" aria-label="取消收藏" aria-pressed="true" data-star="${esc(key)}">★</button></div>`}
  return h+'</div></div>';
}
function notFound(loading){return bar('home','书架','')+`<div class="empty">${loading||!S.loaded?'加载中…':'找不到这一页。'}</div>`}

/* ---------- reader (local epub, never uploaded) ---------- */
function idb(){return new Promise((res,rej)=>{try{const r=indexedDB.open('bandu',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}})}
async function idbGet(k){try{const d=await idb();return await new Promise(r=>{const q=d.transaction('kv').objectStore('kv').get(k);q.onsuccess=()=>r(q.result);q.onerror=()=>r(null)})}catch(e){return null}}
async function idbPut(k,v){try{const d=await idb();d.transaction('kv','readwrite').objectStore('kv').put(v,k)}catch(e){}}
const resolve=(base,rel)=>{const parts=(base?base.split('/').slice(0,-1):[]).concat(rel.split('#')[0].split('/'));const out=[];for(const p of parts){if(p==='..')out.pop();else if(p&&p!=='.')out.push(decodeURIComponent(p))}return out.join('/')};
async function openEpub(buf){
  const zip=await JSZip.loadAsync(buf);const P=new DOMParser();
  const cont=P.parseFromString(await zip.file('META-INF/container.xml').async('string'),'application/xml');
  const opfPath=cont.getElementsByTagName('rootfile')[0].getAttribute('full-path');
  const opf=P.parseFromString(await zip.file(opfPath).async('string'),'application/xml');
  const items={};for(const it of opf.getElementsByTagName('item'))items[it.getAttribute('id')]={href:resolve(opfPath,it.getAttribute('href')),props:it.getAttribute('properties')||'',type:it.getAttribute('media-type')};
  const toc=[];
  const navItem=Object.values(items).find(i=>/\bnav\b/.test(i.props));
  const ncxItem=Object.values(items).find(i=>i.type==='application/x-dtbncx+xml');
  if(ncxItem&&zip.file(ncxItem.href)){const n=P.parseFromString(await zip.file(ncxItem.href).async('string'),'application/xml');
    for(const np of n.getElementsByTagName('navPoint')){const lab=np.getElementsByTagName('text')[0],ct=np.getElementsByTagName('content')[0];let d=0,p=np.parentNode;while(p&&p.nodeName){if(p.nodeName==='navPoint')d++;p=p.parentNode}if(lab&&ct)toc.push({label:lab.textContent.trim(),href:resolve(ncxItem.href,ct.getAttribute('src')),depth:d})}}
  else if(navItem&&zip.file(navItem.href)){const n=P.parseFromString(await zip.file(navItem.href).async('string'),'text/html');
    for(const a of n.querySelectorAll('nav a[href]')){let d=0,p=a.parentNode;while(p&&p.tagName){if(p.tagName==='OL'||p.tagName==='UL')d++;p=p.parentNode}toc.push({label:a.textContent.trim(),href:resolve(navItem.href,a.getAttribute('href')),depth:d})}}
  const spine=[...opf.getElementsByTagName('itemref')].map(r=>(items[r.getAttribute('idref')]||{}).href).filter(Boolean);
  return {zip,toc,spine};
}
const KEEP=new Set(['P','H1','H2','H3','H4','H5','H6','EM','I','B','STRONG','BLOCKQUOTE','UL','OL','LI','BR','SUP','SUB','SPAN','DIV','SMALL']);
function cleanNode(src,dst){
  for(const n of src.childNodes){
    if(n.nodeType===3){dst.appendChild(document.createTextNode(n.nodeValue));continue}
    if(n.nodeType!==1)continue;const tag=n.tagName.toUpperCase();
    if(['SCRIPT','STYLE','IMG','SVG','IFRAME','OBJECT','EMBED','LINK','META','VIDEO','AUDIO','FORM'].includes(tag))continue;
    if(KEEP.has(tag)){const e=document.createElement(tag.toLowerCase());cleanNode(n,e);dst.appendChild(e)}
    else cleanNode(n,dst);
  }
}
async function chapterHtml(book,href){
  const f=book.zip.file(href);if(!f)return null;const txt=await f.async('string');
  let doc=new DOMParser().parseFromString(txt,'application/xhtml+xml');if(doc.getElementsByTagName('parsererror').length)doc=new DOMParser().parseFromString(txt,'text/html');
  const body=doc.getElementsByTagName('body')[0]||doc.documentElement;const box=document.createElement('div');cleanNode(body,box);return box;
}
function viewReader(cid){
  const bid=bookIdOfCh(cid);if(bid)ensureChapters(bid);
  const c=findCh(cid);if(!c)return notFound(!S.chFail[bid]);
  const size=+(ls('rsize')||18);
  return bar('c-'+cid,'导读',`${c.label} · ${c.titleEn}`,`<button class="chipbtn" data-size="-1" aria-label="缩小字号">A−</button><button class="chipbtn" data-size="1" aria-label="放大字号">A+</button>`)+
    `<div class="view"><div id="reader" style="--rs:${size}px"><div class="empty">正在打开原书…</div></div></div><button class="excerpt" id="excerpt" data-excerpt="${esc(cid)}" hidden>摘录选中</button>`;
}
function filePicker(c,cid,label,primary){return `<label class="btn${primary?' primary':''}" for="epubfile">${label}</label><input type="file" id="epubfile" accept=".epub,application/epub+zip" data-book="${esc(c.bookId)}" data-cid="${esc(cid)}">`}
async function fillReader(cid){
  const c=findCh(cid);const box=document.getElementById('reader');if(!c||!box)return;
  let book=S.epubs[c.bookId];
  if(!book){const buf=await idbGet('epub:'+c.bookId);if(buf){try{book=S.epubs[c.bookId]=await openEpub(buf)}catch(e){book=null}}}
  if(!document.getElementById('reader'))return;
  if(!book){box.innerHTML=`<div class="loadbox"><b>选择这本书的 epub 文件</b><p>文件只在这台设备上打开和保存，不会上传。</p><p>选过一次后，这台设备会记住它。</p>${filePicker(c,cid,'选择 epub 文件',true)}</div>`;return}
  if(c.epubHref){const h=(book.spine||[]).find(x=>x.endsWith(c.epubHref));if(h){await showHref(book,-1,box,[h]);return}}
  const want=(c.epubLabel||c.titleEn||'').toLowerCase();
  const hit=book.toc.find(t=>t.label.toLowerCase()===want)||book.toc.find(t=>want&&t.label.toLowerCase().includes(want));
  if(!hit){box.innerHTML=`<div class="loadbox"><b>没在目录里自动找到这一章</b><p>请从下面选择对应的章节。</p><ul class="toclist">${book.toc.map((t,k)=>`<li><button data-tocpick="${k}" data-cid="${esc(cid)}">${esc(t.label)}</button></li>`).join('')}</ul>
    <p style="margin-top:14px">${filePicker(c,cid,'换一个 epub 文件')}</p></div>`;return}
  await showHref(book,book.toc.indexOf(hit),box);
}
/* a chapter can span several spine files: read from its toc entry up to the next entry at the same or higher level */
function chapterRange(book,k){
  const t=book.toc[k],sp=book.spine||[],a=sp.indexOf(t.href);if(a<0)return [t.href];
  let b=sp.length;
  for(let j=k+1;j<book.toc.length;j++){const u=book.toc[j];if((u.depth||0)>(t.depth||0))continue;const x=sp.indexOf(u.href);if(x>a){b=x;break}}
  return sp.slice(a,Math.min(b,a+60));
}
async function showHref(book,k,box,list){
  let node=null;
  for(const href of (list||chapterRange(book,k))){const part=await chapterHtml(book,href);if(!part)continue;if(!node)node=part;else while(part.firstChild)node.appendChild(part.firstChild)}
  box.innerHTML='';
  if(!node){box.innerHTML='<div class="empty">这一章的文件打不开。</div>';return}
  node.className='orig';box.appendChild(node);
  const ex=document.getElementById('excerpt');if(ex)ex.hidden=false;
}
let lastSel='';
document.addEventListener('selectionchange',()=>{const sel=window.getSelection();const s=String(sel||'').trim();const r=document.getElementById('reader');
  if(s&&r&&sel.anchorNode&&r.contains(sel.anchorNode))lastSel=s});

/* ---------- render & events ---------- */
function render(){
  const h=decodeURIComponent((location.hash||'').slice(1));let html,reader=null;
  if(h.startsWith('b-'))html=viewBook(h.slice(2));
  else if(h.startsWith('c-'))html=viewChapter(h.slice(2));
  else if(h.startsWith('r-')){reader=h.slice(2);html=viewReader(reader)}
  else if(h==='starred')html=viewStarred();
  else html=viewShelf();
  if(reader&&render._reader===reader&&document.getElementById('reader'))return;
  const active=document.activeElement&&document.activeElement.id;
  app.innerHTML=html;
  render._reader=reader&&findCh(reader)?reader:null;
  if(active){const el=document.getElementById(active);if(el&&el.tagName==='TEXTAREA'){el.focus();el.selectionStart=el.selectionEnd=el.value.length}}
  if(render._reader){lastSel='';fillReader(reader)}
}
function go(g){
  if(g==='home'){history.pushState(null,'',location.pathname+location.search);render._reader=null;render()}
  else if(location.hash==='#'+g){render._reader=null;render()}
  else location.hash=g;
  window.scrollTo(0,0);
}
window.addEventListener('hashchange',()=>{S.chFail={};render._reader=null;render();window.scrollTo(0,0)});
window.addEventListener('popstate',()=>{if(!location.hash){render._reader=null;render()}});
app.addEventListener('click',async e=>{
  const t=e.target.closest('button');if(!t)return;
  if(t.dataset.go!==undefined){go(t.dataset.go);return}
  if(t.dataset.status){setStatus(t.dataset.cid,t.dataset.status);return}
  if(t.dataset.star){toggleStar(t.dataset.star);return}
  if(t.dataset.size){const n=Math.min(26,Math.max(14,+(ls('rsize')||18)+(+t.dataset.size)*2));ls('rsize',String(n));const r=document.getElementById('reader');if(r)r.style.setProperty('--rs',n+'px');return}
  if(t.dataset.tocpick!==undefined){const c=findCh(t.dataset.cid);const b=c&&S.epubs[c.bookId];if(b)await showHref(b,+t.dataset.tocpick,document.getElementById('reader'));return}
  if(t.dataset.backup!==undefined){backup();return}
  if(t.dataset.restore!==undefined){document.getElementById('restorefile').click();return}
  if(t.dataset.tipoff!==undefined){ls('bandu-tip','off');render();return}
});
document.getElementById('restorefile').addEventListener('change',e=>{const f=e.target.files[0];if(f)restore(f);e.target.value=''});
document.body.addEventListener('click',e=>{const t=e.target.closest('#excerpt');if(!t)return;
  const cid=t.dataset.excerpt;const s=lastSel||String(window.getSelection()||'').trim();
  if(!s){toast('先长按选中一段原文');return}
  const cur=S.prog.notes[cid]||'';S.prog.notes[cid]=(cur?cur.replace(/\s*$/,'')+'\n\n':'')+'> '+s.replace(/\s+/g,' ');saveProg();lastSel='';toast('已摘录到本章笔记')});
app.addEventListener('input',e=>{const t=e.target;if(t.dataset&&t.dataset.note!==undefined)noteInput(t.dataset.note,t.value)});
app.addEventListener('change',async e=>{const t=e.target;if(t.id!=='epubfile'||!t.files[0])return;
  const box=document.getElementById('reader');box.innerHTML='<div class="empty">正在解析 epub…</div>';
  try{const buf=await t.files[0].arrayBuffer();S.epubs[t.dataset.book]=await openEpub(buf);idbPut('epub:'+t.dataset.book,buf);fillReader(t.dataset.cid)}
  catch(err){box.innerHTML='<div class="empty">这个文件打不开，请确认是 epub 格式。</div>'}});

/* ---------- boot ---------- */
loadProg();
(async()=>{ /* if localStorage was cleared but IndexedDB survived, bring progress back */
  if(!ls('bandu-prog')){const b=await idbGet('prog-backup');if(b){try{const p=JSON.parse(b);S.prog={status:p.status||{},notes:p.notes||{},starred:p.starred||{}};ls('bandu-prog',b);render()}catch(e){}}}
})();
if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});
render();
loadShelf();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
})();
