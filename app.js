(function(){
'use strict';
const app=document.getElementById('app');
const S={en:{books:{},tags:{}},chEn:{},enLoading:{},books:[],chapters:{},loading:{},chFail:{},loaded:false,failed:false,epubs:{},prog:{status:{},notes:{},starred:{},recent:{}},updated:'',tags:[],f:{tag:'',lang:'',st:'',q:''}};

/* ---------- language ---------- */
let UI=(()=>{try{return localStorage.getItem('bandu-ui')||''}catch(e){return ''}})()||'zh';
const L={
zh:{app:'伴读书房',shelf:'书架',myShelf:'我的书架',tagline:'先看导读抓重点，再回原书精读。',toc:'目录',guide:'导读',
  reading:'在读',done:'读完',fresh:'没开始',cont:'继续读',last:'上次：',tocLabel:'导读目录',search:'搜书名或作者',all:'全部',
  zhBooks:'中文',enBooks:'English',noMatch:'没有符合条件的书。',shelfFail:'书架数据暂时打不开。第一次使用需要联网，请稍后刷新。',
  shelfEmpty:'书架还是空的。',loading:'加载中…',starredBtn:'★ 收藏的表达',foot:'已读、收藏和笔记保存在这台设备上。换手机或清理浏览器数据前，先备份一下。',
  updated:'导读更新于 ',backup:'备份我的进度',restore:'从备份恢复',pending:'待导读',deep:'想精读',read:'已读',readOrig:'读原文',
  points:'重点',exprs:'有趣的表达',think:'想一想',myQs:'我的提问',myNotes:'我的笔记',noteTip:'读原文时选中句子，点「摘录选中」也会存到这里。',
  notePh:'写下你的想法、疑问，或想回头精读的段落…',prev:'上一章',next:'下一章',star:'收藏',unstar:'取消收藏',starredTitle:'收藏的表达',
  noStars:'还没有收藏。在章节导读里点 ☆ 收藏。',toGuide:'去导读',notFound:'找不到这一页。',editing:'编辑中…',savedHere:'已保存在这台设备上',
  backupName:'伴读书房-进度-',restored:'已恢复备份',badBackup:'这个文件不是伴读书房的备份',offline:'没有网络，这本书的导读还没存到本机',
  installT:'装到手机主屏幕',installIos:'在 Safari 里点底部的「分享」按钮，选「添加到主屏幕」。',installOther:'在浏览器菜单里选「安装应用」或「添加到主屏幕」。',
  installTail:'之后就像 App 一样打开，没网也能看。',noTip:'不再提示',smaller:'缩小字号',larger:'放大字号',opening:'正在打开原书…',
  pickT:'选择这本书的 epub 文件',pickP1:'文件只在这台设备上打开和保存，不会上传。',pickP2:'选过一次后，这台设备会记住它。',pickBtn:'选择 epub 文件',
  noTocT:'没在目录里自动找到这一章',noTocP:'请从下面选择对应的章节。',otherFile:'换一个 epub 文件',badCh:'这一章的文件打不开。',
  parsing:'正在解析 epub…',badEpub:'这个文件打不开，请确认是 epub 格式。',selFirst:'先长按选中一段原文',excerpted:'已摘录到本章笔记',excerpt:'摘录选中',
  q:'问',switchTo:'EN',switchLabel:'Switch to English',untrans:'',enCount:''},
en:{app:'Bandu Reading Room',shelf:'Shelf',myShelf:'My Shelf',tagline:'Read the guide for the key points, then go back to the book for a close read.',toc:'Contents',guide:'Guide',
  reading:'Reading',done:'Finished',fresh:'Not started',cont:'Continue reading',last:'Last: ',tocLabel:'Contents',search:'Search title or author',all:'All',
  zhBooks:'Chinese',enBooks:'English',noMatch:'No books match.',shelfFail:'Could not load the shelf. The first visit needs a connection; please refresh later.',
  shelfEmpty:'The shelf is empty.',loading:'Loading…',starredBtn:'★ Saved expressions',foot:'Reading marks, saved expressions and notes live on this device. Back them up before switching phones or clearing browser data.',
  updated:'Guides updated ',backup:'Back up my progress',restore:'Restore from backup',pending:'Coming',deep:'Close read',read:'Read',readOrig:'Read the original',
  points:'Key points',exprs:'Interesting expressions',think:'Questions to think about',myQs:'My questions',myNotes:'My notes',noteTip:'Select a passage in the original and tap “Save selection” to add it here.',
  notePh:'Write down thoughts, questions, or passages to come back to…',prev:'Previous',next:'Next',star:'Save',unstar:'Remove',starredTitle:'Saved expressions',
  noStars:'Nothing saved yet. Tap ☆ next to an expression in a chapter guide.',toGuide:'Open guide',notFound:'Page not found.',editing:'Editing…',savedHere:'Saved on this device',
  backupName:'bandu-progress-',restored:'Backup restored',badBackup:'This file is not a Bandu backup',offline:'Offline: this book’s guides are not saved on this device yet',
  installT:'Add to your home screen',installIos:'In Safari, tap Share at the bottom and choose “Add to Home Screen”.',installOther:'In the browser menu, choose “Install app” or “Add to Home screen”.',
  installTail:' It then opens like an app and works offline.',noTip:'Don’t show again',smaller:'Smaller text',larger:'Larger text',opening:'Opening the book…',
  pickT:'Choose this book’s epub file',pickP1:'The file is opened and kept only on this device. It is never uploaded.',pickP2:'After the first time, this device remembers it.',pickBtn:'Choose epub file',
  noTocT:'Couldn’t find this chapter in the table of contents',noTocP:'Pick the matching chapter below.',otherFile:'Use a different epub file',badCh:'This chapter’s file can’t be opened.',
  parsing:'Reading the epub…',badEpub:'This file can’t be opened. Is it an epub?',selFirst:'Long-press to select a passage first',excerpted:'Saved to this chapter’s notes',excerpt:'Save selection',
  q:'Q',switchTo:'中文',switchLabel:'切换到中文',untrans:'This guide hasn’t been translated yet, so it is shown in Chinese.',enCount:' in English'}};
const t=k=>(L[UI]&&L[UI][k]!==undefined?L[UI][k]:L.zh[k]);
const EN=()=>UI==='en';
function setUI(v){UI=v;try{localStorage.setItem('bandu-ui',v)}catch(e){}document.documentElement.lang=v==='en'?'en':'zh-CN';document.title=t('app');
  if(EN())S.books.forEach(b=>{if(S.chapters[b.id]!==undefined)ensureEn(b.id)});render()}
const langBtn=()=>`<button class="chipbtn" data-ui="${EN()?'zh':'en'}" aria-label="${esc(t('switchLabel'))}">${esc(t('switchTo'))}</button>`;
/* display helpers: in English mode the English title leads and the Chinese title follows */
const enB=b=>(S.en.books||{})[b.id]||{};
const bTitle=b=>EN()?(b.titleEn||b.titleZh):b.titleZh;
const bSub=b=>EN()?(b.titleEn&&b.titleZh!==b.titleEn?b.titleZh:''):b.titleEn;
const bAuthor=b=>EN()?(enB(b).author||b.author):b.author;
const bSpine=b=>EN()?(enB(b).spine||String(b.titleEn||b.titleZh).split(/[:：]/)[0]).slice(0,14):String(b.spine||b.titleZh).slice(0,5);
const tagName=x=>EN()?((S.en.tags||{})[x]||x):x;
const LBL={'小品':'Sketch','序':'Preface','导读':'Intro','导':'Intro','结':'End','开':'Open','附':'Appx.','审视':'Review','回忆':'Memoir','后记':'Afterword','导言':'Intro'};
const lab=l=>{if(!EN()||!l)return l||'';let m=String(l).match(/^第\s*(\S+?)\s*章$/);if(m)return 'Ch. '+m[1];m=String(l).match(/^(.*·)序$/);if(m)return m[1]+'Preface';return LBL[l]||l};
const oTitle=o=>EN()?(o.titleEn||o.titleZh):o.titleZh;
const oSub=o=>EN()?(o.titleZh&&o.titleZh!==o.titleEn?o.titleZh:''):o.titleEn;
/* a chapter in the current language: the English overlay replaces the guide text when it exists */
function cx(c){if(!c||!EN())return c;const l=S.chEn[c.bookId];const e=l&&l.find(x=>x.key===c.key);return e?Object.assign({},c,e,{_en:true}):Object.assign({},c,{_en:false})}

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
  try{const d=await getJSON('data/books.json');S.books=d.books||[];S.tags=d.tags||[];S.updated=d.updated||'';S.loaded=true;S.failed=false}
  catch(e){S.failed=true;S.loaded=true}
  try{const e=await getJSON('data/en/books.json');S.en={books:e.books||{},tags:e.tags||{}}}catch(e){}
  render();
  /* warm the offline cache with every book's guides once the shelf is up */
  if('serviceWorker' in navigator&&S.books.length&&!S.failed)
    navigator.serviceWorker.ready.then(reg=>reg.active&&reg.active.postMessage({type:'prefetch',urls:['data/books.json','data/en/books.json',...S.books.map(b=>'data/chapters/'+b.id+'.json'),...S.books.filter(b=>(enB(b).guided||[]).length).map(b=>'data/en/chapters/'+b.id+'.json')]})).catch(()=>{});
}
function ensureEn(bid){
  const b=bookOf(bid);if(!EN()||!b||!(enB(b).guided||[]).length||S.chEn[bid]||S.enLoading[bid])return;
  S.enLoading[bid]=getJSON('data/en/chapters/'+bid+'.json').then(l=>{S.chEn[bid]=l}).catch(()=>{S.chEn[bid]=[]}).finally(()=>{delete S.enLoading[bid];render()});
}
function ensureChapters(bid){
  ensureEn(bid);
  if(!bid||S.chapters[bid]||S.loading[bid]||S.chFail[bid])return;
  S.loading[bid]=getJSON('data/chapters/'+bid+'.json').then(l=>{S.chapters[bid]=l}).catch(()=>{S.chFail[bid]=true;toast(t('offline'))})
    .finally(()=>{delete S.loading[bid];render()});
}

/* ---------- progress (on this device) ---------- */
function loadProg(){try{const p=JSON.parse(ls('bandu-prog')||'null');if(p)S.prog={status:p.status||{},notes:p.notes||{},starred:p.starred||{},recent:p.recent||{}}}catch(e){}
  try{const f=JSON.parse(ls('bandu-filter')||'null');if(f)S.f=Object.assign(S.f,f,{q:''})}catch(e){}}
function saveProg(){ls('bandu-prog',JSON.stringify(S.prog));idbPut('prog-backup',JSON.stringify(S.prog))}
function setStatus(cid,val){S.prog.status[cid]=S.prog.status[cid]===val?'':val;if(!S.prog.status[cid])delete S.prog.status[cid];saveProg();render()}
function toggleStar(key){if(S.prog.starred[key])delete S.prog.starred[key];else S.prog.starred[key]=true;saveProg();render()}
let noteTimer=null;
function noteInput(cid,val){S.prog.notes[cid]=val;const s=document.getElementById('saved');if(s)s.textContent=t('editing');
  clearTimeout(noteTimer);noteTimer=setTimeout(()=>{if(!S.prog.notes[cid])delete S.prog.notes[cid];saveProg();const s2=document.getElementById('saved');if(s2)s2.textContent=t('savedHere')},700)}
function backup(){
  const blob=new Blob([JSON.stringify({app:'bandu',saved:new Date().toISOString(),progress:S.prog},null,1)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=t('backupName')+new Date().toISOString().slice(0,10)+'.json';
  document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);
}
async function restore(file){
  try{const d=JSON.parse(await file.text());const p=d.progress||d;
    if(!p||typeof p!=='object'||!('status' in p||'notes' in p||'starred' in p))throw 0;
    S.prog.recent=S.prog.recent||{};for(const k in (p.recent||{})){if(!S.prog.recent[k]||S.prog.recent[k].t<p.recent[k].t)S.prog.recent[k]=p.recent[k]}
    /* merge: keep what is here, add what the backup has */
    S.prog.status=Object.assign({},p.status,S.prog.status);
    S.prog.starred=Object.assign({},p.starred,S.prog.starred);
    for(const k in (p.notes||{})){const a=S.prog.notes[k],b=p.notes[k];S.prog.notes[k]=!a?b:(a===b||a.includes(b)?a:a+'\n\n'+b)}
    saveProg();render();toast(t('restored'));
  }catch(e){toast(t('badBackup'))}
}

/* ---------- views ---------- */
function bar(backHash,backLabel,crumb,tools=''){
  return `<div class="bar"><button class="back" data-go="${esc(backHash)}">‹ ${esc(backLabel)}</button><div class="crumb">${esc(crumb)}</div><div class="tools">${tools}</div></div>`;
}
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function installTip(){
  if(standalone()||ls('bandu-tip')==='off')return '';
  const ios=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const how=ios?t('installIos'):t('installOther');
  return `<div class="install"><button class="x" data-tipoff aria-label="${esc(t('noTip'))}">×</button><b>${esc(t('installT'))}</b>${esc(how)}${esc(t('installTail'))}</div>`;
}
/* where each book stands, from the reading marks on this device */
function bookState(b){
  const guided=b.guided||[],total=b.chapterCount||guided.length;
  const done=guided.filter(k=>S.prog.status[b.id+'-'+k]).length;
  const st=total&&done>=total?'done':(done||guided.some(k=>S.prog.status[b.id+'-'+k])||S.prog.recent[b.id])?'reading':'new';
  return {guided,total,done,st};
}
const ST_LABEL={get reading(){return t('reading')},get done(){return t('done')},get new(){return t('fresh')}};
function noteRecent(bid,cid){
  if(!bid)return;const r=S.prog.recent||(S.prog.recent={});const prev=r[bid]||{};
  let ch=prev.ch||'',c=cid?findCh(cid):null;
  if(c)ch=(c.label&&c.label!==c.titleZh?c.label+' · ':'')+(c.titleZh||c.titleEn||'');
  r[bid]={t:Date.now(),cid:cid||prev.cid||'',ch};
  ls('bandu-prog',JSON.stringify(S.prog));
}
function shelfList(){
  const f=S.f,q=f.q.trim().toLowerCase();
  const rec=b=>(S.prog.recent[b.id]||{}).t||0;
  const list=S.books.filter(b=>{
    if(f.tag&&!(b.tags||[]).includes(f.tag))return false;
    if(f.lang&&b.lang!==f.lang)return false;
    if(f.st&&bookState(b).st!==f.st)return false;
    if(q&&!(b.titleZh+' '+b.titleEn+' '+b.author+' '+bAuthor(b)+' '+(b.spine||'')).toLowerCase().includes(q))return false;
    return true;
  }).sort((a,c)=>rec(c)-rec(a)||(c.order||0)-(a.order||0));
  if(!list.length)return `<div class="empty">${esc(t('noMatch'))}</div>`;
  return list.map(b=>{const {guided,total,done,st}=bookState(b);
    const enN=EN()?(enB(b).guided||[]).length:0;
    return `<button class="book" data-go="b-${esc(b.id)}"><div class="spine${EN()?' sp-en':''}">${esc(bSpine(b))}</div><div class="bk">
      <h2>${esc(bTitle(b))}</h2><div class="meta">${esc(bAuthor(b))}</div>
      <div class="meta2"><span class="st st-${st}">${ST_LABEL[st]}</span>${(b.tags||[]).map(x=>`<span class="tg">${esc(tagName(x))}</span>`).join('')}<span class="cnt">${EN()&&enN<(b.guided||[]).length?`<span class="enn">${enN?enN+' EN · ':'中文 · '}</span>`:''}${done}/${total}</span></div>
      <div class="meter"><i style="width:${total?Math.round(done/total*100):0}%"></i></div></div></button>`}).join('');
}
function chip(attr,val,label,on){return `<button class="chip" data-${attr}="${esc(val)}" aria-pressed="${on}">${esc(label)}</button>`}
function viewShelf(){
  const starCount=Object.keys(S.prog.starred).length;
  let h=`<div class="view"><div class="shelf-head"><div class="hrow"><div class="eyebrow">${esc(t('app'))}</div>${langBtn()}</div><h1>${esc(t('myShelf'))}</h1><p>${esc(t('tagline'))}</p></div>`;
  h+=installTip();
  if(!S.books.length){h+=`<div class="empty">${esc(S.failed?t('shelfFail'):S.loaded?t('shelfEmpty'):t('loading'))}</div>`}
  else{
    const recent=S.books.filter(b=>S.prog.recent[b.id]).sort((a,c)=>S.prog.recent[c.id].t-S.prog.recent[a.id].t).slice(0,3);
    if(recent.length){
      h+=`<h2 class="sec">${esc(t('cont'))}</h2><div class="cont">`+recent.map(b=>{const r=S.prog.recent[b.id];const {done,total}=bookState(b);
        const rc=r.cid&&findCh(r.cid);const chl=rc?(rc.label&&rc.label!==rc.titleZh?lab(rc.label)+' · ':'')+oTitle(rc):r.ch;
        return `<button class="contcard" data-go="${r.cid?'c-'+esc(r.cid):'b-'+esc(b.id)}"><div class="spine${EN()?' sp-en':''}">${esc(bSpine(b))}</div><div>
          <b>${esc(bTitle(b))}</b><div class="meta">${chl?esc(t('last'))+esc(chl):esc(t('tocLabel'))}</div><div class="meter"><i style="width:${total?Math.round(done/total*100):0}%"></i></div></div></button>`}).join('')+'</div>';
    }
    const tags=S.tags.length?S.tags:[...new Set(S.books.flatMap(b=>b.tags||[]))];
    const f=S.f;
    h+=`<div class="filters"><input id="shelfq" type="search" placeholder="${esc(t('search'))}" value="${esc(f.q)}" autocomplete="off">
      <div class="chips">${chip('ftag','',t('all'),!f.tag)}${tags.map(x=>chip('ftag',x,tagName(x),f.tag===x)).join('')}</div>
      <div class="chips">${chip('flang','zh',t('zhBooks'),f.lang==='zh')}${chip('flang','en',t('enBooks'),f.lang==='en')}<span class="sep"></span>${chip('fst','reading',t('reading'),f.st==='reading')}${chip('fst','done',t('done'),f.st==='done')}${chip('fst','new',t('fresh'),f.st==='new')}</div></div>`;
    h+=`<div class="books" id="booklist">${shelfList()}</div>`;
  }
  if(starCount)h+=`<div class="actions" style="margin-top:24px"><button class="btn" data-go="starred">${esc(t('starredBtn'))} (${starCount})</button></div>`;
  h+=`<div class="shelf-foot">${esc(t('foot'))}${S.updated?`<br>${esc(t('updated'))}${esc(S.updated)}`:''}
    <div class="actions"><button class="btn" data-backup>${esc(t('backup'))}</button><button class="btn" data-restore>${esc(t('restore'))}</button></div></div>`;
  return h+'</div>';
}
function viewBook(bid){
  const b=bookOf(bid);if(!b)return notFound();
  ensureChapters(bid);
  const chs=chOf(bid);
  const intro=EN()?(enB(b).intro||b.intro):b.intro;
  let h=bar('home',t('shelf'),bTitle(b),langBtn())+`<div class="view bookhead"><div class="eyebrow">${esc(bAuthor(b))}${b.year?' · '+esc(b.year):''}</div><h1>${esc(bTitle(b))}</h1><div class="${EN()?'zhsub':'en'}">${esc(bSub(b))}</div>`;
  if(EN()&&!enB(b).intro)h+=`<p class="untrans">${esc(t('untrans'))}</p>`;
  if(intro)h+=`<div class="md" style="margin-top:12px">${md(intro)}</div>`;
  h+='<ol class="toc">';
  const outline=b.outline&&b.outline.length?b.outline:chs.map(c=>({key:c.key,label:c.label,titleEn:c.titleEn,titleZh:c.titleZh}));
  const guided=new Set(b.guided||chs.map(c=>c.key));const enSet=new Set(enB(b).guided||[]);
  for(const o of outline){
    const c=cx(chs.find(x=>x.key===o.key)),has=guided.has(o.key),cid=b.id+'-'+o.key;
    const st=has?S.prog.status[cid]:'';
    const pill=!has?`<span class="pill">${esc(t('pending'))}</span>`:st==='deep'?`<span class="pill deep">${esc(t('deep'))}</span>`:st==='read'?`<span class="pill read">${esc(t('read'))}</span>`:(EN()&&!enSet.has(o.key)?'<span class="pill">中文</span>':'');
    h+=`<li><button ${has?`data-go="c-${esc(cid)}"`:'disabled class="pending"'}><span class="no">${esc(lab(o.label))}</span>
      <span class="t"><b>${esc(oTitle(o))}</b><span class="${EN()?'zhsub':''}">${esc(oSub(o))}</span>${c&&c.lede?`<small>${inline(c.lede)}</small>`:''}</span>${pill}</button></li>`;
  }
  return h+'</ol></div>';
}
function viewChapter(cid){
  const bid=bookIdOfCh(cid);if(!bid)return notFound();
  ensureChapters(bid);
  const c=cx(findCh(cid));if(!c)return notFound(!S.chFail[bid]&&(S.chapters[bid]===undefined||!!S.loading[bid]));
  const b=bookOf(bid)||{titleZh:'',titleEn:''};
  const chs=chOf(bid),i=chs.findIndex(x=>x.id===cid),prev=chs[i-1],next=chs[i+1];
  const st=S.prog.status[cid]||'';
  let h=bar('b-'+bid,t('toc'),bTitle(b),langBtn())+`<div class="view"><div class="chhead"><div class="no">${esc(lab(c.label))}</div><h1>${esc(oTitle(c))}</h1><div class="${EN()?'zhsub':'en'}">${esc(oSub(c))}</div></div>`;
  if(EN()&&!c._en)h+=`<p class="untrans">${esc(t('untrans'))}</p>`;
  if(c.lede)h+=`<p class="lede">${inline(c.lede)}</p>`;
  h+=`<div class="actions"><button class="btn primary" data-go="r-${esc(cid)}">${esc(t('readOrig'))}</button>
    <button class="btn" aria-pressed="${st==='read'}" data-status="read" data-cid="${esc(cid)}">${esc(t('read'))}</button>
    <button class="btn deepbtn" aria-pressed="${st==='deep'}" data-status="deep" data-cid="${esc(cid)}">${esc(t('deep'))}</button></div>`;
  if(c.points&&c.points.length){h+=`<section class="block"><h2>${esc(t('points'))}</h2>`;
    c.points.forEach((p,k)=>{h+=`<div class="point"><h3><span class="n">${k+1}</span>${esc(p.h)}</h3><div class="md">${md(p.body)}</div></div>`});h+='</section>'}
  if(c.expressions&&c.expressions.length){h+=`<section class="block"><h2>${esc(t('exprs'))}</h2>`;
    c.expressions.forEach((e,k)=>{const key=cid+'_'+k;h+=`<div class="expr"><div><q>${esc(e.en)}</q><div class="zh md">${md(e.zh)}</div></div>
      <button class="star" aria-label="${esc(t('star'))}" aria-pressed="${!!S.prog.starred[key]}" data-star="${esc(key)}">${S.prog.starred[key]?'★':'☆'}</button></div>`});h+='</section>'}
  if(c.questions&&c.questions.length){h+=`<section class="block"><h2>${esc(t('think'))}</h2><ol class="qs">`+c.questions.map(q=>`<li>${inline(q)}</li>`).join('')+'</ol></section>'}
  if(c.qa&&c.qa.length){h+=`<section class="block"><h2>${esc(t('myQs'))}</h2>`+c.qa.map(x=>`<div class="qa"><div class="ask" data-q="${esc(t('q'))}">${inline(x.q)}</div><div class="ans md">${md(x.a)}</div>${x.date?`<div class="when">${esc(x.date)}</div>`:''}</div>`).join('')+'</section>'}
  h+=`<section class="block"><h2>${esc(t('myNotes'))}</h2><p class="note">${esc(t('noteTip'))}</p>
    <textarea id="note-${esc(cid)}" data-note="${esc(cid)}" placeholder="${esc(t('notePh'))}">${esc(S.prog.notes[cid]||'')}</textarea><div class="saved" id="saved"></div></section>`;
  h+=`<div class="pager"><button ${prev?`data-go="c-${esc(prev.id)}"`:'disabled'}><small>${esc(t('prev'))}</small>${prev?esc(oTitle(prev)):''}</button>
    <button ${next?`data-go="c-${esc(next.id)}"`:'disabled'}><small>${esc(t('next'))}</small>${next?esc(oTitle(next)):''}</button></div>`;
  return h+'</div>';
}
function viewStarred(){
  const keys=Object.keys(S.prog.starred);
  for(const key of keys){const m=key.match(/^(.*)_(\d+)$/);if(m)ensureChapters(bookIdOfCh(m[1]))}
  let h=bar('home',t('shelf'),t('starredTitle'),langBtn())+`<div class="view"><h1 style="font-size:24px">${esc(t('starredTitle'))}</h1><div class="starred-list" style="margin-top:12px">`;
  if(!keys.length)h+=`<div class="empty">${esc(t('noStars'))}</div>`;
  for(const key of keys){const m=key.match(/^(.*)_(\d+)$/);if(!m)continue;const c=cx(findCh(m[1]));const e=c&&c.expressions&&c.expressions[+m[2]];if(!e)continue;
    const b=bookOf(c.bookId)||{titleZh:'',titleEn:''};
    h+=`<div class="expr"><div><q>${esc(e.en)}</q><div class="zh md">${md(e.zh)}</div><div class="from">${esc(bTitle(b))} · ${esc(lab(c.label))} ${esc(oTitle(c))} · <a href="#c-${esc(c.id)}">${esc(t('toGuide'))}</a></div></div>
      <button class="star" aria-label="${esc(t('unstar'))}" aria-pressed="true" data-star="${esc(key)}">★</button></div>`}
  return h+'</div></div>';
}
function notFound(loading){return bar('home',t('shelf'),'')+`<div class="empty">${esc(loading||!S.loaded?t('loading'):t('notFound'))}</div>`}

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
  return bar('c-'+cid,t('guide'),`${lab(c.label)} · ${c.titleEn}`,`<button class="chipbtn" data-size="-1" aria-label="${esc(t('smaller'))}">A−</button><button class="chipbtn" data-size="1" aria-label="${esc(t('larger'))}">A+</button>`)+
    `<div class="view"><div id="reader" style="--rs:${size}px"><div class="empty">${esc(t('opening'))}</div></div></div><button class="excerpt" id="excerpt" data-excerpt="${esc(cid)}" hidden>${esc(t('excerpt'))}</button>`;
}
function filePicker(c,cid,label,primary){return `<label class="btn${primary?' primary':''}" for="epubfile">${label}</label><input type="file" id="epubfile" accept=".epub,application/epub+zip" data-book="${esc(c.bookId)}" data-cid="${esc(cid)}">`}
async function fillReader(cid){
  const c=findCh(cid);const box=document.getElementById('reader');if(!c||!box)return;
  let book=S.epubs[c.bookId];
  if(!book){const buf=await idbGet('epub:'+c.bookId);if(buf){try{book=S.epubs[c.bookId]=await openEpub(buf)}catch(e){book=null}}}
  if(!document.getElementById('reader'))return;
  if(!book){box.innerHTML=`<div class="loadbox"><b>${esc(t('pickT'))}</b><p>${esc(t('pickP1'))}</p><p>${esc(t('pickP2'))}</p>${filePicker(c,cid,esc(t('pickBtn')),true)}</div>`;return}
  if(c.epubStart&&c.epubHref&&await showSpan(book,c,box))return;
  if(c.epubHref){const h=(book.spine||[]).find(x=>x.endsWith(c.epubHref));if(h){await showHref(book,-1,box,[h]);return}}
  const want=(c.epubLabel||c.titleEn||'').toLowerCase();
  const hit=book.toc.find(t=>t.label.toLowerCase()===want)||book.toc.find(t=>want&&t.label.toLowerCase().includes(want));
  if(!hit){box.innerHTML=`<div class="loadbox"><b>${esc(t('noTocT'))}</b><p>${esc(t('noTocP'))}</p><ul class="toclist">${book.toc.map((t,k)=>`<li><button data-tocpick="${k}" data-cid="${esc(cid)}">${esc(t.label)}</button></li>`).join('')}</ul>
    <p style="margin-top:14px">${filePicker(c,cid,esc(t('otherFile')))}</p></div>`;return}
  await showHref(book,book.toc.indexOf(hit),box);
}
/* a chapter can span several spine files: read from its toc entry up to the next entry at the same or higher level */
function chapterRange(book,k){
  const t=book.toc[k],sp=book.spine||[],a=sp.indexOf(t.href);if(a<0)return [t.href];
  let b=sp.length;
  for(let j=k+1;j<book.toc.length;j++){const u=book.toc[j];if((u.depth||0)>(t.depth||0))continue;const x=sp.indexOf(u.href);if(x>a){b=x;break}}
  return sp.slice(a,Math.min(b,a+60));
}
/* chapters that live mid-file (several per file, or split across files): cut from the paragraph
   containing epubStart up to the one containing epubEnd, pulling in the short heading lines just above */
const HEADLINE=/^(BOOK [A-Z]+\s*)?[IVXLC]*$/;
const normText=n=>(n.textContent||'').replace(/\s+/g,' ').trim();
/* some epubs wrap a whole part in one <div>: open such wrappers so the cut works paragraph by paragraph */
const flatKids=n=>[...n.childNodes].flatMap(k=>k.nodeType===1&&k.tagName==='DIV'&&k.querySelector('p')?flatKids(k):[k]);
async function showSpan(book,c,box){
  const sp=book.spine||[];let i=sp.findIndex(x=>x.endsWith(c.epubHref));if(i<0)return false;
  const start=c.epubStart.replace(/\s+/g,' ').trim(),end=c.epubEnd?c.epubEnd.replace(/\s+/g,' ').trim():'';
  const node=document.createElement('div');let started=false,done=false;
  for(let n=0;i<sp.length&&!done&&n<4;i++,n++){
    const part=await chapterHtml(book,sp[i]);if(!part)continue;
    const kids=flatKids(part);
    for(let k=0;k<kids.length;k++){
      const t=normText(kids[k]);
      if(!started){
        if(!t.includes(start))continue;
        started=true;const pre=[];
        for(let j=k-1;j>=0&&j>k-30;j--){const u=normText(kids[j]);if(!u||HEADLINE.test(u))pre.unshift(kids[j]);else break}
        pre.forEach(p=>node.appendChild(p));
      }else if(end&&t.includes(end)){done=true;break}
      node.appendChild(kids[k]);
    }
    if(!started)return false;
  }
  if(!started)return false;
  while(node.lastChild&&(HEADLINE.test(normText(node.lastChild))||/^[—–\-*·\s]+$/.test(normText(node.lastChild))))node.removeChild(node.lastChild);
  box.innerHTML='';node.className='orig';box.appendChild(node);
  const ex=document.getElementById('excerpt');if(ex)ex.hidden=false;
  return true;
}
async function showHref(book,k,box,list){
  let node=null;
  for(const href of (list||chapterRange(book,k))){const part=await chapterHtml(book,href);if(!part)continue;if(!node)node=part;else while(part.firstChild)node.appendChild(part.firstChild)}
  box.innerHTML='';
  if(!node){box.innerHTML=`<div class="empty">${esc(t('badCh'))}</div>`;return}
  node.className='orig';box.appendChild(node);
  const ex=document.getElementById('excerpt');if(ex)ex.hidden=false;
}
let lastSel='';
document.addEventListener('selectionchange',()=>{const sel=window.getSelection();const s=String(sel||'').trim();const r=document.getElementById('reader');
  if(s&&r&&sel.anchorNode&&r.contains(sel.anchorNode))lastSel=s});

/* ---------- render & events ---------- */
function render(){
  const h=decodeURIComponent((location.hash||'').slice(1));let html,reader=null;
  if(h.startsWith('c-')||h.startsWith('r-')){const cid=h.slice(2);if(S.books.length)noteRecent(bookIdOfCh(cid),cid)}
  else if(h.startsWith('b-')&&bookOf(h.slice(2)))noteRecent(h.slice(2));
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
  if(t.dataset.ui){setUI(t.dataset.ui);return}
  if(t.dataset.status){setStatus(t.dataset.cid,t.dataset.status);return}
  if(t.dataset.star){toggleStar(t.dataset.star);return}
  if(t.dataset.size){const n=Math.min(26,Math.max(14,+(ls('rsize')||18)+(+t.dataset.size)*2));ls('rsize',String(n));const r=document.getElementById('reader');if(r)r.style.setProperty('--rs',n+'px');return}
  if(t.dataset.tocpick!==undefined){const c=findCh(t.dataset.cid);const b=c&&S.epubs[c.bookId];if(b)await showHref(b,+t.dataset.tocpick,document.getElementById('reader'));return}
  for(const [k,a] of [['tag','ftag'],['lang','flang'],['st','fst']])if(t.dataset[a]!==undefined){const v=t.dataset[a];S.f[k]=(k!=='tag'&&S.f[k]===v)?'':v;ls('bandu-filter',JSON.stringify({tag:S.f.tag,lang:S.f.lang,st:S.f.st}));render();return}
  if(t.dataset.backup!==undefined){backup();return}
  if(t.dataset.restore!==undefined){document.getElementById('restorefile').click();return}
  if(t.dataset.tipoff!==undefined){ls('bandu-tip','off');render();return}
});
document.getElementById('restorefile').addEventListener('change',e=>{const f=e.target.files[0];if(f)restore(f);e.target.value=''});
document.body.addEventListener('click',e=>{const el=e.target.closest('#excerpt');if(!el)return;
  const cid=el.dataset.excerpt;const s=lastSel||String(window.getSelection()||'').trim();
  if(!s){toast(t('selFirst'));return}
  const cur=S.prog.notes[cid]||'';S.prog.notes[cid]=(cur?cur.replace(/\s*$/,'')+'\n\n':'')+'> '+s.replace(/\s+/g,' ');saveProg();lastSel='';toast(t('excerpted'))});
app.addEventListener('input',e=>{const t=e.target;if(t.id==='shelfq'){S.f.q=t.value;const l=document.getElementById('booklist');if(l)l.innerHTML=shelfList();return}if(t.dataset&&t.dataset.note!==undefined)noteInput(t.dataset.note,t.value)});
app.addEventListener('change',async e=>{const inp=e.target;if(inp.id!=='epubfile'||!inp.files[0])return;
  const box=document.getElementById('reader');box.innerHTML=`<div class="empty">${esc(t('parsing'))}</div>`;
  try{const buf=await inp.files[0].arrayBuffer();S.epubs[inp.dataset.book]=await openEpub(buf);idbPut('epub:'+inp.dataset.book,buf);fillReader(inp.dataset.cid)}
  catch(err){box.innerHTML=`<div class="empty">${esc(t('badEpub'))}</div>`}});

/* ---------- boot ---------- */
loadProg();
document.documentElement.lang=EN()?'en':'zh-CN';document.title=t('app');
(async()=>{ /* if localStorage was cleared but IndexedDB survived, bring progress back */
  if(!ls('bandu-prog')){const b=await idbGet('prog-backup');if(b){try{const p=JSON.parse(b);S.prog={status:p.status||{},notes:p.notes||{},starred:p.starred||{},recent:p.recent||{}};ls('bandu-prog',b);render()}catch(e){}}}
})();
if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});
render();
loadShelf();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
})();
