/* Les Cahiers — lecteur éditorial, navigation et export */
(function(){
"use strict";
const pages=window.CAHIER_PAGES||[];
const book=document.getElementById("book");
const readall=document.getElementById("readall");
const printbook=document.getElementById("printbook");
const prev=document.getElementById("prev");
const next=document.getElementById("next");
const count=document.getElementById("count");
const progress=document.getElementById("progress-bar");
const progressRoot=document.querySelector(".reading-progress");
const toc=document.getElementById("toc-panel");
const tocToggle=document.getElementById("toc-toggle");
const tocClose=document.getElementById("toc-close");
const tocList=document.getElementById("toc-list");
let index=0,flip=null,ready=false;
const chapterPages=new Map([[4,"1919"],[6,"1937"],[9,"1946"],[11,"1957"],[16,"1964"],[21,"2014"]]);
const specialClasses=new Map([[0,"cover"],[3,"timeline-page"],[7,"portrait"],[15,"dual-page"],[17,"vote-page"],[23,"dual-page"],[25,"final-page"],[26,"sources-page"],[27,"sources-page"]]);
function safe(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function portrait(){
return '<figure class="portrait-figure">'+
'<img loading="lazy" src="https://commons.wikimedia.org/wiki/Special:FilePath/Paul_Vignaux.jpg?width=400" alt="Photographie de Paul Vignaux en 1975" width="230" height="220">'+
'<figcaption>Paul Vignaux, 1975 · Photo : François Vignaux · <a href="https://commons.wikimedia.org/wiki/File:Paul_Vignaux.jpg" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0 / Wikimedia Commons ↗</a></figcaption>'+
'</figure>';
}
function render(p,i){
 const types=["page"];if(chapterPages.has(i))types.push("chapter");if(specialClasses.has(i))types.push(specialClasses.get(i));
 const source=p[3]?'<div class="source">ARCHIVE OU ÉTUDE · <a href="'+p[3]+'" target="_blank" rel="noopener noreferrer">'+safe(new URL(p[3]).hostname)+' ↗</a></div>':"";
 const picture=i===7?portrait():"";
 const headline= i===0?'<h2>CFDT :<br><em>la séparation</em></h2>':"<h2>"+p[1]+"</h2>";
 return '<section class="'+types.join(" ")+'"'+(chapterPages.has(i)?' data-epoch="'+chapterPages.get(i)+'"':'')+' data-density="'+(i===0?"hard":"soft")+'">'+
 '<div class="paper"><div class="section">'+safe(p[0])+'</div>'+headline+picture+p[2]+source+'</div>'+
 '<div class="folio"><span>LES CAHIERS · CFDT : LA SÉPARATION</span><span>'+String(i+1).padStart(2,"0")+' / '+pages.length+'</span></div></section>';
}
if(!pages.length){document.getElementById("status").textContent="Le cahier n'a pas pu être chargé. Réessayez en actualisant la page.";return}
const html=pages.map(render);
book.innerHTML=html.join("");
readall.innerHTML=html.join("");
printbook.innerHTML=html.join("");
function updateHash(){
try{history.replaceState(null,"","#page-"+(index+1))}catch(e){}
}
function sync(){
count.textContent=String(index+1).padStart(2,"0")+" / "+String(pages.length).padStart(2,"0");
prev.disabled=index===0;next.disabled=index===pages.length-1;
const percentage=((index+1)/pages.length*100).toFixed(2)+"%";
progress.style.width=percentage;
progressRoot.setAttribute("aria-valuenow",String(index+1));
tocList.querySelectorAll("button").forEach(btn=>{
 const here=Number(btn.dataset.page)===index;
 btn.setAttribute("aria-current",here?"page":"false");
 btn.classList.toggle("active",here);
});
}
function moveTo(i){
index=Math.max(0,Math.min(i,pages.length-1));
if(document.body.classList.contains("reading")){
 const target=readall.children[index];if(target)target.scrollIntoView({behavior:"smooth",block:"start"});
}else if(flip){
try{flip.turnToPage(index)}catch(e){fallback()}
}else{
const els=book.querySelectorAll(".page");
els.forEach((el,j)=>{el.hidden=j!==index});
}
sync();updateHash();
}
function toggleToc(open){
toc.hidden=!open;tocToggle.setAttribute("aria-expanded",open?"true":"false");
if(open){toc.scrollIntoView({behavior:"smooth",block:"nearest"})}
}
const headings=[
[0,"Couverture"],[1,"Avant-propos"],[3,"Chronologie"],
[4,"1919 · La CFTC"],[6,"1937 · Le SGEN"],[7,"Paul Vignaux"],
[9,"1946 · Reconstruction"],[11,"1957 · Laïcité syndicale"],
[13,"Eugène Descamps"],[14,"Les oppositions"],
[16,"Le congrès de 1964"],[17,"Le vote"],
[18,"Les nouveaux statuts"],[19,"Deux fidélités"],
[21,"L'année 2014"],[22,"La CFDT en 2026"],
[23,"1905 / 1964"],[25,"Conclusion"],[26,"Bibliographie"]
];
headings.forEach(([i,title])=>{
const b=document.createElement("button");b.type="button";
b.dataset.page=String(i);
b.innerHTML="<strong>"+String(i+1).padStart(2,"0")+"</strong><span>"+safe(title)+"</span>";
b.addEventListener("click",()=>{toggleToc(false);moveTo(i);document.getElementById("stage").scrollIntoView({behavior:"smooth",block:"start"})});
tocList.appendChild(b);
});
tocToggle.addEventListener("click",()=>toggleToc(toc.hidden));
tocClose.addEventListener("click",()=>toggleToc(false));
document.addEventListener("keydown",e=>{
 if(e.key==="Escape"&&!toc.hidden){toggleToc(false);tocToggle.focus();return}
 if(e.target&&e.target.matches("input,textarea,select,button,a"))return;
 if(e.key==="ArrowRight"){next.click()}else if(e.key==="ArrowLeft"){prev.click()}
});
function fallback(){
flip=null;book.classList.add("simple");
book.querySelectorAll(".page").forEach((el,j)=>{el.hidden=j!==index});
sync();
}
function init(){
const initial=/^#page-(\d+)$/.exec(location.hash);
index=initial?Math.min(Math.max(Number(initial[1])-1,0),pages.length-1):0;
if(!window.St||!window.St.PageFlip){fallback();return}
try{
flip=new window.St.PageFlip(book,{
width:430,height:608,size:"stretch",minWidth:215,maxWidth:530,minHeight:304,maxHeight:750,
showCover:true,usePortrait:true,mobileScrollSupport:false,drawShadow:true,maxShadowOpacity:.29,
flippingTime:window.matchMedia("(prefers-reduced-motion: reduce)").matches?90:700
});
flip.on("flip",e=>{index=e.data;sync();updateHash()});
flip.loadFromHTML(book.querySelectorAll(".page"));
if(index>0)flip.turnToPage(index);
ready=true;sync();
}catch(e){fallback()}
}
prev.addEventListener("click",()=>moveTo(index-1));
next.addEventListener("click",()=>moveTo(index+1));
document.getElementById("first").addEventListener("click",()=>moveTo(0));
document.getElementById("sources").addEventListener("click",()=>moveTo(pages.length-2));
document.getElementById("continuous").addEventListener("click",()=>{
 const on=document.body.classList.toggle("reading");
 const btn=document.getElementById("continuous");
 btn.textContent=on?"Mode feuilletage":"Lecture continue";
 btn.setAttribute("aria-pressed",on?"true":"false");
 const dest=document.getElementById(on?"readall":"stage");
 dest.scrollIntoView({behavior:"smooth",block:"start"});
});
document.getElementById("print").addEventListener("click",()=>window.print());
window.addEventListener("hashchange",()=>{
 const m=/^#page-(\d+)$/.exec(location.hash);if(m){moveTo(Number(m[1])-1)}
});
window.addEventListener("load",init,{once:true});
sync();
})();