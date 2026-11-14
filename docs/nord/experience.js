'use strict';
(()=>{
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const hero=document.querySelector('.nord-hero');
document.querySelector('.nord-footer').insertAdjacentHTML('beforeend','<div class="author-invitation"><div><span>САЙТ — ANTON WHITE</span><h2>Теперь представьте<br>здесь свой бизнес.</h2><p>Идея, дизайн и взаимодействие — под характер вашего проекта.</p></div><a href="../index.html#contact">Хочу обсудить свой сайт <span>↗</span></a></div>');
hero.insertAdjacentHTML('afterbegin','<div class="hero-identity" aria-hidden="true">NORD</div><div class="hero-curtain" aria-hidden="true"></div>');
hero.insertAdjacentHTML('beforeend','<button class="replay-light" type="button" aria-label="Повторить появление автомобиля">↻ <span>Ещё раз</span></button>');
function reveal(){hero.classList.remove('light-on');requestAnimationFrame(()=>requestAnimationFrame(()=>hero.classList.add('light-on')))}
hero.querySelector('.replay-light').addEventListener('click',reveal);reveal();
const chapters=[
{key:'paint',title:'ЛИНИЯ.\nБЕЗ ЛИШНЕГО.',name:'Кузов',text:'Свет скользит по кузову. Чёткое отражение начинается с внимания к поверхности.',service:'polish',action:'Выбрать полировку'},
{key:'lights',title:'ЯСНОСТЬ.\nВ КАЖДОЙ ДЕТАЛИ.',name:'Оптика',text:'Прозрачная оптика возвращает передней части автомобиля выразительность. Начинаем с оценки состояния рассеивателя.',service:'lights',action:'Выбрать уход за фарами'},
{key:'wheels',title:'ХАРАКТЕР.\nДО ПОСЛЕДНЕЙ СПИЦЫ.',name:'Диски',text:'Тормозная пыль скрывает геометрию. Бережная очистка позволяет снова увидеть каждую грань.',service:'wheels',action:'Выбрать очистку дисков'},
{key:'leather',title:'КОМФОРТ.\nБЛИЖЕ К ВАМ.',name:'Салон',text:'Матовая кожа, чистая фактура, внимание к местам, которых вы касаетесь каждый день.',service:'leather',action:'Выбрать уход за кожей'}
];
const journey=document.createElement('section');journey.id='journey';journey.className='detail-journey';journey.setAttribute('aria-label','Путешествие по деталям автомобиля');
journey.innerHTML='<div class="journey-stage"><div class="journey-frames" aria-hidden="true">'+chapters.map((c,i)=>'<div class="journey-frame '+(i===0?'active':'')+'" style="background-image:url(../assets/nord-result-'+c.key+'.webp)"></div>').join('')+'</div><div class="journey-shade"></div><div class="journey-top"><span>NORD / ВНИМАНИЕ МЕНЯЕТ ВСЁ</span><a href="#result">К сравнению результатов ↓</a></div><div class="journey-copy"><span class="journey-number">01 / 04</span><h2></h2><p></p><div class="journey-actions"><button class="journey-add" type="button"></button><a href="#care" class="journey-card">Моя карта ухода ↗</a></div></div><div class="journey-bottom"><div class="journey-tabs" role="group" aria-label="Выбрать деталь">'+chapters.map((c,i)=>'<button type="button" data-chapter="'+i+'" aria-pressed="'+(i===0)+'"><span>0'+(i+1)+'</span>'+c.name+'</button>').join('')+'</div><span class="journey-scroll">ЛИСТАЙТЕ — ДЕТАЛИ ПРИБЛИЖАЮТСЯ</span></div><div class="journey-progress" aria-hidden="true"><i></i></div></div>';
document.querySelector('.nord-strip').after(journey);
const frames=[...journey.querySelectorAll('.journey-frame')],tabs=[...journey.querySelectorAll('[data-chapter]')],add=journey.querySelector('.journey-add');let current=-1;
function sync(){const source=document.querySelector('[data-add-service="'+chapters[Math.max(0,current)].service+'"]');const selected=source?.getAttribute('aria-pressed')==='true';add.textContent=selected?'В карте ухода ✓':chapters[Math.max(0,current)].action+' ＋';add.setAttribute('aria-pressed',String(selected));const count=document.querySelectorAll('[data-add-service][aria-pressed="true"]').length;journey.querySelector('.journey-card').textContent='Моя карта ухода'+(count?' · '+count:'')+' ↗';document.querySelector('.header-care').innerHTML='Моя карта'+(count?' · '+count:' ухода')+' <span>↗</span>'}
function select(index){if(index===current)return;current=index;const c=chapters[index];frames.forEach((f,i)=>f.classList.toggle('active',i===index));tabs.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));journey.querySelector('h2').textContent=c.title;journey.querySelector('.journey-copy>p').textContent=c.text;journey.querySelector('.journey-number').textContent='0'+(index+1)+' / 04';sync()}
select(0);
function scrollMode(){return !reduced.matches&&innerWidth>700&&innerHeight>=760}
tabs.forEach((b,i)=>b.addEventListener('click',()=>{if(scrollMode()){const y=journey.getBoundingClientRect().top+scrollY;scrollTo({top:y+(journey.offsetHeight-innerHeight)*(i+.15)/4,behavior:'smooth'})}else select(i)}));
add.addEventListener('click',()=>{document.querySelector('[data-add-service="'+chapters[current].service+'"]').click();sync()});
new MutationObserver(sync).observe(document.querySelector('#service-list'),{subtree:true,attributes:true,attributeFilter:['aria-pressed']});
let scheduled=false;function render(){scheduled=false;const r=journey.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0&&scrollMode()){const p=Math.max(0,Math.min(.999,-r.top/(journey.offsetHeight-innerHeight)));select(Math.min(3,Math.floor(p*4)));journey.style.setProperty('--journey-progress',p);journey.style.setProperty('--chapter-zoom',1.04+(p*4%1)*.12)}const hr=hero.getBoundingClientRect();if(hr.bottom>0&&!reduced.matches)hero.style.setProperty('--hero-drift',Math.max(0,-hr.top)*.18+'px')}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(render)}}addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduced.addEventListener('change',schedule);render();
document.querySelector('.hero-inspect').href='#journey';document.querySelector('.hero-inspect>span').textContent='ЧЕТЫРЕ ДЕТАЛИ / ОДИН ХАРАКТЕР';document.querySelector('.hero-inspect b').innerHTML='Начать путешествие <span>↓</span>';
document.querySelectorAll('.result-card').forEach((card,index)=>{
const compare=card.querySelector('.finish-compare'),range=compare.querySelector('input');
const modes=document.createElement('div');modes.className='inspection-modes';modes.setAttribute('role','group');modes.setAttribute('aria-label','Режим сравнения: '+card.querySelector('h3').textContent);modes.innerHTML='<button type="button" aria-pressed="true">До / после</button><button type="button" aria-pressed="false">Фонарик ↗</button>';compare.before(modes);
const lens=document.createElement('div');lens.className='inspection-lens';lens.setAttribute('aria-hidden','true');compare.append(lens);
const hint=document.createElement('p');hint.className='inspection-hint';hint.textContent='Тяните границу, чтобы сравнить поверхность';compare.after(hint);
const buttons=[...modes.querySelectorAll('button')];let flashlight=false;
buttons.forEach((b,i)=>b.addEventListener('click',()=>{flashlight=i===1;compare.classList.toggle('flashlight',flashlight);buttons.forEach((x,j)=>x.setAttribute('aria-pressed',String(j===i)));range.hidden=flashlight;compare.tabIndex=flashlight?0:-1;compare.setAttribute('aria-label',flashlight?'Фонарик: двигайте указателем или стрелками, чтобы увидеть состояние до обработки':'Сравнение поверхности');hint.textContent=flashlight?'В круге света — до ухода. Снаружи — после. Двигайте пальцем, мышью или стрелками.':'Тяните границу, чтобы сравнить поверхность'}));
let x=50,y=50;function move(nx,ny){x=Math.max(0,Math.min(100,nx));y=Math.max(0,Math.min(100,ny));compare.style.setProperty('--light-x',x+'%');compare.style.setProperty('--light-y',y+'%')}
compare.addEventListener('pointermove',e=>{if(!flashlight)return;const r=compare.getBoundingClientRect();move((e.clientX-r.left)/r.width*100,(e.clientY-r.top)/r.height*100)});
compare.addEventListener('pointerdown',e=>{if(!flashlight)return;compare.setPointerCapture(e.pointerId);const r=compare.getBoundingClientRect();move((e.clientX-r.left)/r.width*100,(e.clientY-r.top)/r.height*100)});
compare.addEventListener('keydown',e=>{if(!flashlight||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();move(x+(e.key==='ArrowRight'?5:e.key==='ArrowLeft'?-5:0),y+(e.key==='ArrowDown'?5:e.key==='ArrowUp'?-5:0))});
});
})();
