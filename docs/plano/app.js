const {KEY: STORAGE, BACKUP, read: readStore, recover} = PlanoStorage;
const MAX = 100;
let tasks = [], filter = 'all', editId = null, lastDeleted = null, persisted = true, blocked = false;
let storage;
try { storage = window.localStorage; } catch { storage = {getItem(){throw Error('unavailable')},setItem(){throw Error('unavailable')}}; }
const seed = () => ['Выбрать главное на сегодня','Освободить время для своей идеи','Выйти на небольшую прогулку'].map((text,i)=>({id:crypto.randomUUID(),text,done:false,focus:i===0}));
const status = document.querySelector('#storage-status');
let toastTimer;
function toast(text){const el=document.querySelector('.toast');el.textContent=text;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),4500)}
function load(){const state=readStore(storage);blocked=state.kind==='damaged';persisted=state.kind!=='unavailable';if(state.kind==='ok')tasks=state.tasks;else if(blocked)tasks=[];else if(state.kind==='missing')tasks=[];return state;}
function save(){try{storage.setItem(STORAGE,JSON.stringify(tasks));persisted=true}catch{persisted=false}}
// Serialize cooperating tabs, and always read the latest list before changing it.
async function mutate(change){
  // Keep the unsaved session intact after a failed write instead of rereading an older disk copy.
  if(!persisted && !blocked){const result=change();render();return result!==false;}
  const commit=()=>{const state=readStore(storage);if(state.kind==='damaged'){blocked=true;tasks=[];render();toast('Изменения остановлены: сохранённые данные требуют восстановления.');return false}if(state.kind==='ok')tasks=state.tasks;else if(state.kind==='missing')tasks=[];blocked=false;const result=change();if(result===false){render();return false}save();render();return true;};
  return navigator.locks ? navigator.locks.request(STORAGE,commit) : commit();
}
function button(text,label,cls,action){const b=document.createElement('button');b.type='button';b.textContent=text;b.className=cls;b.setAttribute('aria-label',label);b.addEventListener('click',action);return b}
function render(){
  const active=document.activeElement, row=active?.closest('.task');
  const focusState=row?{id:row.dataset.id,action:active.dataset.action,index:[...row.parentNode.children].indexOf(row)}:null;
  const list=document.querySelector('#tasks');const scrollTop=list.scrollTop;
  const visible=tasks.filter(t=>filter==='active'?!t.done:filter==='done'?t.done:filter==='focus'?t.focus:true);
  list.replaceChildren();
  visible.forEach(task=>{
    const li=document.createElement('li');li.className='task'+(task.done?' done':'');li.dataset.id=task.id;
    const check=button(task.done?'✓':'○',(task.done?'Вернуть в планы: ':'Завершить: ')+task.text,'task-check',()=>mutate(()=>{const t=tasks.find(t=>t.id===task.id);if(t)t.done=!t.done}));check.dataset.action='check';check.setAttribute('aria-pressed',String(task.done));
    const body=document.createElement('div');body.className='task-body';const name=button(task.text,'Редактировать: '+task.text,'task-name',()=>openEdit(task.id));name.dataset.action='name';body.append(name);
    if(task.focus){const tag=document.createElement('span');tag.className='task-tag';tag.textContent='ГЛАВНОЕ';body.append(tag)}
    const actions=document.createElement('div');actions.className='task-actions';
    const star=button(task.focus?'★':'☆',(task.focus?'Убрать из главного: ':'Отметить главным: ')+task.text,'star'+(task.focus?' on':''),()=>mutate(()=>{const t=tasks.find(t=>t.id===task.id);if(t)t.focus=!t.focus}));star.dataset.action='star';star.setAttribute('aria-pressed',String(task.focus));
    const edit=button('✎','Изменить: '+task.text,'edit',()=>openEdit(task.id));edit.dataset.action='edit';
    const remove=button('×','Удалить: '+task.text,'remove',()=>mutate(()=>{const index=tasks.findIndex(t=>t.id===task.id);if(index<0)return;lastDeleted={task:{...tasks[index]},index};tasks.splice(index,1);document.querySelector('.undo-row').hidden=false}));remove.dataset.action='remove';
    actions.append(star,edit,remove);li.append(check,body,actions);list.append(li);
  });
  list.scrollTop=scrollTop;
  if(focusState){const same=[...list.children].find(li=>li.dataset.id===focusState.id);const target=same||list.children[Math.min(focusState.index,list.children.length-1)];(target?.querySelector('[data-action="'+focusState.action+'"]')||document.querySelector('#task-input')).focus({preventScroll:true})}
  const empty=document.querySelector('#empty');empty.hidden=visible.length>0||blocked;empty.textContent=tasks.length===0?'Начните с одной задачи. Что важно сейчас?':filter==='done'?'Здесь появятся завершённые задачи.':filter==='focus'?'Отметьте задачу звёздочкой, чтобы выбрать главное.':'Всё готово. Можно немного выдохнуть.';
  const done=tasks.filter(t=>t.done).length,percent=tasks.length?Math.round(done/tasks.length*100):0;
  document.querySelector('#progress-count').textContent=done+' / '+tasks.length;document.querySelector('#progress-label').textContent=tasks.length&&done===tasks.length?'Все задачи выполнены':'Ваш прогресс';document.querySelector('#progress-fill').style.width=percent+'%';document.querySelector('.progress-track').setAttribute('aria-valuenow',String(percent));
  document.querySelector('#export').disabled=tasks.length===0;document.querySelector('#recovery').hidden=!blocked;document.querySelector('#task-input').disabled=blocked;document.querySelector('#add-form button').disabled=blocked;
  status.textContent=blocked?'Исходные данные защищены от перезаписи':persisted?'Сохранено в этом браузере':'Сохранение недоступно — скачайте список';
  try{document.querySelector('#download-backup').hidden=storage.getItem(BACKUP)===null}catch{document.querySelector('#download-backup').hidden=true}
}
function download(text,name,type='text/plain;charset=utf-8'){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
document.querySelector('#download-damaged').addEventListener('click',()=>{const state=readStore(storage);if(state.kind==='damaged')download(state.raw,'plano-recovery.txt')});
document.querySelector('#download-backup').addEventListener('click',()=>{try{download(storage.getItem(BACKUP)||'','plano-backup.txt')}catch{toast('Не удалось прочитать резервную копию')}});
document.querySelector('#start-fresh').addEventListener('click',async()=>{const run=()=>{try{recover(storage);load();render();document.querySelector('#task-input').focus();toast('Пустой список готов. Исходные данные сохранены в резервной копии.')}catch{toast('Не удалось сохранить резервную копию. Исходный список не изменён.')}};if(navigator.locks)await navigator.locks.request(STORAGE,run);else run()});
window.addEventListener('storage',e=>{if(e.key===STORAGE||e.key===null){if(!persisted&&!blocked){toast('В другой вкладке есть изменения. Скачайте текущий несохранённый список перед перезагрузкой.');return}load();render();toast('Список обновлён в другой вкладке')}});
document.querySelector('#today').textContent=new Intl.DateTimeFormat('ru-RU',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;updateFilters();render()}));
function updateFilters(){document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b.dataset.filter===filter);b.setAttribute('aria-pressed',String(b.dataset.filter===filter))})}
document.querySelector('#add-form').addEventListener('submit',async e=>{e.preventDefault();const input=document.querySelector('#task-input'),text=input.value.trim(),error=document.querySelector('#form-error');if(!text){error.textContent='Введите название задачи.';return}const success=await mutate(()=>{if(tasks.length>=MAX){error.textContent='В списке уже 100 задач. Освободите место для новой.';return false}tasks.unshift({id:crypto.randomUUID(),text,done:false,focus:false});filter='all';updateFilters()});if(success){input.value='';error.textContent='';input.focus();toast('Задача добавлена')}});
document.querySelector('#task-input').addEventListener('input',()=>document.querySelector('#form-error').textContent='');
document.querySelector('#undo').addEventListener('click',()=>mutate(()=>{if(!lastDeleted)return false;if(tasks.length>=MAX){toast('В списке 100 задач. Освободите место для восстановления.');return false}if(!tasks.some(t=>t.id===lastDeleted.task.id))tasks.splice(Math.min(lastDeleted.index,tasks.length),0,lastDeleted.task);lastDeleted=null;document.querySelector('.undo-row').hidden=true;filter='all';updateFilters();document.querySelector('#task-input').focus();toast('Задача восстановлена')}));
const dialog=document.querySelector('#edit-dialog');
function openEdit(id){const task=tasks.find(t=>t.id===id);if(!task)return;editId=id;document.querySelector('#edit-input').value=task.text;document.querySelector('#edit-error').textContent='';dialog.showModal();document.querySelector('#edit-input').focus()}
dialog.addEventListener('close',()=>{const row=[...document.querySelectorAll('.task')].find(li=>li.dataset.id===editId);(row?.querySelector('[data-action="edit"]')||document.querySelector('#task-input')).focus({preventScroll:true})});
document.querySelector('#edit-form').addEventListener('submit',async e=>{e.preventDefault();const text=document.querySelector('#edit-input').value.trim();if(!text){document.querySelector('#edit-error').textContent='Название не должно быть пустым.';return}const success=await mutate(()=>{const task=tasks.find(t=>t.id===editId);if(!task){document.querySelector('#edit-error').textContent='Задача уже удалена в другой вкладке.';return false}task.text=text});if(success){dialog.close();toast('Задача обновлена')}});
dialog.querySelector('.close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close()});
document.querySelector('#export').addEventListener('click',()=>download('﻿PLANO — мой список\n\n'+tasks.map(t=>(t.done?'[✓] ':'[ ] ')+(t.focus?'★ ':'')+t.text).join('\n'),'plano-tasks.txt'));
const menu=document.querySelector('.menu'),nav=document.querySelector('#nav');function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Открыть меню');menu.textContent='☰'}menu.addEventListener('click',()=>{const open=!nav.classList.contains('open');nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');menu.textContent=open?'×':'☰'});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
const initial=load();if(initial.kind==='missing'){tasks=seed();save()}render();


const originalRender=render;render=function(){originalRender();document.dispatchEvent(new Event('plano:change'))};
