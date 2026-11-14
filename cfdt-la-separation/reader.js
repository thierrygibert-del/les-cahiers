/* Les Cahiers — édition recomposée : 18 pages de lecture dense */
(function(){
"use strict";
const original=window.CAHIER_PAGES || [];
const groups=[[0],[1,2],[3],[4,5],[6,7],[8,9],[10,11],[12,13],[14,15],[16,17],[18,19],[30,20],[28,29],[21,22],[23,24],[25],[26],[27]];
const pages=groups.map(indices=>indices.map(i=>original[i]));
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
 const title=groupIndex===0?'<h2>CFDT :<br><em>la séparation</em></h2>':first?'<h2>'+p[1]+'</h2>':'<h3>'+p[1]+'</h3>';
 const source=p[3]?'<a target="_blank" rel="noopener noreferrer" href="'+p[3]+'">'+safe(new URL(p[3]).hostname)+' ↗</a>':"";
 let body=p[2];
 if(groupIndex===4 && partIndex===1)body=portrait()+body;
 if(groupIndex===13 && partIndex===1)body='<div class="closing">'+body+'</div>';
 return '<div class="'+sectionClass+'"><div class="section">'+safe(p[0])+'</div>'+title+body+'</div>'+
 (source?'<div class="module-source">'+source+'</div>':"");
}
function render(items,i){
 let classes=["page"];
 if(special[i])classes.push(special[i]);
 if(items.length>1)classes.push("composed-page");
 if(i===3||i===5||i===6||i===7||i===9||i===11)classes.push("history-page");
 const main=items.map((p,j)=>section(p,j,i)).join('');
 return '<section class="'+classes.join(' ')+'" data-density="'+(i===0?"hard":"soft")+'"><div class="paper">'+main+'</div>'+
 '<div class="folio"><span>LES CAHIERS · CFDT : LA SÉPARATION</span><span>'+String(i+1).padStart(2,"0")+' / '+pages.length+'</span></div></section>';
}
if(original.length!==31){
 document.getElementById("status").textContent="Le contenu du cahier est incomplet. Veuillez actualiser la page.";return
}
const markup=pages.map(render);
book.innerHTML=markup.join('');
readall.innerHTML=markup.join('');
printbook.innerHTML=markup.join('');
progressRoot.setAttribute("aria-valuemax",String(pages.length));
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
 "1965–1971 · Vote des communaux et suites de la scission","1974–2000 · La fédération Interco","2014–2026 · Laïcité et statuts",
 "1905 et l’Église : questions historiques","Conclusion","Sources primaires","Études et bibliographie"
];
titles.forEach((title,i)=>{
 const button=document.createElement("button");button.type="button";button.dataset.page=String(i);
 button.innerHTML="<strong>"+String(i+1).padStart(2,"0")+"</strong><span>"+safe(title)+"</span>";
 button.addEventListener("click",()=>{toggleToc(false);turnTo(i);if(!document.body.classList.contains("reading"))document.getElementById("stage").scrollIntoView({behavior:"smooth",block:"start"})});
 tocList.appendChild(button);
});
tocToggle.addEventListener("click",()=>toggleToc(toc.hidden));
tocClose.addEventListener("click",()=>toggleToc(false));
function fitPages(){
 for(const p of book.querySelectorAll(".page")){
  if(p.classList.contains("cover"))continue;
  const inner=p.querySelector(".paper");
  if(!inner)continue;
  // Progressive typographic fitting if a combined chapter exceeds the printed page.
  const overflows=()=>inner.scrollHeight>inner.clientHeight+4;
  if(overflows())p.classList.add("tight");
  if(overflows())p.classList.add("very-tight");
 }
}
function init(){
 const match=/^#page-(\d+)$/.exec(location.hash);
 if(match)index=Math.max(0,Math.min(Number(match[1])-1,pages.length-1));
 if(!window.St||!window.St.PageFlip){fallback();return}
 try{
 flip=new window.St.PageFlip(book,{
  width:430,height:608,size:"stretch",minWidth:215,maxWidth:530,minHeight:304,maxHeight:750,
  showCover:true,usePortrait:true,mobileScrollSupport:false,drawShadow:true,maxShadowOpacity:.3,
  flippingTime:window.matchMedia("(prefers-reduced-motion: reduce)").matches?100:670
 });
 flip.on("flip",e=>{index=e.data;sync();updateHash()});
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
window.addEventListener("hashchange",()=>{const m=/^#page-(\d+)$/.exec(location.hash);if(m)turnTo(Number(m[1])-1)});
window.addEventListener("load",init,{once:true});sync();
})();