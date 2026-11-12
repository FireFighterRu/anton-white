'use strict';
(()=>{
const TAU=Math.PI*2,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const models=new Map();
function geometry(kind){
 if(models.has(kind))return models.get(kind);
 const faces=[];const add=(pts,color,group=0)=>faces.push({pts,color,group});
 const cargo=kind==='atlas',long=kind==='horizon';
 const length=cargo?8.2:long?6.8:8.7,bodyWidth=cargo?.8:long?.35:.62;
 function loft(cx,cy,start,end,radius,group,color,flatten=1){
  const rings=32,sides=28;
  function pt(i,j){const t=i/rings,z=start+(end-start)*t;const r=radius*Math.pow(Math.sin(Math.PI*t),.62)*(1-.24*t);const a=j/sides*TAU;return[cx+Math.cos(a)*r,cy+Math.sin(a)*r*flatten,z]}
  for(let i=0;i<rings;i++)for(let j=0;j<sides;j++)add([pt(i,j),pt(i+1,j),pt(i+1,j+1),pt(i,j+1)],color,group);
 }
 loft(0,0,-length*.53,length*.47,bodyWidth,0,[173,193,211],cargo?.85:.72);
 // Cambered wing surface: sampled span and chord, with upper/lower skins.
 function wing(side,span,rootChord,tipChord,sweep,zbase,ybase,group){
  const ns=12,nc=10;
  function pt(i,j,skin){const u=i/ns,t=j/nc,chord=rootChord+(tipChord-rootChord)*u;const x=side*(.24+span*u),z=zbase+sweep*u+chord*t;const thickness=.09*(1-u*.75)*Math.sin(Math.PI*t);return[x,ybase+Math.pow(u,3)*.3+skin*thickness,z]}
  for(const skin of [-1,1])for(let i=0;i<ns;i++)for(let j=0;j<nc;j++){let pts=[pt(i,j,skin),pt(i+1,j,skin),pt(i+1,j+1,skin),pt(i,j+1,skin)];if(skin===-1)pts.reverse();add(pts,[157,180,201],group)}
  for(let j=0;j<nc;j++)add([pt(ns,j,1),pt(ns,j,-1),pt(ns,j+1,-1),pt(ns,j+1,1)],[110,140,162],group);
 }
 const span=cargo?5.6:long?8:5.1,sweep=cargo?.5:long?.85:3.5,root=cargo?1.8:long?1.3:3.35;
 for(const s of [-1,1]){
  wing(s,span,root,long?.4:.55,sweep,cargo?-.55:long?-.5:-1.55,cargo?.5:0,1);
  if(cargo||long)wing(s,cargo?2.1:1.8,1.15,.3,.8,2.3,.25,1);
  else{
   const a=[s*.5,.12,2.2],b=[s*1.5,1.3,3.3],c=[s*1.15,1.05,4],d=[s*.45,.12,3.6];
   add([a,b,c,d],[145,169,195],1);add([d,c,b,a],[111,139,164],1);
  }
  const x=s*(cargo?2.25:long?1.1:1.12),y=cargo?.2:-.25;
  loft(x,y,cargo?-.9:.2,cargo?1.55:3.3,cargo?.31:.26,2,[102,129,150],1);
  // Circular fan face with radial blades, never represented as live telemetry.
  const z=cargo?-.92:3.25,r=cargo?.26:.19;
  for(let j=0;j<12;j++){const a=j/12*TAU,b=(j+1)/12*TAU;add([[x,y,z],[x+Math.cos(a)*r,y+Math.sin(a)*r,z],[x+Math.cos(b)*r,y+Math.sin(b)*r,z]],j%2?[20,33,48]:[57,88,113],2)}
  if(cargo||long){for(let j=0;j<4;j++){const a=j/4*TAU;const rx=Math.cos(a),ry=Math.sin(a);add([[x-rx*.1,y-ry*.1,z-.08],[x+rx*.88-ry*.06,y+ry*.88+rx*.06,z-.1],[x+rx*.88+ry*.09,y+ry*.88-rx*.09,z-.1],[x+rx*.12,y+ry*.12,z-.08]],[51,72,90],2)}}
 }
 if(cargo||long){add([[-.06,.1,2.1],[-.06,1.5,3.1],[-.06,1.3,3.9],[-.06,.1,3.8]],[151,179,202],1);add([[.06,.1,3.8],[.06,1.3,3.9],[.06,1.5,3.1],[.06,.1,2.1]],[181,201,219],1)}
 // Smoked canopy follows the upper fuselage.
 loft(0,bodyWidth*.44,-2.55,-.65,cargo?.44:.31,0,[22,47,69],.5);
 models.set(kind,faces);return faces;
}
class Scene{
 constructor(el){this.el=el;this.ctx=el.getContext('2d');this.model=el.dataset.model||'strizh';this.mode=el.dataset.mode||'solid';this.yaw=-.55;this.pitch=.38;this.targetYaw=-.55;this.targetPitch=.38;this.explode=0;this.open=0;this.angle=0;this.speed=1;this.rotate=true;this.time=0;this.visible=false;this.film=el.classList.contains('film-canvas');this.filmTime=0;this.last=0;this.width=0;this.height=0;this.drag=false;this.dirty=true;this.resize=new ResizeObserver(()=>{const b=el.getBoundingClientRect();this.width=b.width;this.height=b.height;const d=Math.min(devicePixelRatio||1,1.5);el.width=Math.round(b.width*d);el.height=Math.round(b.height*d);this.ctx?.setTransform(d,0,0,d,0,0);this.dirty=true});this.resize.observe(el);this.observer=new IntersectionObserver(entries=>{this.visible=entries[0].isIntersecting;this.dirty=true});this.observer.observe(el);if(el.classList.contains('lab-canvas'))this.interact();}
 interact(){let x=0,y=0;this.el.addEventListener('pointerdown',e=>{if(e.button!==0)return;this.drag=true;x=e.clientX;y=e.clientY;this.el.setPointerCapture(e.pointerId)});this.el.addEventListener('pointermove',e=>{if(!this.drag)return;this.targetYaw+=(e.clientX-x)*.009;this.targetPitch=clamp(this.targetPitch+(e.clientY-y)*.006,-.3,1.5);x=e.clientX;y=e.clientY;this.rotate=false;this.dirty=true;this.el.dispatchEvent(new CustomEvent('model-drag'))});const stop=()=>{this.drag=false};this.el.addEventListener('pointerup',stop);this.el.addEventListener('pointercancel',stop)}
 setModel(name){this.model=models.has(name)||['strizh','atlas','horizon'].includes(name)?name:'strizh';this.dirty=true}
 render(dt,paused){
  if(!this.ctx||!this.width||!this.height||!this.visible||document.hidden)return;
  const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const move=!paused&&!reduced;
  if(this.film)this.time=this.filmTime;else if(move)this.time+=dt*this.speed;
  let yaw=this.targetYaw,pitch=this.targetPitch,exp=this.explode;
  if(this.film){const t=this.filmTime,chapter=Math.min(3,Math.floor(t/9)),u=(t%9)/9;yaw=-.8+t*.075;pitch=.32+Math.sin(t*.11)*.22;exp=chapter===1?Math.sin(u*Math.PI)*.95:0;this.mode=chapter===0&&t<4?'wire':chapter===2?'flow':'solid';if(chapter===3){yaw=1.3+u*.3;pitch=.4-u*.22}}
  else if(this.rotate&&move)yaw+=Math.sin(this.time*.25)*.2;
  const ease=reduced?1:Math.min(1,dt*7);this.yaw+=(yaw-this.yaw)*ease;this.pitch+=(pitch-this.pitch)*ease;this.open+=(exp-this.open)*ease;
  if(paused&&!this.dirty&&!this.film&&Math.abs(yaw-this.yaw)<.001&&Math.abs(this.open-exp)<.001)return;
  this.dirty=false;const ctx=this.ctx,W=this.width,H=this.height;ctx.clearRect(0,0,W,H);
  const model=geometry(this.model),span=this.model==='horizon'?17:this.model==='atlas'?12:11.2;
  const scale=Math.min(W/(span+2.4+this.open*2.5),H/(10+this.open))*(this.film?.98:1.04);const cx=this.film?W*(W<600?.54:.64):W*.5,cy=this.film?H*(W<600?.36:.46):H*.47;
  const sy=Math.sin(this.yaw),co=Math.cos(this.yaw),sp=Math.sin(this.pitch),cp=Math.cos(this.pitch),a=this.angle*Math.PI/180;
  const transform=(p,g=0)=>{let[x,y,z]=p;if(g===1){x+=Math.sign(x)*this.open*1.15;y+=this.open*.8}else if(g===2){y-=this.open*1.5;z+=this.open*.4}let ay=y*Math.cos(a)-z*Math.sin(a);z=y*Math.sin(a)+z*Math.cos(a);y=ay;const rx=x*co+z*sy,rz=-x*sy+z*co,ry=y*cp-rz*sp,depth=y*sp+rz*cp;const perspective=1/(1+depth*.018);return{x:cx+rx*scale*perspective,y:cy-ry*scale*perspective,z:depth,rx,ry}};
  // Faint construction grid below the object.
  ctx.lineWidth=.6;ctx.strokeStyle='#8bb8df16';for(let n=-8;n<=8;n+=2){const p=transform([n,-1.35,-6]),q=transform([n,-1.35,6]),r=transform([-8,-1.35,n]),s=transform([8,-1.35,n]);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.moveTo(r.x,r.y);ctx.lineTo(s.x,s.y);ctx.stroke()}
  const halo=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H)*.55);halo.addColorStop(0,'#6a9aca10');halo.addColorStop(1,'#6a9aca00');ctx.fillStyle=halo;ctx.fillRect(0,0,W,H);
  const projected=model.map(f=>{const p=f.pts.map(v=>transform(v,f.group));return{p,color:f.color,z:p.reduce((n,v)=>n+v.z,0)/p.length}}).sort((a,b)=>b.z-a.z);
  for(const f of projected){const p=f.p;const ux=p[1].rx-p[0].rx,uy=p[1].ry-p[0].ry,uz=p[1].z-p[0].z,vx=p[2].rx-p[0].rx,vy=p[2].ry-p[0].ry,vz=p[2].z-p[0].z;let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const len=Math.hypot(nx,ny,nz)||1;nx/=len;ny/=len;nz/=len;const diffuse=Math.abs(nx*-.35+ny*.8+nz*-.45),shine=Math.pow(Math.abs(nz*.8+ny*.6),14)*30;const light=.48+diffuse*.55;
   ctx.beginPath();ctx.moveTo(p[0].x,p[0].y);for(let j=1;j<p.length;j++)ctx.lineTo(p[j].x,p[j].y);ctx.closePath();
   if(this.mode==='wire'){ctx.strokeStyle='#8fc9f068';ctx.lineWidth=.55;ctx.stroke()}else{ctx.fillStyle=`rgb(${f.color.map(c=>Math.round(clamp(c*light+shine,0,255))).join(',')})`;ctx.fill();ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.45;ctx.stroke()}
  }
  // Stream curves illustrate flow direction, not calculated aerodynamic values.
  if(this.mode==='flow'){
   for(let row=-5;row<=5;row++){for(const layer of [-.6,.8]){ctx.beginPath();let points=[];for(let i=0;i<=50;i++){const z=-7+i*.28,x=row*1.05;const def=Math.exp(-z*z*.16)*Math.exp(-x*x*.12);points.push(transform([x+Math.sign(x)*def*.5,layer+def*.65,z]))}points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle=row%2?'#8cd6f84d':'#c0e5ff66';ctx.lineWidth=.8;ctx.stroke();const k=Math.floor(((this.time*.28+row*.1+layer)%1+1)%1*49);const point=points[k];ctx.fillStyle='#c9ecff';ctx.beginPath();ctx.arc(point.x,point.y,1.5,0,TAU);ctx.fill()}}
  }
  // Restrained engine light in cinematic final chapter.
  if(this.film&&this.filmTime>27){for(const side of [-1,1]){const p=transform([side*1.12,-.25,3.3],2);const glow=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,28);glow.addColorStop(0,'#bce9ffb0');glow.addColorStop(.2,'#70b9ed55');glow.addColorStop(1,'#70b9ed00');ctx.fillStyle=glow;ctx.fillRect(p.x-28,p.y-28,56,56)}}
 }
}
const scenes=new Map();document.querySelectorAll('canvas.aircraft').forEach(el=>scenes.set(el,new Scene(el)));let last=0;
function loop(now){requestAnimationFrame(loop);if(now-last<32)return;const dt=Math.min((now-last)/1000,.08)||.033;last=now;for(const s of scenes.values())s.render(dt,window.vectorMotionPaused||false)}requestAnimationFrame(loop);
window.VectorScenes={get:el=>scenes.get(el),all:scenes};
})();
