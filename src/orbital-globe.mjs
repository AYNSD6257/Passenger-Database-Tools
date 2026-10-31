import { EXPLORER_AIRPORTS, getExplorerAirport } from './explorer-data.mjs';
// Stylized orthographic globe, deliberately not an astronomical simulation.
// Coastlines adapted from Natural Earth public-domain data, bundled locally.
const DEG=Math.PI/180;
function shade(ctx,x,y,r,color){const g=ctx.createRadialGradient(x,y,0,x,y,r);for(const [stop,c] of color)g.addColorStop(stop,c);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
function xyz(lat,lon,centerLon,centerLat){
 const phi=lat*DEG,delta=(lon-centerLon)*DEG,beta=centerLat*DEG;
 const cp=Math.cos(phi),cb=Math.cos(beta),sb=Math.sin(beta);
 return {x:cp*Math.sin(delta),y:sb*cp*Math.cos(delta)-cb*Math.sin(phi),z:cb*cp*Math.cos(delta)+sb*Math.sin(phi)};
}
function interpolate(a,b,t){
 const rad=(x)=>x*DEG;
 const u=[Math.cos(rad(a.lat))*Math.cos(rad(a.lon)),Math.cos(rad(a.lat))*Math.sin(rad(a.lon)),Math.sin(rad(a.lat))];
 const v=[Math.cos(rad(b.lat))*Math.cos(rad(b.lon)),Math.cos(rad(b.lat))*Math.sin(rad(b.lon)),Math.sin(rad(b.lat))];
 const dot=Math.min(1,Math.max(-1,u[0]*v[0]+u[1]*v[1]+u[2]*v[2])),omega=Math.acos(dot);
 const aa=omega<0.00001?1-t:Math.sin((1-t)*omega)/Math.sin(omega);
 const bb=omega<0.00001?t:Math.sin(t*omega)/Math.sin(omega);
 const x=u[0]*aa+v[0]*bb,y=u[1]*aa+v[1]*bb,z=u[2]*aa+v[2]*bb;
 return {lat:Math.atan2(z,Math.hypot(x,y))/DEG,lon:Math.atan2(y,x)/DEG};
}
export function createOrbitalGlobe(canvas,{onSelect=()=>{}}={}){
 const ctx=canvas.getContext('2d');
 if(!ctx)return {setRoutes(){},focus(){},setSelected(){},toggleMotion(){return false;},destroy(){}};
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
 let motion=!reduce.matches,frame=0,destroyed=false,heading=-30,tilt=13,last=0;
 let selected='IAD',routes=[['IAD','LHR']],land=[],points=[],hit=[],pointer=null,drag=false;
 let width=1000,height=530,ratio=1;
 const stars=Array.from({length:190},(_,i)=>({
   x:(Math.sin(i*91.17)*9819.33%1+1)%1,y:(Math.sin(i*51.87)*871.91%1+1)%1,
   r:0.45+(i%5)/5,twinkle:(i%23)/12
 }));
 async function loadLand(){
  try{
   const response=await fetch('./data/land.json');
   if(response.ok){const json=await response.json();if(Array.isArray(json.polygons)){land=json.polygons;if(!motion)begin();}}
  }catch{ /* Graticule and ocean remain if local geography cannot load. */ }
 }
 loadLand();
 function resize(){
  const rect=canvas.getBoundingClientRect();
  width=Math.max(320,rect.width||900);height=Math.max(250,rect.height||520);
  ratio=Math.min(window.devicePixelRatio||1,2);
  canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
  ctx.setTransform(ratio,0,0,ratio,0,0);
 }
 const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
 const airportCoords=(a,cx,cy,r)=>{
  const p=xyz(a.lat,a.lon,heading,tilt);
  return p.z>0?{x:cx+r*p.x,y:cy+r*p.y,z:p.z}:null;
 };
 function draw(timestamp){
  if(destroyed)return;
  const dt=Math.min(Math.max(timestamp-last,0),50);last=timestamp;
  if(motion&&!pointer)heading=(heading+dt*.0025+180)%360-180;
  ctx.clearRect(0,0,width,height);
  const back=ctx.createLinearGradient(0,0,width,height);
  back.addColorStop(0,'#030a1d');back.addColorStop(.52,'#071e38');back.addColorStop(1,'#070917');
  ctx.fillStyle=back;ctx.fillRect(0,0,width,height);
  for(const s of stars){
   const alpha=.3+.45*(.5+.5*Math.sin(timestamp*.001+s.twinkle*9));
   ctx.globalAlpha=motion?alpha:.6;ctx.fillStyle='#eff9ff';
   ctx.beginPath();ctx.arc(s.x*width,s.y*height,s.r,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;
  // Shooting stars and heliocentric ornamentation are artistic, not to scale.
  for(let i=0;i<3;i++){
   const phase=(((timestamp/(5300+i*820))+(i*.37))%1);
   if(phase>.31)continue;
   const sx=(.12+i*.28)*width+phase*width*.60,sy=(.10+i*.17)*height+phase*height*.28;
   const meteor=ctx.createLinearGradient(sx-88,sy-35,sx,sy);
   meteor.addColorStop(0,'rgba(130,212,255,0)');meteor.addColorStop(1,'rgba(200,239,255,.75)');
   ctx.strokeStyle=meteor;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(sx-88,sy-35);ctx.lineTo(sx,sy);ctx.stroke();
  }
  const sunX=width*.88,sunY=height*.21;
  shade(ctx,sunX,sunY,175,[[0,'rgba(255,188,75,.24)'],[.3,'rgba(255,164,62,.09)'],[1,'rgba(255,170,78,0)']]);
  shade(ctx,sunX,sunY,32,[[0,'#fffce5'],[.38,'#ffe4a2'],[.9,'#ffa349'],[1,'rgba(255,151,64,.55)']]);
  ctx.strokeStyle='rgba(116,168,223,.11)';ctx.lineWidth=1.1;
  ctx.beginPath();ctx.ellipse(sunX,height*.62,width*.47,height*.40,-.16,0,Math.PI*2);ctx.stroke();
  const earthX=width*(width<600?.50:.43)+(motion?Math.sin(timestamp*.00013)*5:0),earthY=height*.53;
  const radius=Math.min(height*.405,width*(width<600?.39:.30));
  shade(ctx,earthX,earthY,radius*1.20,[[0,'rgba(17,176,230,.16)'],[.78,'rgba(10,150,218,.12)'],[1,'rgba(0,177,255,0)']]);
  const ocean=ctx.createRadialGradient(earthX-radius*.38,earthY-radius*.47,5,earthX,earthY,radius*1.12);
  ocean.addColorStop(0,'#2f9ebc');ocean.addColorStop(.40,'#0e5b8d');ocean.addColorStop(.8,'#0b2d63');ocean.addColorStop(1,'#040e2c');
  ctx.fillStyle=ocean;ctx.beginPath();ctx.arc(earthX,earthY,radius,0,Math.PI*2);ctx.fill();
  ctx.save();ctx.beginPath();ctx.arc(earthX,earthY,radius,0,Math.PI*2);ctx.clip();
  // Coastlines in orthographic projection; segments beyond horizon remain hidden.
  ctx.fillStyle='rgba(50,176,155,.64)';ctx.strokeStyle='rgba(137,226,192,.33)';ctx.lineWidth=.8;
  for(const polygon of land){
    ctx.beginPath();let drawing=false,visible=0;
    for(const coord of polygon){
      const p=xyz(coord[1],coord[0],heading,tilt);
      if(p.z>0){const x=earthX+radius*p.x,y=earthY+radius*p.y;
        if(!drawing){ctx.moveTo(x,y);drawing=true;}else ctx.lineTo(x,y);visible++;
      }else if(drawing){drawing=false;}
    }
    if(visible>3){ctx.fill();ctx.stroke();}
  }
  ctx.strokeStyle='rgba(151,222,248,.16)';ctx.lineWidth=.7;
  for(let lat=-60;lat<=60;lat+=30){
    ctx.beginPath();let started=false;
    for(let lon=-180;lon<=180;lon+=4){
      const p=xyz(lat,lon,heading,tilt);
      if(p.z>0){const x=earthX+p.x*radius,y=earthY+p.y*radius;if(!started){ctx.moveTo(x,y);started=true;}else ctx.lineTo(x,y);}else started=false;
    }ctx.stroke();
  }
  for(let lon=-180;lon<=180;lon+=30){
    ctx.beginPath();let started=false;
    for(let lat=-89;lat<=89;lat+=4){
      const p=xyz(lat,lon,heading,tilt);
      if(p.z>0){const x=earthX+p.x*radius,y=earthY+p.y*radius;if(!started){ctx.moveTo(x,y);started=true;}else ctx.lineTo(x,y);}else started=false;
    }ctx.stroke();
  }
  const terminator=ctx.createLinearGradient(earthX-radius,earthY,earthX+radius,earthY);
  terminator.addColorStop(0,'rgba(1,8,26,.46)');terminator.addColorStop(.55,'rgba(1,11,30,0)');terminator.addColorStop(1,'rgba(1,10,30,.26)');
  ctx.fillStyle=terminator;ctx.fillRect(earthX-radius,earthY-radius,radius*2,radius*2);
  ctx.restore();
  ctx.strokeStyle='rgba(68,204,242,.72)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(earthX,earthY,radius,0,Math.PI*2);ctx.stroke();
  hit=[];
  // Routes are illustrative geographic great-circle paths, not published flight routes.
  for(const [from,to] of routes){
    const a=getExplorerAirport(from),b=getExplorerAirport(to);if(!a||!b)continue;
    ctx.strokeStyle='rgba(111,226,255,.92)';ctx.lineWidth=2;ctx.shadowColor='#50c6ff';ctx.shadowBlur=11;
    ctx.beginPath();let started=false;
    for(let i=0;i<=90;i++){
      const loc=interpolate(a,b,i/90),p=airportCoords(loc,earthX,earthY,radius);
      if(p){if(!started){ctx.moveTo(p.x,p.y);started=true;}else ctx.lineTo(p.x,p.y);}else started=false;
    }
    ctx.stroke();ctx.shadowBlur=0;
  }
  for(const airport of EXPLORER_AIRPORTS){
    const pos=airportCoords(airport,earthX,earthY,radius);if(!pos)continue;
    const active=selected===airport.code||routes.some(pair=>pair.includes(airport.code));
    const rr=active?3.8:1.7;
    ctx.fillStyle=active?'#f4dfad':'rgba(158,231,255,.67)';
    ctx.beginPath();ctx.arc(pos.x,pos.y,rr,0,2*Math.PI);ctx.fill();
    if(active){
      ctx.strokeStyle=selected===airport.code?'rgba(255,215,118,.82)':'rgba(104,220,246,.55)';
      ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(pos.x,pos.y,rr+4+Math.sin(timestamp*.002)*1.5,0,Math.PI*2);ctx.stroke();
    }
    hit.push({...pos,code:airport.code});
  }
  const moonAngle=timestamp*.00022;
  const moonX=earthX+Math.cos(moonAngle)*radius*1.34,moonY=earthY+Math.sin(moonAngle)*radius*.43;
  ctx.strokeStyle='rgba(156,193,222,.20)';ctx.beginPath();ctx.ellipse(earthX,earthY,radius*1.34,radius*.43,0,0,Math.PI*2);ctx.stroke();
  shade(ctx,moonX,moonY,10,[[0,'#f1f0e9'],[.56,'#b8c7d8'],[1,'#59687d']]);
  if(motion)frame=requestAnimationFrame(draw);
 }
 function begin(){cancelAnimationFrame(frame);last=0;frame=requestAnimationFrame(draw);}
 begin();
 function setRoutes(next){routes=Array.isArray(next)?next.filter(x=>Array.isArray(x)&&x.length===2):[];if(!motion)begin();}
 function setSelected(code){if(!getExplorerAirport(code))return;selected=code;if(!motion)begin();}
 function focus(code){const airport=getExplorerAirport(code);if(!airport)return;selected=code;heading=airport.lon;tilt=Math.max(-55,Math.min(55,airport.lat*.45));onSelect(code);if(!motion)begin();}
 function toggleMotion(){motion=!motion;if(motion)begin();else{cancelAnimationFrame(frame);begin();}return motion;}
 const pos=event=>{const rect=canvas.getBoundingClientRect();return {x:event.clientX-rect.left,y:event.clientY-rect.top};};
 function down(event){pointer=pos(event);drag=false;canvas.setPointerCapture?.(event.pointerId);}
 function move(event){
  if(!pointer){canvas.style.cursor='crosshair';return;}
  const p=pos(event),dx=p.x-pointer.x,dy=p.y-pointer.y;
  if(Math.abs(dx)+Math.abs(dy)>2){drag=true;heading-=dx*.28;tilt=Math.max(-72,Math.min(72,tilt+dy*.2));}
  pointer=p;if(!motion)begin();
 }
 function up(event){
  const p=pos(event);
  if(!drag){let closest=null,dist=18;for(const h of hit){const d=Math.hypot(p.x-h.x,p.y-h.y);if(d<dist){closest=h;dist=d;}}
   if(closest){selected=closest.code;onSelect(selected);if(!motion)begin();}}
  pointer=null;drag=false;
 }
 canvas.addEventListener('pointerdown',down);
 canvas.addEventListener('pointermove',move);
 canvas.addEventListener('pointerup',up);
 canvas.addEventListener('pointercancel',()=>{pointer=null;drag=false;});
 return {setRoutes,setSelected,focus,toggleMotion,destroy(){
   destroyed=true;cancelAnimationFrame(frame);observer.disconnect();
   canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);
 }};
}
