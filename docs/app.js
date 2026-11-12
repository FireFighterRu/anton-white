const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Открыть меню');nav.classList.remove('is-open');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');nav.classList.toggle('is-open',open);});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
const mobile=matchMedia('(max-width:700px)');
function adaptMenu(){if(!mobile.matches)closeMenu();}
adaptMenu();mobile.addEventListener('change',adaptMenu);
document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();});});
document.querySelector('#max-contact').addEventListener('click',()=>document.querySelector('#max-dialog').showModal());
let toastTimer;function toast(message){const el=document.querySelector('.toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3000);}
document.querySelectorAll('.copy-phone').forEach(button=>button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText('+79154639612');toast('Номер скопирован');}catch{toast('Номер для связи: +7 915 463-96-12');}}));
