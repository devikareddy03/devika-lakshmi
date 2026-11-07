"use strict";

// Navigation
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#nav-links');
const mobile = matchMedia('(max-width: 760px)');
function closeMenu(){
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded','false');
  menuButton.setAttribute('aria-label','Open navigation menu');
  menuButton.textContent='☰';
}
menuButton.hidden=false;
document.documentElement.classList.add('js');
menuButton.addEventListener('click',()=>{
  const open=navigation.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded',String(open));
  menuButton.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu');
  menuButton.textContent=open?'✕':'☰';
});
navigation.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
  if(mobile.matches){closeMenu();const target=document.querySelector(link.hash);target?.setAttribute('tabindex','-1');target?.focus({preventScroll:true});}
}));
document.addEventListener('click',event=>{if(!navigation.contains(event.target)&&!menuButton.contains(event.target))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&navigation.classList.contains('is-open')){closeMenu();menuButton.focus();}});
mobile.addEventListener('change',closeMenu);
const navLinks=[...navigation.querySelectorAll('a')];
const sections=navLinks.map(link=>document.querySelector(link.hash));
let navQueued=false;
function markSection(){
  let active=sections[0];
  const marker=document.querySelector('.site-header').offsetHeight+60;
  sections.forEach(section=>{if(section.getBoundingClientRect().top<=marker)active=section;});
  if(scrollY+innerHeight>=document.documentElement.scrollHeight-3)active=sections.at(-1);
  navLinks.forEach(link=>{if(link.hash==='#'+active.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  navQueued=false;
}
function queueNav(){if(!navQueued){navQueued=true;requestAnimationFrame(markSection);}}
addEventListener('scroll',queueNav,{passive:true});addEventListener('resize',queueNav);markSection();
document.querySelector('#year').textContent=new Date().getFullYear();

// Use a self-contained fallback if any external skill logo is unavailable.
document.querySelectorAll('.skill-icon img').forEach(img=>{
  const fallback=()=>{img.hidden=true;img.nextElementSibling.hidden=false;};
  img.addEventListener('error',fallback);
  if(img.complete&&img.naturalWidth===0)fallback();
});

// Skills: real scrolling supports touch, mouse wheel, arrows, and autoplay.
const viewport=document.querySelector('#skills-viewport');
const track=viewport.querySelector('.skills-track');
const controls=document.querySelector('.skills-controls');
const previous=document.querySelector('#skills-prev');
const next=document.querySelector('#skills-next');
const motion=document.querySelector('#skills-motion-toggle');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=false,hovered=false,focused=false,dragging=false;
let manualUntil=0,lastTime=0;
controls.hidden=false;
function updateControls(){
  previous.disabled=viewport.scrollLeft<=1;
  next.disabled=viewport.scrollLeft>=viewport.scrollWidth-viewport.clientWidth-2;
}
function manualScroll(direction){
  manualUntil=performance.now()+5000;
  viewport.scrollBy({left:direction*Math.max(154,viewport.clientWidth*.7),behavior:reduced.matches?'instant':'smooth'});
}
previous.addEventListener('click',()=>manualScroll(-1));
next.addEventListener('click',()=>manualScroll(1));
viewport.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();manualScroll(event.key==='ArrowLeft'?-1:1);}});
viewport.addEventListener('pointerenter',()=>hovered=true);
viewport.addEventListener('pointerleave',()=>hovered=false);
viewport.addEventListener('focusin',()=>focused=true);
viewport.addEventListener('focusout',()=>focused=false);
viewport.addEventListener('pointerdown',()=>{dragging=true;manualUntil=performance.now()+5000;});
addEventListener('pointerup',()=>{dragging=false;manualUntil=performance.now()+5000;});
addEventListener('pointercancel',()=>dragging=false);
viewport.addEventListener('wheel',()=>manualUntil=performance.now()+5000,{passive:true});
viewport.addEventListener('touchmove',()=>manualUntil=performance.now()+5000,{passive:true});
viewport.addEventListener('scroll',updateControls,{passive:true});
function updateMotion(){
  motion.disabled=reduced.matches;
  motion.textContent=reduced.matches?'Manual browsing':paused?'Resume animation':'Pause animation';
  motion.setAttribute('aria-pressed',String(paused));
  lastTime=0;
}
motion.addEventListener('click',()=>{paused=!paused;updateMotion();});
reduced.addEventListener('change',updateMotion);
new ResizeObserver(updateControls).observe(viewport);
function animateSkills(time){
  const elapsed=lastTime?Math.min(time-lastTime,50):0;lastTime=time;
  if(!paused&&!hovered&&!focused&&!dragging&&!reduced.matches&&!document.hidden&&time>manualUntil){
    const max=viewport.scrollWidth-viewport.clientWidth;
    if(max>0){if(viewport.scrollLeft>=max-1){viewport.scrollLeft=0;manualUntil=time+800;}else viewport.scrollLeft+=elapsed*.035;}
  }
  requestAnimationFrame(animateSkills);
}
updateMotion();updateControls();requestAnimationFrame(animateSkills);

// Contact: open a draft; no message is sent automatically.
const form=document.querySelector('.contact-form');
const status=document.querySelector('#contact-status');
form.addEventListener('submit',event=>{
  event.preventDefault();
  if(!form.reportValidity())return;
  const name=form.elements.name.value.trim();
  const email=form.elements.email.value.trim();
  const message=form.elements.message.value.trim();
  if(!name||!message){status.textContent='Please enter your name and message.';return;}
  const body=`Name: ${name}\nEmail: ${email}\n\n${message}`;
  if(event.submitter?.value==='email'){
    location.href=`mailto:devikareddy952@gmail.com?subject=${encodeURIComponent('Portfolio enquiry from '+name)}&body=${encodeURIComponent(body)}`;
    status.textContent='Your email app will open with a draft. Review it there before sending.';
  }else{
    window.open(`https://wa.me/917569976844?text=${encodeURIComponent(body)}`,'_blank','noopener,noreferrer');
    status.textContent='WhatsApp will open with your message. Review it there before sending.';
  }
});
