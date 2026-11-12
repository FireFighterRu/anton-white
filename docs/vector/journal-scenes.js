'use strict';
// Three explanatory cover studies. Geometry and movement are illustrative, not simulation data.
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion:reduce)'),items=[];
 const TAU=Math.PI*2;
 function path(c,points,stroke,width=1,fill){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));if(fill){c.closePath();c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}}
 function point(c,x,y,r,color){c.beginPath();c.arc(x,y,r,0,TAU);c.fillStyle=color;c.fill()}
 function base(c,w,h){const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#081322');g.addColorStop(.6,'#153246');g.addColorStop(1,'#07101b');c.fillStyle=g;c.fillRect(0,0,w,h);c.strokeStyle='#82bbd30d';c.lineWidth=1;for(let x=0;x<w;x+=30){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke()}for(let y=0;y<h;y+=30){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke()}}
 function air(c,w,h,t){
  const cx=w*.48,cy=h*.50,len=w*.56,angle=-.07-.045*Math.sin(t*.45);
  c.save();c.translate(cx,cy);c.rotate(angle);
  const profile=(u,side)=>{const thick=.60*(.2969*Math.sqrt(u)-.126*u-.3516*u*u+.2843*u*u*u-.1036*u*u*u*u);return[(u-.5)*len,(-.035*Math.sin(u*Math.PI)+side*thick)*len]};
  for(let n=-9;n<=9;n++){if(!n)continue;const y=n*h*.041;const line=[];for(let k=0;k<=70;k++){const x=-w*.65+k*w*1.3/70;const bell=Math.exp(-Math.pow((x+len*.12)/(len*.52),2));line.push([x,y+Math.sign(n)*len*.16*bell*Math.exp(-Math.abs(n)*.19)-len*.035*bell])}path(c,line,`rgba(116,220,244,${.10+(9-Math.abs(n))*.018})`,.8);
   for(let j=0;j<3;j++){const u=((t*.16+j/3+n*.037)%1+1)%1,x=-w*.65+u*w*1.3,bell=Math.exp(-Math.pow((x+len*.12)/(len*.52),2)),yy=y+Math.sign(n)*len*.16*bell*Math.exp(-Math.abs(n)*.19)-len*.035*bell;const grad=c.createLinearGradient(x-24,yy,x,yy);grad.addColorStop(0,'#6cd3f000');grad.addColorStop(1,'#c0f8ff');path(c,[[x-18,yy],[x,yy]],grad,1.7)}
  }
  const outline=[];for(let i=0;i<=65;i++)outline.push(profile(i/65,-1));for(let i=65;i>=0;i--)outline.push(profile(i/65,1));
  const metal=c.createLinearGradient(0,-len*.08,0,len*.08);metal.addColorStop(0,'#e5f6fa');metal.addColorStop(.22,'#698b9d');metal.addColorStop(.49,'#15364d');metal.addColorStop(.65,'#a4c6cb');metal.addColorStop(1,'#152c41');c.shadowBlur=18;c.shadowColor='#5db8cf55';path(c,outline,'#c4efff',1,metal);c.shadowBlur=0;
  for(let i=1;i<10;i++){const x=i/10;path(c,[profile(x,-1),profile(x,1)],'#d6f8ff28',.7)}
  c.restore();
 }
 function structure(c,w,h,t){
  const load=.5+.5*Math.sin(t*.65),beam=w*.65,ox=w*.16,oy=h*.68;
  const proj=(x,y,z,deflect=true)=>[ox+x+z*.64,oy-y-z*.36+(deflect?load*Math.pow(x/beam,2)*h*.14:0)];
  const N=9,depth=h*.18,height=h*.18;
  // The reference chord remains fixed; the loaded truss visibly bends.
  c.setLineDash([4,5]);path(c,[proj(0,0,0,false),proj(beam,0,0,false)],'#b5cad13d',1);c.setLineDash([]);
  for(let n=N-1;n>=0;n--){const x=n/N*beam,x2=(n+1)/N*beam,hot=1-n/N;
   const col=`hsl(${190-hot*load*166} 65% ${46+hot*15}%)`;
   path(c,[proj(x,height,0),proj(x2,height,0),proj(x2,height,depth),proj(x,height,depth)],'#9fd9f033',.7,`rgba(113,161,181,${.09+.1*Math.sin(t*.2+n*.2)**2})`);
   for(const z of [depth,0]){path(c,[proj(x,0,z),proj(x2,0,z)],col,3);path(c,[proj(x,height,z),proj(x2,height,z)],col,3);path(c,[proj(x,0,z),proj(x,height,z),proj(x2,0,z)],'#97bdd2',1.7)}
   path(c,[proj(x,0,0),proj(x,0,depth),proj(x,height,depth),proj(x,height,0)],'#accad9',1.2);
   for(const y of [0,height]){const a=proj(x,y,0);point(c,...a,2.4,'#e2eff8')}
  }
  for(let j=1;j<7;j++){const x=beam*j/7,a=proj(x,height,depth*.5),pulse=5+load*10;path(c,[[a[0],a[1]-35-pulse],[a[0],a[1]-9]],'#9ce7f1',1.5);path(c,[[a[0]-3,a[1]-14],[a[0],a[1]-9],[a[0]+3,a[1]-14]],'#9ce7f1',1.5)}
  path(c,[proj(0,-12,-8,false),proj(0,height+14,-8,false),proj(0,height+14,depth+10,false),proj(0,-12,depth+10,false)],'#5c7a8f',1,'#263e51');
  for(let j=0;j<6;j++){const y=j*(height+26)/6-12;path(c,[proj(0,y,-8,false),proj(-10,y-8,-8,false)],'#a1bbc5',1)}
 }
 function prototype(c,w,h,t){
  const phase=(t%14)/14,solid=.5-.5*Math.cos(TAU*phase),yaw=-.55+Math.sin(t*.22)*.16;
  const proj=(x,y,z)=>{const X=x*Math.cos(yaw)-z*Math.sin(yaw),Z=x*Math.sin(yaw)+z*Math.cos(yaw);return[w*.5+X*w*.085,h*.49+Z*h*.12-y*h*.16]};
  const faces=[];
  // A continuous loft: blueprint ribs progressively acquire a skin.
  for(let j=0;j<24;j++){const z=-2.8+j*5.6/24,z2=z+5.6/24;
   const radius=z=>.39*Math.pow(Math.max(0,1-(z/2.8)**2),.6);
   for(let k=0;k<14;k++){const a=k*TAU/14,b=(k+1)*TAU/14;faces.push({p:[[radius(z)*Math.cos(a),radius(z)*Math.sin(a),z],[radius(z2)*Math.cos(a),radius(z2)*Math.sin(a),z2],[radius(z2)*Math.cos(b),radius(z2)*Math.sin(b),z2],[radius(z)*Math.cos(b),radius(z)*Math.sin(b),z]],shade:k/14})}}
  for(const side of [-1,1])for(let i=0;i<20;i++){const x=side*i*.21,x2=side*(i+1)*.21,lead=x=>-.9+Math.abs(x)*.47,trail=x=>1.25+Math.abs(x)*.19;faces.push({p:[[x,.05,lead(x)],[x2,.05,lead(x2)],[x2,.05,trail(x2)],[x,.05,trail(x)]],shade:i/20});faces.push({p:[[side*.2,.1,2],[side*1.35,.2,2.3],[side*1.35,.2,2.7],[side*.2,.1,2.5]],shade:.6})}
  faces.sort((a,b)=>a.p.reduce((s,p)=>s+p[2],0)-b.p.reduce((s,p)=>s+p[2],0));
  for(const f of faces){const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,`rgba(220,241,248,${solid*.95})`);g.addColorStop(.55,`rgba(80,132,158,${solid*.95})`);g.addColorStop(1,`rgba(27,58,83,${solid*.95})`);path(c,f.p.map(p=>proj(...p)),`rgba(147,214,240,${.14+(1-solid)*.45})`,.65,g)}
  path(c,[proj(0,0,1.6),proj(0,.85,2.2),proj(0,0,2.8)],'#b7dfed',.8,`rgba(123,169,190,${solid*.8})`);
  // Dimension extensions stay attached to the geometry, not a decorative orbit.
  c.setLineDash([3,4]);path(c,[proj(-4.2,0,1.1),proj(-4.2,0,3.5),proj(4.2,0,3.5),proj(4.2,0,1.1)],'#70a8c366',.8);c.setLineDash([]);
  const x=w*.12+phase*w*.76;const scan=c.createLinearGradient(x-20,0,x+20,0);scan.addColorStop(0,'#9bdff000');scan.addColorStop(.5,'#9bdff023');scan.addColorStop(1,'#9bdff000');c.fillStyle=scan;c.fillRect(x-20,h*.16,40,h*.65);
 }
 const drawFns={air,structure,prototype};
 for(const canvas of document.querySelectorAll('[data-journal-scene]')){
  const item={canvas,c:canvas.getContext('2d',{alpha:false}),visible:false,paused:false,t:0,last:0,dirty:true};items.push(item);
  const button=canvas.parentElement.querySelector('[data-cover-toggle]');
  button.addEventListener('click',()=>{item.paused=!item.paused;button.setAttribute('aria-pressed',String(item.paused));button.setAttribute('aria-label',item.paused?'Воспроизвести анимацию обложки':'Приостановить анимацию обложки');button.textContent=item.paused?'▶':'Ⅱ'});
  new ResizeObserver(()=>item.dirty=true).observe(canvas);
 }
 if(!items.length)return;
 const observer=new IntersectionObserver(entries=>{for(const e of entries){const item=items.find(x=>x.canvas===e.target);item.visible=e.isIntersecting;item.last=0}},{threshold:.1});items.forEach(x=>observer.observe(x.canvas));
 function frame(now){for(const item of items){if(!item.visible||document.hidden||document.querySelector('#film-dialog[open]')){item.last=0;continue}const motion=!item.paused&&!reduced.matches&&!window.vectorMotionPaused;if(motion&&item.last)item.t+=Math.min((now-item.last)/1000,.05);item.last=now;if(!motion&&!item.dirty)continue;const rect=item.canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio,1.5);if(!rect.width||!rect.height)continue;const W=Math.round(rect.width*dpr),H=Math.round(rect.height*dpr);if(item.canvas.width!==W||item.canvas.height!==H){item.canvas.width=W;item.canvas.height=H}item.c.setTransform(dpr,0,0,dpr,0,0);base(item.c,rect.width,rect.height);drawFns[item.canvas.dataset.journalScene](item.c,rect.width,rect.height,item.t);item.dirty=false}requestAnimationFrame(frame)}requestAnimationFrame(frame);
})();
