
(function(){
"use strict";
const pages=window.CAHIER_PAGES||[];
const book=document.getElementById("book"),readall=document.getElementById("readall"),printbook=document.getElementById("printbook");
const prev=document.getElementById("prev"),next=document.getElementById("next"),count=document.getElementById("count");
let current=0,flip=null;
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
function render(p,i){
 const cls=i===0?"page cover":"page";
 const link=p[3]?'<div class="source">Source : <a target="_blank" rel="noopener noreferrer" href="'+p[3]+'">'+new URL(p[3]).hostname+' ↗</a></div>':"";
 return '<section class="'+cls+'" data-density="'+(i===0?"hard":"soft")+'"><div class="paper"><div class="section">'+esc(p[0])+'</div><h2>'+p[1]+'</h2>'+p[2]+link+'</div><div class="folio"><span>Les Cahiers · CFDT : la séparation</span><span>'+String(i+1).padStart(2,"0")+' / '+pages.length+'</span></div></section>';
}
if(!pages.length){document.getElementById("status").textContent="Les pages n'ont pas pu être chargées.";return;}
const html=pages.map(render);book.innerHTML=html.join("");readall.innerHTML=html.join("");printbook.innerHTML=html.join("");
function sync(){count.textContent=(current+1)+" / "+pages.length;prev.disabled=current===0;next.disabled=current===pages.length-1;}
function jump(i){current=Math.max(0,Math.min(i,pages.length-1));if(flip){flip.turnToPage(current)}else{const children=book.querySelectorAll(".page");children.forEach((el,j)=>el.hidden=j!==current)}sync()}
function fallback(){flip=null;book.classList.add("simple");book.querySelectorAll(".page").forEach((el,i)=>el.hidden=i!==current);sync()}
function init(){
 if(!window.St||!window.St.PageFlip){fallback();return}
 try{
 flip=new window.St.PageFlip(book,{
 width:430,height:608,size:"stretch",minWidth:240,maxWidth:530,minHeight:340,maxHeight:750,
 showCover:true,usePortrait:true,mobileScrollSupport:false,drawShadow:true,maxShadowOpacity:.3,
 flippingTime:window.matchMedia("(prefers-reduced-motion: reduce)").matches?100:650
 });
 flip.on("flip",e=>{current=e.data;sync()});
 flip.loadFromHTML(book.querySelectorAll(".page"));sync()
 }catch(e){fallback()}
}
prev.onclick=()=>jump(current-1);
next.onclick=()=>jump(current+1);
document.getElementById("first").onclick=()=>jump(0);
document.getElementById("sources").onclick=()=>jump(pages.length-2);
document.getElementById("continuous").onclick=()=>{
 const on=document.body.classList.toggle("reading");
 document.getElementById("continuous").textContent=on?"Mode feuilletage":"Lire en continu";
 document.getElementById(on?"readall":"stage").scrollIntoView({behavior:"smooth",block:"start"})
};
document.getElementById("print").onclick=()=>window.print();
document.addEventListener("keydown",e=>{
 if(e.target&&e.target.matches("input,textarea,select,button,a"))return;
 if(e.key==="ArrowRight")next.click();else if(e.key==="ArrowLeft")prev.click();
});
window.addEventListener("load",init,{once:true});
sync();
})();
