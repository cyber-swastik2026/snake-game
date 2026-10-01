// Snake Quest - vanilla JS, no build step
const $=s=>document.querySelector(s),rnd=n=>Math.floor(Math.random()*n);
const ld=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const MODES=[['classic','Classic','🍎','Eat fruit, grow, and keep off the edges and yourself.'],['walls','Walls','🧱','Bricks block your way. Steer around them.'],['noborders','No borders','♾️','No edges, no crashes. Just avoid yourself.'],['portal','Portal','🌀','Step into a portal to pop out of the other.'],['poison','Poison','🫐','Blueberries are poison and shrink you.'],['statue','Statue','🗿','A new stone statue appears with every fruit.'],['twin','Twin','👯','Two mirrored snakes. Keep both alive.'],['peaceful','Peaceful','🕊️','No crashing. Just relax and eat.'],['key','Key','🔑','Grab the key to unlock the fruit.'],['sokoban','Sokoban','📦','Push crates out of your way.'],['light','Light','🔦','It is dark. Follow your glow.'],['mines','Minesweeper','💣','Hidden mines! Numbers show nearby mines.'],['magnet','Magnet','🧲','Fruit drifts toward your head.'],['cheese','Cheese','🧀','Grab the cheese fast for bonus points.'],['shield','Shield','🛡️','A shield saves you from one crash.'],['arrow','Arrow','⬆️','Arrow tiles force you to turn.']];
const FRUITS=['🍎','🍌','🍍','🍇','🎃','🍑','🍐','🍓','🍒','🍊'],APPLES=[1,3,5,7],SPEEDS=[['🐍',130],['🐇',85],['🐢',190]],BOARDS=[['S',14,10],['M',20,14],['L',26,18],['XL',32,22]];
const COLORS=['#4a6fe3','#2cb5b0','#8e4fd1','#e0459f','#e04a3f','#f0902f','#46b34a','#e8c53a'];
const THEMES=[['#f2c25e','#efb35f','#ab583c','#614f29'],['#aad751','#a2d149','#578a34','#3f6a25'],['#3a4a6b','#33425f','#1b2433','#121a28'],['#e6e9ee','#dadee5','#8f98a8','#5d6677'],['#8a5a3c','#7f5236','#3b2418','#28170f'],['#7fd6d6','#74cccc','#2f8f9a','#206670']];
const DIRS=[{x:0,y:-1},{x:1,y:0},{x:0,y:1},{x:-1,y:0}],ARW=['⬆️','➡️','⬇️','⬅️'];
const DEF={fruit:0,mode:0,apples:0,speed:0,board:1,color:0,theme:0};
const HELP='<h3>How to play</h3><p>Move: arrow keys, W A S D, swipe, or the on-screen D-pad (🎮 button).<br>SPACE = play / replay. P or Esc = pause.<br>Open ⚙ to change fruit, mode, speed, board size, snake color and theme.</p>';
const ABOUT='<h3>Snake Quest</h3><p>A colorful Snake game with 16 modes. Your settings and best scores are saved in this browser.</p>';
let S={...DEF,...ld('sq-set',{})},B=ld('sq-best',{}),muted=ld('sq-mute',false);
let W,H,CS=30,G,state='start',more=false,acc=0,last=0,sug=1,ac;
const cv=$('#cv'),ctx=cv.getContext('2d'),card=$('#card'),mid=()=>MODES[S.mode][0],key=(x,y)=>y*W+x;

// ---------- sound ----------
function sfx(n){if(muted)return;try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime,f={eat:[520,780],bad:[300,150],over:[260,80],click:[420,420],shield:[600,300],mode:[400,600]}[n]||[400,400];o.type=n=='over'?'sawtooth':'sine';o.frequency.setValueAtTime(f[0],t);o.frequency.linearRampToValueAtTime(f[1],t+.12);g.gain.setValueAtTime(.1,t);g.gain.exponentialRampToValueAtTime(.001,t+.16);o.connect(g);g.connect(ac.destination);o.start();o.stop(t+.17)}catch(e){}}

// ---------- game setup ----------
function spawn(h){const u=new Set();G.sn.forEach(s=>s.b.forEach(p=>u.add(key(p.x,p.y))));G.fr.forEach(f=>u.add(f.k));[G.obs,G.arr].forEach(m=>m.forEach((v,k)=>u.add(k)));G.mines.forEach(k=>u.add(k));G.portals.forEach(k=>u.add(k));[G.kk,G.cheese&&G.cheese.k,G.shield].forEach(k=>k!=null&&u.add(k));
 for(let i=0,k;i<300;i++){k=rnd(W*H);const x=k%W,y=(k/W)|0;if(u.has(k)||h&&G.sn.some(s=>Math.abs(s.b[0].x-x)+Math.abs(s.b[0].y-y)<5))continue;return k}return rnd(W*H)}
const newFruit=()=>G.fr.push({k:spawn(),p:mid()=='poison'&&Math.random()<.3});
function reset(){const bd=BOARDS[S.board];W=bd[1];H=bd[2];const my=H>>1,m=mid(),n=a=>Math.round(W*H/a);
 G={sn:[{b:[{x:4,y:my},{x:3,y:my},{x:2,y:my}],d:{x:1,y:0},m:0}],fr:[],obs:new Map(),mines:new Set(),arr:new Map(),portals:[],rev:new Map(),kk:null,cheese:null,shield:null,hasKey:false,sh:false,score:0,q:[],tick:0,parts:[],shake:0,started:false};
 if(m=='twin')G.sn.push({b:G.sn[0].b.map(p=>({x:W-1-p.x,y:p.y})),d:{x:-1,y:0},m:1});
 if(m=='walls')for(let i=n(28);i--;)G.obs.set(spawn(1),'brick');
 if(m=='sokoban')for(let i=n(35);i--;)G.obs.set(spawn(1),'crate');
 if(m=='portal'){G.portals.push(spawn(1));G.portals.push(spawn(1))}
 if(m=='mines')for(let i=n(18);i--;)G.mines.add(spawn(1));
 if(m=='arrow')for(let i=n(40);i--;)G.arr.set(spawn(1),rnd(4));
 for(let i=APPLES[S.apples];i--;)newFruit();
 if(m=='key')G.kk=spawn();if(m=='shield')G.shield=spawn();
 updScore();fit()}
function fit(){if(!G)return;const r=$('#stage').getBoundingClientRect();CS=Math.max(10,Math.floor(Math.min((r.width-16)/W,(r.height-16)/H)));const dp=devicePixelRatio||1;cv.width=W*CS*dp;cv.height=H*CS*dp;cv.style.width=W*CS+'px';cv.style.height=H*CS+'px';ctx.setTransform(dp,0,0,dp,0,0)}
const updScore=()=>{$('#sval').textContent=G.score;$('#sfruit').textContent=FRUITS[S.fruit]};
function burst(x,y){for(let i=0;i<10;i++)G.parts.push({x:x+.5,y:y+.5,vx:(Math.random()-.5)*.12,vy:(Math.random()-.5)*.12,l:1,c:COLORS[rnd(8)]})}

// ---------- rules ----------
const bodyAt=(x,y)=>G.sn.some(s=>s.b.some(p=>p.x==x&&p.y==y));
function move(s){const m=mid(),d=s.m?{x:-G.sn[0].d.x,y:G.sn[0].d.y}:G.sn[0].d;s.d=d;
 const wrap=m=='noborders'||m=='peaceful',h=s.b[0];let nx=h.x+d.x,ny=h.y+d.y;
 if(wrap){nx=(nx+W)%W;ny=(ny+H)%H}
 let dead=nx<0||ny<0||nx>=W||ny>=H,k=key(nx,ny);
 if(!dead){const o=G.obs.get(k);
  if(o=='crate'){const cx=nx+d.x,cy=ny+d.y,ck=key(cx,cy);if(cx<0||cy<0||cx>=W||cy>=H||G.obs.has(ck)||bodyAt(cx,cy))dead=true;else{G.obs.delete(k);G.obs.set(ck,'crate')}}else if(o)dead=true;
  if(m!='peaceful'&&s.b.slice(0,-1).some(p=>p.x==nx&&p.y==ny))dead=true;
  if(G.mines.has(k))dead=true}
 if(dead){if(G.sh){G.sh=false;sfx('shield');return 0}return 1}
 if(m=='portal'&&G.portals.includes(k)){const o=G.portals[k==G.portals[0]?1:0];nx=o%W;ny=(o/W)|0;k=o}
 s.b.unshift({x:nx,y:ny});let grow=0;
 if(k==G.kk){G.kk=null;G.hasKey=true;sfx('eat')}
 if(k==G.shield){G.shield=null;G.sh=true;sfx('eat')}
 if(G.cheese&&k==G.cheese.k){G.cheese=null;G.score+=3;grow+=3;sfx('eat');burst(nx,ny)}
 if(G.arr.has(k)){const a=DIRS[G.arr.get(k)];if(a.x!=-d.x||a.y!=-d.y){G.sn[0].d=a;G.q=[]}}
 if(m=='mines'){let c=0;for(let i=-1;i<2;i++)for(let j=-1;j<2;j++)if(nx+i>=0&&nx+i<W&&G.mines.has(key(nx+i,ny+j)))c++;G.rev.set(k,c)}
 const fi=G.fr.findIndex(f=>f.k==k);
 if(fi>=0&&(m!='key'||G.hasKey||G.fr[fi].p)){const f=G.fr.splice(fi,1)[0];
  if(f.p){for(let i=0;i<2&&s.b.length>3;i++)s.b.pop();sfx('bad')}
  else{G.score++;grow++;burst(nx,ny);sfx('eat');
   if(m=='statue')G.obs.set(spawn(1),'stone');
   if(m=='cheese'&&G.score%3==0&&!G.cheese)G.cheese={k:spawn(),ttl:70};
   if(m=='shield'&&!G.sh&&G.shield==null)G.shield=spawn();
   if(m=='key'){G.hasKey=false;G.kk=spawn()}}
  newFruit()}
 s.g=(s.g||0)+grow;let p=null;if(s.g>0)s.g--;else p=s.b.pop();s.tail=p||s.b[s.b.length-1];
 updScore();return 0}
function step(){if(G.q.length)G.sn[0].d=G.q.shift();G.tick++;let dead=0;G.sn.forEach(s=>{if(!dead&&move(s))dead=1});
 if(mid()=='magnet'&&G.tick%3==0){const h=G.sn[0].b[0];G.fr.forEach(f=>{const x=f.k%W,y=(f.k/W)|0,dx=h.x-x,dy=h.y-y;let nx=x,ny=y;if(dx&&Math.abs(dx)>=Math.abs(dy))nx+=Math.sign(dx);else if(dy)ny+=Math.sign(dy);const nk=key(nx,ny);if(nk!=f.k&&!G.obs.has(nk)&&!bodyAt(nx,ny)&&!G.fr.some(o=>o.k==nk))f.k=nk})}
 if(G.cheese&&--G.cheese.ttl<1)G.cheese=null;
 if(dead)over()}
function over(){state='over';G.shake=14;sfx('over');const m=mid();if(G.score>(B[m]||0)){B[m]=G.score;sv('sq-best',B)}sug=(S.mode+1+rnd(15))%16;renderCard()}

// ---------- input ----------
function dir(D){if(state=='over'||state=='pause')return;if(state=='start')play();const d=DIRS[D],b=G.q.length?G.q[G.q.length-1]:G.sn[0].d;
 if(d.x==-b.x&&d.y==-b.y)return;G.started=true;if((d.x!=b.x||d.y!=b.y)&&G.q.length<2)G.q.push(d)}
function play(){if(state=='over')reset();state='run';more=false;acc=0;renderCard()}
const pause=()=>{if(state=='run'){state='pause';renderCard()}},resume=()=>{state='run';renderCard()};
addEventListener('keydown',e=>{if(!$('#modal').hidden)return;const k=e.key.toLowerCase(),D={arrowup:0,w:0,arrowright:1,d:1,arrowdown:2,s:2,arrowleft:3,a:3}[k];
 if(D!==undefined){e.preventDefault();dir(D)}else if(k==' '){e.preventDefault();state=='pause'?resume():state!='run'&&play()}else if(k=='p'||k=='escape')state=='pause'?resume():pause()});
addEventListener('keyup',e=>e.key==' '&&e.preventDefault());
let t0;cv.addEventListener('touchstart',e=>{t0=e.touches[0]},{passive:true});
cv.addEventListener('touchend',e=>{if(!t0)return;const t=e.changedTouches[0],dx=t.clientX-t0.clientX,dy=t.clientY-t0.clientY;if(Math.max(Math.abs(dx),Math.abs(dy))>20)dir(Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0));t0=null});
$('#dpad').addEventListener('pointerdown',e=>{const b=e.target.closest('[data-d]');if(b){e.preventDefault();dir(+b.dataset.d)}});
addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>document.hidden&&pause());

// ---------- UI ----------
const chip=(k,v,h,on)=>`<button class="chip${on?' on':''}" data-k="${k}" data-v="${v}">${h}</button>`;
const row=(l,items)=>`<div class="row"><span>${l}</span><button class="ch" data-s="-1">‹</button><div class="sc">${items.join('')}</div><button class="ch" data-s="1">›</button></div>`;
const snk=c=>`<svg viewBox="0 0 200 60" width="100%" height="70"><rect x="0" y="26" width="150" height="30" rx="15" fill="${c}"/><circle cx="160" cy="34" r="22" fill="${c}"/><circle cx="155" cy="22" r="9" fill="#fff"/><circle cx="173" cy="22" r="9" fill="#fff"/><circle cx="157" cy="23" r="4" fill="#222"/><circle cx="175" cy="23" r="4" fill="#222"/><path d="M158 42q8 7 18 0" stroke="#0005" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
function renderCard(){if(state=='run'){card.hidden=true;return}card.hidden=false;const m=MODES[S.mode];let h='';
 const mrow=row('Mode',MODES.map((x,i)=>chip('mode',i,x[2],i==S.mode)));
 if(state=='pause')h='<h3>Paused</h3><div class="btns"><button class="green big" data-a="resume">▶ Resume</button><button class="green big" data-a="restart">↻ Restart</button></div>';
 else if(more)h=`<div class="hd"><button data-a="back">←</button><b>Settings</b><button data-a="help">?</button></div>`+row('Fruit',FRUITS.map((f,i)=>chip('fruit',i,f,i==S.fruit)))+mrow+`<p class="desc">${m[3]}</p>`+row('Apples',APPLES.map((a,i)=>chip('apples',i,'🍎×'+a,i==S.apples)))+row('Speed',SPEEDS.map((x,i)=>chip('speed',i,x[0],i==S.speed)))+row('Board',BOARDS.map((x,i)=>chip('board',i,x[0],i==S.board)))+row('Color',COLORS.map((x,i)=>chip('color',i,`<i style="background:${x}"></i>`,i==S.color)))+row('Theme',THEMES.map((x,i)=>chip('theme',i,`<i style="background:linear-gradient(135deg,${x[0]} 50%,${x[2]} 50%)"></i>`,i==S.theme)))+'<div class="btns"><button class="green big" data-a="play">▶ Play <kbd>SPACE</kbd></button><button class="green" data-a="dice" title="Randomize">🎲</button><button class="green" data-a="reset" title="Reset">↺</button></div>';
 else if(state=='over'){const n=MODES[sug];h=`<div class="score"><div>${FRUITS[S.fruit]}<b>${G.score}</b></div><div>🏆<b>${B[m[0]]||0}</b></div></div>${snk(COLORS[S.color])}<div class="btns"><button class="green big" data-a="play">↻ Replay <kbd>SPACE</kbd></button><button class="green" data-a="more">⚙</button></div><button class="sug" data-a="sug">${n[2]}<span><b>Try ${n[1]} mode</b><small>${n[3]}</small></span>›</button>`}
 else h=mrow+`<p class="desc">${m[3]}</p><button class="more" data-a="more">⚙ More options</button><div class="btns"><button class="green big" data-a="play">▶ Play <kbd>SPACE</kbd></button></div>`;
 card.innerHTML=h}
card.onclick=e=>{const t=e.target.closest('button');if(!t)return;sfx('click');const d=t.dataset,a=d.a;
 if(d.s){t.parentNode.querySelector('.sc').scrollBy({left:d.s*140,behavior:'smooth'});return}
 if(d.k){S[d.k]=+d.v;apply();return}
 if(a=='play')play();else if(a=='more'||a=='back'){more=a=='more';renderCard()}else if(a=='help')modal(HELP);
 else if(a=='resume')resume();else if(a=='restart'){reset();state='start';play()}
 else if(a=='dice'){S={...S,fruit:rnd(10),apples:rnd(4),speed:rnd(3),board:rnd(4),color:rnd(8),theme:rnd(6)};apply()}
 else if(a=='reset'){S={...DEF};apply()}else if(a=='sug'){S.mode=sug;apply()}};
function theme(){const t=THEMES[S.theme],r=document.documentElement.style;r.setProperty('--a',t[0]);r.setProperty('--b',t[1]);r.setProperty('--bg',t[2]);r.setProperty('--bar',t[3])}
function bar(){$('#modes').innerHTML=MODES.map((x,i)=>`<button class="pill${i==S.mode?' on':''}" data-m="${i}">${x[2]} ${x[1]}</button>`).join('');$('#sfruit').textContent=FRUITS[S.fruit]}
function apply(){sv('sq-set',S);theme();bar();reset();state='start';renderCard()}
$('#modes').onclick=e=>{const t=e.target.closest('[data-m]');if(t){S.mode=+t.dataset.m;more=false;sfx('mode');apply()}};
function modal(h){pause();$('#mbody').innerHTML=h;$('#modal').hidden=false}
$('#mclose').onclick=()=>$('#modal').hidden=true;$('#modal').onclick=e=>e.target.id=='modal'&&($('#modal').hidden=true);
$('#bHelp').onclick=()=>modal(HELP);$('#bInfo').onclick=()=>modal(ABOUT);$('#bSide').onclick=()=>$('#side').classList.toggle('open');
$('#bSet').onclick=()=>{reset();state='start';more=true;renderCard()};
$('#bFs').onclick=()=>{try{(document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()).catch(()=>{})}catch(e){}};
$('#bSnd').onclick=()=>{muted=!muted;sv('sq-mute',muted);$('#bSnd').textContent=muted?'🔇':'🔊';sfx('click')};
$('#bDp').onclick=()=>document.body.classList.toggle('dp');
if(matchMedia('(pointer:coarse)').matches)document.body.classList.add('dp');
$('#bSnd').textContent=muted?'🔇':'🔊';

// ---------- drawing ----------
function em(ch,k,sc=.78){ctx.font=`${CS*sc}px serif`;ctx.fillText(ch,(k%W+.5)*CS,((k/W|0)+.5)*CS+1)}
function snake(s,t){const e=[...s.b,s.tail||s.b[s.b.length-1]],near=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y)<2;if(!(state=='run'&&G.started))t=1;
 const P=s.b.map((_,i)=>near(e[i+1],e[i])?{x:e[i+1].x+(e[i].x-e[i+1].x)*t,y:e[i+1].y+(e[i].y-e[i+1].y)*t}:e[i]),col=G.sh?'#ffcf3d':COLORS[S.color];
 for(const pass of[0,1]){ctx.save();if(!pass)ctx.translate(0,4);ctx.strokeStyle=pass?col:'rgba(0,0,0,.25)';ctx.lineWidth=CS*.74;ctx.lineCap=ctx.lineJoin='round';ctx.beginPath();
  P.forEach((p,i)=>{const X=(p.x+.5)*CS,Y=(p.y+.5)*CS;if(i&&near(P[i-1],p))ctx.lineTo(X,Y);else{ctx.moveTo(X,Y);ctx.lineTo(X,Y)}});ctx.stroke();ctx.restore()}
 const h=P[0],d=s.d,X=(h.x+.5)*CS+d.x*CS*.1,Y=(h.y+.5)*CS+d.y*CS*.1;
 for(const k of[-1,1]){const ex=X-d.y*k*CS*.2,ey=Y+d.x*k*CS*.2;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ex,ey,CS*.17,0,7);ctx.fill();ctx.fillStyle='#222';ctx.beginPath();ctx.arc(ex+d.x*CS*.05,ey+d.y*CS*.05,CS*.08,0,7);ctx.fill()}}
function hint(){const w=CS*3.6,h=CS*2.2,x=(W*CS-w)/2,y=(H*CS-h)/2;ctx.fillStyle='rgba(0,0,0,.55)';ctx.beginPath();ctx.roundRect(x,y,w,h,14);ctx.fill();ctx.fillStyle='#fff';ctx.font=`bold ${CS*.8}px sans-serif`;ctx.fillText('↑',W*CS/2,y+h*.3);ctx.fillText('← ↓ →',W*CS/2,y+h*.7)}
function draw(t){const th=THEMES[S.theme];ctx.save();
 if(G.shake>.5){ctx.translate((Math.random()-.5)*G.shake,(Math.random()-.5)*G.shake);G.shake*=.88}
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){ctx.fillStyle=(x+y)%2?th[1]:th[0];ctx.fillRect(x*CS,y*CS,CS,CS)}
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.shadowColor='rgba(0,0,0,.28)';ctx.shadowBlur=4;ctx.shadowOffsetY=2;
 G.obs.forEach((v,k)=>em(v=='brick'?'🧱':v=='crate'?'📦':'🗿',k));G.portals.forEach(k=>em('🌀',k));G.arr.forEach((v,k)=>em(ARW[v],k,.6));
 if(G.kk!=null)em('🔑',G.kk);if(G.cheese)em('🧀',G.cheese.k);if(G.shield!=null)em('🛡️',G.shield);
 G.fr.forEach(f=>{em(f.p?'🫐':FRUITS[S.fruit],f.k);if(mid()=='key'&&!G.hasKey&&!f.p)em('🔒',f.k,.4)});
 ctx.shadowColor='transparent';
 G.rev.forEach((n,k)=>{if(n){ctx.fillStyle='rgba(0,0,0,.5)';ctx.font=`bold ${CS*.5}px sans-serif`;ctx.fillText(n,(k%W+.5)*CS,((k/W|0)+.5)*CS)}});
 G.sn.forEach(s=>snake(s,t));
 if(mid()=='light'){const h=G.sn[0].b[0],X=(h.x+.5)*CS,Y=(h.y+.5)*CS,g=ctx.createRadialGradient(X,Y,CS*1.5,X,Y,CS*4.5);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(5,5,20,.94)');ctx.fillStyle=g;ctx.fillRect(0,0,W*CS,H*CS)}
 G.parts=G.parts.filter(p=>p.l>0);G.parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.l-=.03;ctx.globalAlpha=Math.max(p.l,0);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x*CS,p.y*CS,CS*.12,0,7);ctx.fill()});ctx.globalAlpha=1;
 if(state=='run'&&!G.started)hint();
 ctx.restore()}
function loop(ts){const dt=Math.min(ts-last,100),sp=SPEEDS[S.speed][1];last=ts;
 if(state=='run'&&G.started){acc+=dt;while(acc>=sp&&state=='run'){acc-=sp;step()}}
 draw(Math.min(acc/sp,1));requestAnimationFrame(loop)}

theme();bar();reset();renderCard();new ResizeObserver(fit).observe($('#stage'));addEventListener('orientationchange',()=>setTimeout(fit,200));requestAnimationFrame(loop);
