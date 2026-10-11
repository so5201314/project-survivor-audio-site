'use strict';
const bgm=document.getElementById('bgm');
const views=[...document.querySelectorAll('[data-view]')];
const nav=[...document.querySelectorAll('[data-nav]')];
const seek=document.getElementById('seek');
const play=document.getElementById('play-bgm');
const mini=document.getElementById('mini-player');
let currentView='music',hasPlayed=false,seeking=false;
const playIcon='<path d="m9 5 11 7-11 7z" fill="currentColor" stroke="none"/>';
const pauseIcon='<path d="M8 5v14M16 5v14" stroke-width="3"/>';
function time(seconds){if(!Number.isFinite(seconds))return '0:00';return Math.floor(seconds/60)+':'+String(Math.floor(seconds%60)).padStart(2,'0');}
function sync(){
  const running=!bgm.paused;
  play.querySelector('svg').innerHTML=running?pauseIcon:playIcon;
  play.setAttribute('aria-label',running?'暂停山海初见':'播放山海初见');
  document.getElementById('mini-toggle').querySelector('svg').innerHTML=running?pauseIcon:playIcon;
  document.getElementById('mini-toggle').setAttribute('aria-label',running?'暂停音乐':'继续播放音乐');
  document.getElementById('elapsed').textContent=time(bgm.currentTime);
  const length=Number.isFinite(bgm.duration)?bgm.duration:50.5263125;
  document.getElementById('duration').textContent=time(length);
  seek.max=length;
  if(!seeking)seek.value=bgm.currentTime;
  mini.hidden=!hasPlayed||currentView==='qinglan';
  document.body.classList.toggle('has-mini',!mini.hidden);
}
function route(){
  const hash=location.hash.slice(1);
  currentView=hash==='level-qinglan'?'qinglan':hash==='combat'?'combat':'music';
  views.forEach(view=>view.hidden=view.dataset.view!==currentView);
  nav.forEach(link=>{
    const active=link.dataset.nav===(currentView==='combat'?'combat':'music');
    link.classList.toggle('active',active);
    if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
  });
  document.title=currentView==='qinglan'?'青岚谷道 · 音乐 | Project Survivor':currentView==='combat'?'青锋剑 · 音效 | Project Survivor':'关卡音乐 | Project Survivor';
  sync();window.scrollTo({top:0,behavior:'instant'});
}
async function toggleMusic(){
  if(!bgm.paused){bgm.pause();return;}
  try{await bgm.play();hasPlayed=true;document.getElementById('bgm-error').hidden=true;sync();}
  catch{document.getElementById('bgm-error').hidden=false;}
}
play.addEventListener('click',toggleMusic);
document.getElementById('mini-toggle').addEventListener('click',toggleMusic);
['play','pause','ended','loadedmetadata','timeupdate'].forEach(event=>bgm.addEventListener(event,sync));
bgm.addEventListener('play',()=>{hasPlayed=true;sync();});
bgm.addEventListener('error',()=>{document.getElementById('bgm-error').hidden=false;});
seek.addEventListener('input',()=>{seeking=true;document.getElementById('elapsed').textContent=time(Number(seek.value));});
seek.addEventListener('change',()=>{if(Number.isFinite(bgm.duration))bgm.currentTime=Number(seek.value);seeking=false;sync();});
document.getElementById('bgm-loop').addEventListener('change',e=>bgm.loop=e.target.checked);
document.getElementById('bgm-volume').addEventListener('input',e=>bgm.volume=Number(e.target.value));
document.querySelectorAll('.sfx-audio').forEach(a=>a.addEventListener('play',()=>document.querySelectorAll('.sfx-audio').forEach(b=>{if(a!==b)b.pause();})));
const activeShots=new Set();
document.querySelectorAll('[data-sound]').forEach(button=>button.addEventListener('click',async()=>{
  const control=document.getElementById(button.dataset.sound);
  const instance=new Audio(control.currentSrc||control.src);instance.volume=control.volume;
  activeShots.add(instance);instance.addEventListener('ended',()=>activeShots.delete(instance),{once:true});
  try{await instance.play();document.getElementById('sfx-error').hidden=true;}
  catch{activeShots.delete(instance);document.getElementById('sfx-error').hidden=false;}
}));
window.addEventListener('hashchange',route);route();

function showSfxDurations(){
 document.querySelectorAll('.sfx-unit audio').forEach(a=>{
  const update=()=>{if(Number.isFinite(a.duration))a.closest('.sfx-unit').querySelector('.sfx-label span:last-child').textContent=a.duration.toFixed(3)+' 秒';};
  a.addEventListener('loadedmetadata',update);update();
 });
}
showSfxDurations();
