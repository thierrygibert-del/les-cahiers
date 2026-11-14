/* Les Cahiers — édition recomposée : 18 pages de lecture dense */
(function(){
"use strict";
const original=window.CAHIER_PAGES || [];
const groups=[[0],[1,2],[3],[4,5],[6,7],[8,9],[10,11],[12,13],[14,15],[16,17],[18,19],[30,20],[28,29],[31,21],[22,23],[24,25],[26],[27]];
let pages=groups.map(indices=>indices.map(i=>original[i]));
let pageBases=groups.map((_,i)=>i);
let pageSpecs=[];
const book=document.getElementById("book"),readall=document.getElementById("readall"),printbook=document.getElementById("printbook");
const prev=document.getElementById("prev"),next=document.getElementById("next"),count=document.getElementById("count");
const progress=document.getElementById("progress-bar"),progressRoot=document.querySelector(".reading-progress");
const toc=document.getElementById("toc-panel"),tocToggle=document.getElementById("toc-toggle"),tocClose=document.getElementById("toc-close"),tocList=document.getElementById("toc-list");
let index=0,flip=null;
const special={0:"cover",2:"timeline-page",4:"portrait",8:"dual-page",9:"vote-page",12:"dual-page",14:"dual-page",15:"final-page",16:"sources-page",17:"sources-page"};
function safe(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function portrait(){
 return '<figure class="portrait-figure"><img loading="lazy" src="https://commons.wikimedia.org/wiki/Special:FilePath/Paul_Vignaux.jpg?width=400" alt="Paul Vignaux photographié en 1975" width="145" height="165">'+
 '<figcaption>Paul Vignaux, 1975 · François Vignaux · <a href="https://commons.wikimedia.org/wiki/File:Paul_Vignaux.jpg" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0 ↗</a></figcaption></figure>';
}
function section(p,partIndex,groupIndex){
 const first=partIndex===0,hasTwo=pages[groupIndex].length===2;
 const sectionClass=first?"paper-section primary-section":"paper-section secondary-section";
 const title=p[4]?.origIndex===0?'<h2>CFDT :<br><em>la séparation</em></h2>':first?'<h2>'+p[1]+'</h2>':'<h3>'+p[1]+'</h3>';
 const source=p[3]?'<a target="_blank" rel="noopener noreferrer" href="'+p[3]+'">'+safe(new URL(p[3]).hostname)+' ↗</a>':"";
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
 const stage=document.getElementById("stage");
 const available=stage?.clientWidth||window.innerWidth;
 // Mesurer au plus à la largeur du feuillet A5 ; sur mobile, anticiper
 // les retours à la ligne du mode portrait et les folios.
 const width=Math.max(215,Math.min(430,Math.floor(
   window.innerWidth<=720?available-45:
   window.innerWidth<=1000?Math.min(available-45,355):430
 )));
 return {width,height:Math.round(width*608/430)};
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
function assemble(){
 pageSpecs=paginate();
 pages=pageSpecs.map(x=>displayParts(x.parts));
 pageBases=pageSpecs.map(x=>x.base);
 const markup=pages.map((p,i)=>render(p,i));
 book.innerHTML=markup.join("");
 readall.innerHTML=markup.join("");
 printbook.innerHTML=markup.join("");
 progressRoot.setAttribute("aria-valuemax",String(pages.length));
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
function updateHash(){try{history.replaceState(null,"","#page-"+(index+1))}catch(e){}}
function fallback(){
 flip=null;book.classList.add("simple");
 book.querySelectorAll(".page").forEach((el,j)=>el.hidden=j!==index);
 sync();
}
function turnTo(i){
 index=Math.max(0,Math.min(i,pages.length-1));
 if(document.body.classList.contains("reading")){readall.children[index]?.scrollIntoView({behavior:"smooth",block:"start"})}
 else if(flip){try{flip.turnToPage(index)}catch(e){fallback()}}
 else{book.querySelectorAll(".page").forEach((el,j)=>el.hidden=j!==index)}
 sync();updateHash();
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
 pageBases.forEach((base,i)=>{
 const title=titles[base]+(i>0&&pageBases[i-1]===base?" — suite":"");
 const button=document.createElement("button");button.type="button";button.dataset.page=String(i);
 button.innerHTML="<strong>"+String(i+1).padStart(2,"0")+"</strong><span>"+safe(title)+"</span>";
 button.addEventListener("click",()=>{toggleToc(false);turnTo(i);if(!document.body.classList.contains("reading"))document.getElementById("stage").scrollIntoView({behavior:"smooth",block:"start"})});
 tocList.appendChild(button);
 });
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
 assemble();buildToc();
 const match=/^#page-(\d+)$/.exec(location.hash);
 if(match)index=Math.max(0,Math.min(Number(match[1])-1,pages.length-1));
 if(!window.St||!window.St.PageFlip){fallback();return}
 try{
 flip=new window.St.PageFlip(book,{
  width:430,height:608,size:"stretch",minWidth:215,maxWidth:530,minHeight:304,maxHeight:750,
  showCover:true,usePortrait:true,mobileScrollSupport:false,drawShadow:true,maxShadowOpacity:.3,
  flippingTime:window.matchMedia("(prefers-reduced-motion: reduce)").matches?100:670
 });
 flip.on("flip",e=>{index=e.data;sync();updateHash();requestAnimationFrame(fitPages)});
 flip.loadFromHTML(book.querySelectorAll(".page"));
 requestAnimationFrame(()=>requestAnimationFrame(fitPages));
 if(index>0)flip.turnToPage(index);
 sync();
 }catch(e){fallback()}
}
prev.addEventListener("click",()=>turnTo(index-1));
next.addEventListener("click",()=>turnTo(index+1));
document.getElementById("first").addEventListener("click",()=>{turnTo(0);if(!document.body.classList.contains("reading"))document.getElementById("stage").scrollIntoView({behavior:"smooth",block:"start"})});
document.getElementById("sources").addEventListener("click",()=>{turnTo(pages.length-2);if(!document.body.classList.contains("reading"))document.getElementById("stage").scrollIntoView({behavior:"smooth",block:"start"})});
document.getElementById("continuous").addEventListener("click",()=>{
 const on=document.body.classList.toggle("reading"),b=document.getElementById("continuous");
 b.textContent=on?"Mode feuilletage":"Lecture continue";
 b.setAttribute("aria-pressed",on?"true":"false");
 document.getElementById(on?"readall":"stage").scrollIntoView({behavior:"smooth",block:"start"});
});
document.getElementById("print").addEventListener("click",()=>window.print());
document.addEventListener("keydown",e=>{
 if(e.key==="Escape"&&!toc.hidden){toggleToc(false);tocToggle.focus();return}
 if(e.target&&e.target.matches("input,textarea,select,button,a"))return;
 if(e.key==="ArrowRight")next.click();else if(e.key==="ArrowLeft")prev.click();
});
window.addEventListener("resize",()=>{if(flip)requestAnimationFrame(fitPages)});
window.addEventListener("hashchange",()=>{const m=/^#page-(\d+)$/.exec(location.hash);if(m)turnTo(Number(m[1])-1)});
window.addEventListener("load",init,{once:true});
})();