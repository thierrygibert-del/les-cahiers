/* Les Cahiers — édition recomposée : 18 pages de lecture dense */
(function(){
"use strict";
const original=window.CAHIER_PAGES || [];
const groups=[[0],[1,2],[3],[4,5],[6,7],[8,9],[10,11],[12,13],[14,15],[16,17],[18,19],[30,20],[28,29],[31,21],[22,23],[24,25],[26],[27]];
let pages=groups.map(indices=>indices.map(i=>original[i]));
let pageBases=groups.map((_,i)=>i);
let pageSpecs=[];
const book=document.getElementById("book"),readall=document.getElementById("readall"),printbook=document.getElementById("printbook");
const stage=document.getElementById("stage"),modeButton=document.getElementById("continuous");
const fontControls=document.getElementById("font-controls"),fontDecrease=document.getElementById("font-decrease"),fontIncrease=document.getElementById("font-increase"),fontValue=document.getElementById("font-value");
const pageNavigation=document.getElementById("page-navigation"),liveStatus=document.getElementById("reader-announcement");
let readingMode=false,readerScale=100;
const prev=document.getElementById("prev"),next=document.getElementById("next"),count=document.getElementById("count");
const progress=document.getElementById("progress-bar"),progressRoot=document.querySelector(".reading-progress");
const toc=document.getElementById("toc-panel"),tocToggle=document.getElementById("toc-toggle"),tocClose=document.getElementById("toc-close"),tocList=document.getElementById("toc-list");
let index=0,flip=null,measuredPageSize=null;
let resizeFrame=0;
const special={0:"cover",2:"timeline-page",4:"portrait",8:"dual-page",9:"vote-page",12:"dual-page",14:"dual-page",15:"final-page",16:"sources-page",17:"sources-page"};
function safe(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function portrait(){
 return '<figure class="portrait-figure"><img loading="lazy" src="https://commons.wikimedia.org/wiki/Special:FilePath/Paul_Vignaux.jpg?width=400" alt="Paul Vignaux photographié en 1975" width="145" height="165">'+
 '<figcaption>Paul Vignaux, 1975 · François Vignaux · <a href="https://commons.wikimedia.org/wiki/File:Paul_Vignaux.jpg" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0 ↗</a></figcaption></figure>';
}
function section(p,partIndex,groupIndex){
 const first=partIndex===0,hasTwo=pages[groupIndex].length===2;
 const sectionClass=first?"paper-section primary-section":"paper-section secondary-section";
 const title=p[4]?.origIndex===0?'<h2>CFDT :<br><em>la séparation</em></h2>':first?'<h2>'+p[1]+'</h2>':'<h3>'+p[1]+'</h3>';
 const source=p[3]?'<a target="_blank" rel="noopener noreferrer" aria-label="Source historique liée à : '+safe(p[1])+' (nouvel onglet)" href="'+safe(p[3])+'">'+safe(new URL(p[3]).hostname)+' ↗</a>':"";
 let body=p[2];
 if(p[4]?.origIndex===7 && !p[4]?.continued)body=portrait()+body;
 if(p[4]?.origIndex===21)body='<div class="closing">'+body+'</div>';
 return '<div class="'+sectionClass+'"><div class="section">'+safe(p[0])+'</div>'+title+body+'</div>'+
 (source?'<div class="module-source">'+source+'</div>':"");
}
function render(items,i,baseOverride){
 const base=baseOverride??pageBases[i];
 let classes=["page"];
 if(special[base])classes.push(special[base]);
 if(items.length>1)classes.push("composed-page");
 if(base===3||base===5||base===6||base===7||base===9||base===11)classes.push("history-page");
 // Une page autonome n'a pas besoin d'avoir la typographie d'une page dense.
 // Le calibrage est annulé automatiquement si la fonte Safari diffère.
 if(baseOverride===undefined && items.length===1 && !special[base]){
  const words=items[0][2].replace(/<[^>]*>/g," ").trim().split(/\s+/).length;
  if(words<=145){
   classes.push("reader-spacious");
   if(words<=73)classes.push("reader-large");
  }
 }
 const main=items.map((p,j)=>section(p,j,base)).join('');
 return '<section class="'+classes.join(' ')+'" data-density="'+(i===0?"hard":"soft")+'"><div class="paper">'+main+'</div>'+
 '<div class="folio"><span>LES CAHIERS · CFDT : LA SÉPARATION</span><span>'+String(i+1).padStart(2,"0")+' / '+pages.length+'</span></div></section>';
}
if(original.length!==32){
 document.getElementById("status").textContent="Le contenu du cahier est incomplet. Veuillez actualiser la page.";return
}
/*
 * Composer les pages d'après leur hauteur réelle AVANT d'initialiser PageFlip.
 * Une section trop haute passe à la page suivante. Une longue section est
 * répartie entre plusieurs feuillets, sans supprimer ni réduire son texte.
 */
function displayParts(parts){
 return parts.map(part=>{
  const p=original[part.idx].slice();
  p[2]=part.html;
  if(part.omitSource)p[3]="";
  if(part.continued)p[1]=p[1]+" — suite";
  p[4]={origIndex:part.idx,continued:part.continued};
  return p;
 });
}
function measureSize(){
 if(measuredPageSize)return measuredPageSize;
 const shell=document.getElementById("shell");
 const widthAvailable=shell?.clientWidth||window.innerWidth;
 const heightAvailable=shell?.clientHeight||Math.min(window.innerHeight*.75,782);
 const ratio=608/430;
 // La maquette est d’abord estimée à partir du cadre réel, et NON d’un
 // ancien feuillet de 430px. Après initialisation, getBoundsRect()
 // permet de recalculer au pixel près la taille native de StPageFlip.
 const portrait=window.innerWidth<=720||widthAvailable<680;
 const sides=portrait?1:2;
 const width=Math.max(215,Math.min(
  530,Math.floor((widthAvailable-(portrait?14:26))/sides),
  Math.floor((heightAvailable-12)/ratio)
 ));
 return {width,height:Math.round(width*ratio)};
}
function fits(parts,base,dim){
 if(!parts.length)return true;
 const probe=document.createElement("div");
 probe.innerHTML=render(displayParts(parts),0,base);
 const page=probe.firstElementChild;
 page.style.cssText="position:absolute;left:-10000px;top:0;visibility:hidden;width:"+dim.width+"px;height:"+dim.height+"px;pointer-events:none";
 document.body.appendChild(page);
 const paper=page.querySelector(".paper"),folio=page.querySelector(".folio");
 const last=paper.lastElementChild;
 const end=last?.getBoundingClientRect().bottom??paper.getBoundingClientRect().top;
 const folioTop=folio.getBoundingClientRect().top;
 const good=paper.scrollHeight<=paper.clientHeight+1 && end<=folioTop-9;
 page.remove();
 return good;
}
function blocks(html){
 const t=document.createElement("template");t.innerHTML=html;
 const units=[];
 for(const el of t.content.children){
  // Les listes sont fractionnées par élément, sans casser leurs liens.
  if(el.matches("ul,ol") && el.children.length>1){
   for(const li of el.children){
    const copy=el.cloneNode(false);copy.appendChild(li.cloneNode(true));
    units.push(copy.outerHTML);
   }
  }else if(el.classList.contains("timeline")&&el.children.length>1){
   for(const entry of el.children){
    const copy=el.cloneNode(false);copy.appendChild(entry.cloneNode(true));
    units.push(copy.outerHTML);
   }
  }else{units.push(el.outerHTML)}
 }
 return units.length?units:[html];
}
function paginate(){
 // Mise en page en flux : une nouvelle section peut commencer dans l'espace
 // laissé par la précédente ; ses paragraphes suivants passent au feuillet
 // suivant uniquement lorsqu'ils ne tiennent plus. Aucun bloc de texte supprimé.
 const dim=measureSize(),result=[],order=groups.flat(),baseOf=new Map();
 groups.forEach((ids,i)=>ids.forEach(idx=>baseOf.set(idx,i)));
 const forcedStart=new Set([0,16,26]); // couverture, vote graphique, bibliographie
 const forcedEnd=new Set([0,17]);
 let current=[],base=0;
 function flush(){
  if(current.length)result.push({base,parts:current});
  current=[];
 }
 function place(idx){
  const home=baseOf.get(idx),units=blocks(original[idx][2]);
  let part={idx,html:"",continued:false,omitSource:true};
  let offset=0;
  while(offset<units.length){
   const last=offset===units.length-1;
   const candidate={...part,html:part.html+units[offset],omitSource:!last};
   if(fits([...current,candidate],base,dim)){
    part=candidate;
    offset++;
    continue;
   }
   if(part.html){
    // Les paragraphes déjà accueillis restent sur leur page. La suite
    // reprend sur un nouveau feuillet, sans reproduire le texte.
    current.push(part);
    flush();
    base=home;
    part={idx,html:"",continued:true,omitSource:true};
    continue;
   }
   if(current.length){
    // Même le titre et le premier paragraphe ne tiennent pas ensemble :
    // les placer sur le feuillet suivant pour ne pas isoler le titre.
    flush();
    base=home;
    continue;
   }
   // Bloc exceptionnellement indivisible (tableau, encadré, etc.).
   // Le défilement de secours conserve l'intégralité du contenu.
   part={...candidate,oversize:true};
   offset++;
   current.push(part);
   flush();
   base=home;
   part={idx,html:"",continued:true,omitSource:true};
  }
  if(part.html)current.push(part);
 }
 for(const idx of order){
  const home=baseOf.get(idx);
  if(forcedStart.has(idx))flush();
  if(!current.length)base=home;
  place(idx);
  if(forcedEnd.has(idx))flush();
 }
 flush();
 return result;
}
function renderLinear(){
 const intro='<div class="linear-heading"><p class="linear-kicker">LES CAHIERS · LECTURE INTÉGRALE</p><h2 id="linear-title" tabindex="-1">Lire « CFDT : la séparation »</h2><p>Version linéaire adaptée aux lecteurs d’écran et aux mobiles.</p></div>';
 readall.innerHTML=intro+original.map((p,i)=>{
  const source=p[3]?'<p class="linear-source"><a href="'+safe(p[3])+'" target="_blank" rel="noopener noreferrer">Consulter la source de « '+safe(p[1])+' » (nouvel onglet)</a></p>':"";
  return '<article class="linear-article" id="section-'+i+'" aria-labelledby="section-title-'+i+'">'+
  '<p class="linear-kicker">'+safe(p[0])+'</p><h3 id="section-title-'+i+'" tabindex="-1">'+safe(p[1])+'</h3>'+
  (i===7?portrait():"")+p[2]+source+'</article>';
 }).join("");
}
function composePages(){
 pageSpecs=paginate();
 pages=pageSpecs.map(x=>displayParts(x.parts));
 pageBases=pageSpecs.map(x=>x.base);
 progressRoot.setAttribute("aria-valuemax",String(pages.length));
 return pages.map((p,i)=>render(p,i)).join("");
}
function assemble(){
 book.innerHTML=composePages();
 renderLinear();
 printbook.innerHTML="";
}
function reconcileFlipDimensions(){
 if(!flip||!flip.getBoundsRect||!flip.updateFromHtml)return;
 const bounds=flip.getBoundsRect();
 if(!bounds||!Number.isFinite(bounds.pageWidth)||!Number.isFinite(bounds.height))return;
 const actual={width:Math.floor(bounds.pageWidth),height:Math.floor(bounds.height)};
 const prev=measureSize();
 if(actual.width<=0||actual.height<=0)return;
 if(Math.abs(actual.width-prev.width)<8&&Math.abs(actual.height-prev.height)<8)return;
 const oldSection=pageSpecs[index]?.parts[0]?.idx??0;
 const oldSize=measuredPageSize;
 measuredPageSize=actual;
 try{
  const nextMarkup=composePages();
  const template=document.createElement("template");
  template.innerHTML=nextMarkup;
  const elements=Array.from(template.content.children);
  if(!elements.length)throw Error("Aucun feuillet à recomposer");
  // La bibliothèque conserve l'ancien index pendant updateFromHtml :
  // le ramener à zéro si la nouvelle pagination est plus courte.
  if(index>=elements.length)flip.turnToPage(0);
  flip.updateFromHtml(elements);
  let target=pageSpecs.findIndex(p=>p.parts.some(part=>part.idx===oldSection));
  index=target<0?0:target;
  flip.turnToPage(index);
  buildToc();sync();
  requestAnimationFrame(fitPages);
 }catch(error){
  measuredPageSize=oldSize;
  console.warn("Recomposition différée : conservation de la version précédente",error);
 }
}
function sync(){
 count.textContent=String(index+1).padStart(2,"0")+" / "+String(pages.length).padStart(2,"0");
 prev.disabled=index===0;next.disabled=index===pages.length-1;
 progress.style.width=((index+1)/pages.length*100).toFixed(2)+"%";
 progressRoot.setAttribute("aria-valuenow",String(index+1));
 tocList.querySelectorAll('button').forEach(b=>{
 const active=Number(b.dataset.page)===index;
 b.setAttribute("aria-current",active?"page":"false");
 });
}
function updateHash(){if(!readingMode)try{history.replaceState(null,"","#page-"+(index+1))}catch(e){}}
function fallback(){
 flip=null;book.classList.add("simple");
 book.querySelectorAll(".page").forEach((el,j)=>el.hidden=j!==index);
 sync();
}
function focusArticle(i){
 const heading=document.getElementById("section-title-"+i);
 heading?.focus({preventScroll:true});
 heading?.scrollIntoView({block:"start",behavior:"auto"});
}
function turnTo(i){
 index=Math.max(0,Math.min(i,pages.length-1));
 if(readingMode){focusArticle(pageSpecs[index]?.parts[0]?.idx??0)}
 else if(flip){try{flip.turnToPage(index)}catch(e){fallback()}}
 else{book.querySelectorAll(".page").forEach((el,j)=>el.hidden=j!==index)}
 sync();updateHash();
}
function setFontSize(n){
 readerScale=Math.max(100,Math.min(200,n));
 readall.style.setProperty("--reader-scale",String(readerScale/100));
 fontValue.textContent=readerScale+" %";
 fontDecrease.disabled=readerScale===100;
 fontIncrease.disabled=readerScale===200;
 try{localStorage.setItem("cahier-cfdt-font-scale",String(readerScale))}catch(e){}
}
function setMode(on,focus){
 readingMode=!!on;
 document.body.classList.toggle("reading",readingMode);
 stage.hidden=readingMode;stage.inert=readingMode;
 readall.hidden=!readingMode;readall.inert=!readingMode;
 if(!readingMode&&flip){
  // Après lecture linéaire ou changement d'orientation, relire la vraie
  // surface d'affichage du feuillet et recomposer en cas de différence.
  measuredPageSize=null;
  requestAnimationFrame(()=>{reconcileFlipDimensions();fitPages()});
 }
 pageNavigation.hidden=readingMode;progressRoot.hidden=readingMode; fontControls.hidden=!readingMode;
 modeButton.setAttribute("aria-pressed",String(readingMode));
 modeButton.textContent=readingMode?"Mode feuilletage":"Lecture continue";
 liveStatus.textContent=readingMode?"Lecture continue activée.":"Mode feuilletage activé.";
 buildToc();
 if(focus){
  const target=readingMode?document.getElementById("linear-title"):book;
  target?.focus({preventScroll:true});target?.scrollIntoView({block:"start",behavior:"auto"});
 }
 try{localStorage.setItem("cahier-cfdt-reading-mode",readingMode?"linear":"flip")}catch(e){}
}
function toggleToc(show){
 toc.hidden=!show;tocToggle.setAttribute("aria-expanded",show?"true":"false");
 if(show)toc.scrollIntoView({behavior:"smooth",block:"nearest"});
}
const titles=[
 "Couverture","Pourquoi cette séparation ?","1919–2014 : la chronologie",
 "1919 · Origines chrétiennes","1937 · Le SGEN et Paul Vignaux",
 "1940–1946 · Résistance et Reconstruction","1947–1957 · Des statuts à la liberté de conscience",
 "1960–1963 · Eugène Descamps","Les arguments des deux courants",
 "Novembre 1964 · Congrès et vote","1964 · Nouveaux statuts et continuités",
 "1965–1971 · Vote des communaux et suites de la scission","1974–2000 · La fédération Interco","1997–2014 · Libertés et statuts",
 "2017–2026 · Laïcité fédérale et loi de 1905","L’Église et conclusion","Sources primaires","Études et bibliographie"
];
function buildToc(){
 tocList.innerHTML="";
 const entries=readingMode?original.map((p,i)=>({i,title:p[1]})):pageBases.map((base,i)=>({i,title:titles[base]+(i>0&&pageBases[i-1]===base?" — suite":"")}));
 for(const {i,title} of entries){
  const button=document.createElement("button");button.type="button";button.dataset.page=String(i);
  button.textContent=String(i+1).padStart(2,"0")+" · "+title;
  button.addEventListener("click",()=>{
   toggleToc(false);
   if(readingMode)focusArticle(i);
   else{turnTo(i);stage.scrollIntoView({block:"start",behavior:"auto"})}
  });
  tocList.appendChild(button);
 }
}
tocToggle.addEventListener("click",()=>toggleToc(toc.hidden));
tocClose.addEventListener("click",()=>toggleToc(false));
function fitPages(){
 for(const p of book.querySelectorAll(".page")){
  const paper=p.querySelector(".paper"),folio=p.querySelector(".folio");
  if(!paper||!folio||!paper.clientHeight||!p.getClientRects().length)continue;
  // Typographie respirante, sauf si elle mord sur la zone du folio.
  const tooFull=()=>paper.scrollHeight>paper.clientHeight+1||
    (paper.lastElementChild?.getBoundingClientRect().bottom||0)>folio.getBoundingClientRect().top-12;
  if(p.classList.contains("reader-large")&&tooFull())p.classList.remove("reader-large");
  if(p.classList.contains("reader-spacious")&&tooFull())p.classList.remove("reader-spacious");
  if(tooFull()){
   p.classList.add("tight");
   if(paper.scrollHeight>paper.clientHeight+1||
      (paper.lastElementChild?.getBoundingClientRect().bottom||0)>folio.getBoundingClientRect().top-7){
    p.classList.add("very-tight");
   }
   if(paper.scrollHeight>paper.clientHeight+1||
      (paper.lastElementChild?.getBoundingClientRect().bottom||0)>folio.getBoundingClientRect().top-7){
    p.classList.add("overflow-safe");
   }
  }
 }
}
function init(){
 assemble();
 readall.hidden=true;readall.inert=true;stage.hidden=false;stage.inert=false;
 book.tabIndex=-1;
 const match=/^#page-(\d+)$/.exec(location.hash);
 if(match)index=Math.max(0,Math.min(Number(match[1])-1,pages.length-1));
 let linear=window.matchMedia("(max-width:720px), (prefers-reduced-motion:reduce)").matches;
 try{
  const stored=localStorage.getItem("cahier-cfdt-reading-mode");
  if(stored==="linear"||stored==="flip")linear=stored==="linear";
  const scale=Number(localStorage.getItem("cahier-cfdt-font-scale"));
  if(scale>=100&&scale<=200)readerScale=scale;
 }catch(e){}
 setFontSize(readerScale);
 if(!window.St||!window.St.PageFlip){setMode(true,false);sync();return}
 try{
  flip=new window.St.PageFlip(book,{
   width:430,height:608,size:"stretch",minWidth:215,maxWidth:530,minHeight:304,maxHeight:750,
   showCover:true,usePortrait:true,mobileScrollSupport:false,drawShadow:true,maxShadowOpacity:.22,
   flippingTime:window.matchMedia("(prefers-reduced-motion:reduce)").matches?70:590
  });
  flip.on("flip",e=>{index=e.data;sync();updateHash();requestAnimationFrame(fitPages)});
  flip.loadFromHTML(book.querySelectorAll(".page"));
  requestAnimationFrame(()=>{
   reconcileFlipDimensions();
   requestAnimationFrame(fitPages);
  });
  if(index>0)flip.turnToPage(index);
 }catch(e){fallback();linear=true}
 setMode(linear,false);sync();
}
prev.addEventListener("click",()=>turnTo(index-1));
next.addEventListener("click",()=>turnTo(index+1));
document.getElementById("first").addEventListener("click",()=>{
 if(readingMode)focusArticle(0);
 else{turnTo(0);stage.scrollIntoView({block:"start",behavior:"auto"})}
});
document.getElementById("sources").addEventListener("click",()=>{
 if(readingMode)focusArticle(26);
 else{
  const p=pageSpecs.findIndex(x=>x.parts.some(part=>part.idx===26));
  turnTo(Math.max(0,p));stage.scrollIntoView({block:"start",behavior:"auto"});
 }
});
modeButton.addEventListener("click",()=>setMode(!readingMode,true));
fontDecrease.addEventListener("click",()=>setFontSize(readerScale-25));
fontIncrease.addEventListener("click",()=>setFontSize(readerScale+25));
document.getElementById("print").addEventListener("click",()=>window.print());
document.addEventListener("keydown",e=>{
 if(e.key==="Escape"&&!toc.hidden){toggleToc(false);tocToggle.focus();return}
 if(readingMode||!toc.hidden||e.altKey||e.ctrlKey||e.metaKey)return;
 if(e.target?.matches("input,textarea,select,button,a,[contenteditable]"))return;
 if(!book.contains(document.activeElement)&&document.activeElement!==book)return;
 if(e.key==="ArrowRight"||e.key==="ArrowLeft"){
  e.preventDefault();
  (e.key==="ArrowRight"?next:prev).click();
 }
});
window.addEventListener("resize",()=>{
 if(!flip||readingMode)return;
 cancelAnimationFrame(resizeFrame);
 resizeFrame=requestAnimationFrame(()=>{
  const before=measuredPageSize;
  measuredPageSize=null;
  // PageFlip recalcule ses dimensions lorsqu’il reçoit resize.
  // Ne recomposer que si l'écart dépasse 8 pixels.
  requestAnimationFrame(()=>{
   reconcileFlipDimensions();
   if(!measuredPageSize)measuredPageSize=before;
   fitPages();
  });
 });
});
window.addEventListener("hashchange",()=>{
 if(readingMode)return;
 const m=/^#page-(\d+)$/.exec(location.hash);
 if(m)turnTo(Number(m[1])-1);
});
window.addEventListener("load",()=>{
 const ready=document.fonts?.ready||Promise.resolve();
 ready.then(init).catch(init);
},{once:true});

})();