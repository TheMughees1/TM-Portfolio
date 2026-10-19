const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("#navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

const serviceRows = [...document.querySelectorAll("[data-service-row]")];
function setServiceOpen(row, open) {
  if (!row) return;
  row.classList.toggle("is-open", open);
  const trigger = row.querySelector(".service-trigger");
  const panel = row.querySelector(".service-panel");
  if (trigger) trigger.setAttribute("aria-expanded", String(open));
  if (panel) {
    if (open) panel.hidden = false;
    else panel.hidden = true;
  }
}
serviceRows.forEach((row) => {
  const trigger = row.querySelector(".service-trigger");
  if (trigger) {
    trigger.addEventListener("click", () => {
      const wasOpen = row.classList.contains("is-open");
      serviceRows.forEach((item) => setServiceOpen(item, false));
      setServiceOpen(row, !wasOpen);
    });
  }
});

const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("in-view"));
}

const navSections = document.querySelectorAll("main section[id]");
const navAnchors = document.querySelectorAll(".nav-links a");
if ("IntersectionObserver" in window) {
  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navAnchors.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
        });
      }
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  navSections.forEach((section) => activeObserver.observe(section));
}

(function initParticlePortrait() {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let particles = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let imageData = null;
  const source = new Image();
  source.src = "src/assests/me.png.png";

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.7);
    width = Math.max(1, Math.floor(bounds.width));
    height = Math.max(1, Math.floor(bounds.height));
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createParticles();
  }

  function createParticles() {
    particles = [];
    const cols = Math.max(50, Math.floor(width / 5.2));
    const rows = Math.max(62, Math.floor(height / 5.2));
    const sample = document.createElement("canvas");
    sample.width = cols;
    sample.height = rows;
    const sampleCtx = sample.getContext("2d", { willReadFrequently: true });
    sampleCtx.clearRect(0, 0, cols, rows);
    if (source.complete && source.naturalWidth > 0) {
      const imageRatio = source.naturalWidth / source.naturalHeight;
      const frameRatio = cols / rows;
      let sx = 0, sy = 0, sw = source.naturalWidth, sh = source.naturalHeight;
      if (imageRatio > frameRatio) {
        sw = sh * frameRatio;
        sx = (source.naturalWidth - sw) / 2;
      } else {
        sh = sw / frameRatio;
        sy = source.naturalHeight * 0.12;
        if (sy + sh > source.naturalHeight) sy = (source.naturalHeight - sh) / 2;
      }
      sampleCtx.filter = "grayscale(1) contrast(1.35) brightness(1.12)";
      sampleCtx.drawImage(source, sx, sy, sw, sh, 0, 0, cols, rows);
      sampleCtx.filter = "none";
      try { imageData = sampleCtx.getImageData(0, 0, cols, rows).data; } catch (e) { imageData = null; }
    }
    const centerX = cols / 2;
    const centerY = rows * 0.47;
    for (let y = 2; y < rows - 2; y += 1) {
      for (let x = 2; x < cols - 2; x += 1) {
        const nx = (x - centerX) / (cols * 0.41);
        const ny = (y - centerY) / (rows * 0.48);
        const headMask = nx * nx + ny * ny < 1.02;
        const shoulderMask = y > rows * 0.62 && y < rows * 0.91 &&
          Math.abs(x - centerX) < (y - rows * 0.55) * 1.75;
        if (!headMask && !shoulderMask) continue;
        let brightness = 110;
        let alpha = 0.25;
        if (imageData) {
          const idx = (y * cols + x) * 4;
          const a = imageData[idx + 3] / 255;
          brightness = imageData[idx] * .299 + imageData[idx + 1] * .587 + imageData[idx + 2] * .114;
          if (a < .12) continue;
          if (brightness < 25 && Math.random() > .18) continue;
          alpha = Math.min(.9, .11 + brightness / 255 * .67) * a;
        } else {
          const edge = Math.min(1, Math.abs(nx) + Math.abs(ny) * .7);
          alpha = Math.max(.12, .58 - edge * .3);
        }
        if (Math.random() > .88) continue;
        particles.push({
          x: (x / cols) * width,
          y: (y / rows) * height,
          r: .42 + Math.random() * (brightness > 175 ? 1.0 : .56),
          a: alpha,
          phase: Math.random() * Math.PI * 2,
          drift: .3 + Math.random() * 1.5,
          shade: brightness > 190 ? 255 : brightness > 110 ? 215 : 155
        });
      }
    }
    draw(0);
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    const t = time / 1000;
    for (const p of particles) {
      const dx = reducedMotion ? 0 : Math.sin(t * p.drift + p.phase) * 1.15;
      const dy = reducedMotion ? 0 : Math.cos(t * (p.drift * .66) + p.phase) * .85;
      ctx.globalAlpha = p.a * (.78 + (reducedMotion ? 0 : Math.sin(t * 1.4 + p.phase) * .17));
      const v = p.shade;
      ctx.fillStyle = "rgb(" + v + "," + v + "," + v + ")";
      ctx.beginPath();
      ctx.arc(p.x + dx, p.y + dy, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!reducedMotion) frame = requestAnimationFrame(draw);
  }

  source.addEventListener("load", () => {
    cancelAnimationFrame(frame);
    resize();
  });
  source.addEventListener("error", () => {
    cancelAnimationFrame(frame);
    resize();
  });
  if (source.complete) resize();
  window.addEventListener("resize", () => {
    cancelAnimationFrame(frame);
    resize();
  });
})();

(function initComponentShelf() {
  const track = document.getElementById("componentTrack");
  if (!track) return;
  const cards = [...track.querySelectorAll(".shelf-card")];
  const dots = [...document.querySelectorAll("[data-component-go]")];
  const count = document.getElementById("componentCount");
  const prev = document.querySelector("[data-component-prev]");
  const next = document.querySelector("[data-component-next]");
  let active = 0;
  let drag = null;

  function goTo(index) {
    active = (index + cards.length) % cards.length;
    const card = cards[active];
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
    dots.forEach((dot, i) => dot.classList.toggle("active", i === active));
    if (count) count.textContent = String(active + 1).padStart(2, "0") + " / " + String(cards.length).padStart(2, "0");
  }
  prev?.addEventListener("click", () => goTo(active - 1));
  next?.addEventListener("click", () => goTo(active + 1));
  dots.forEach((dot) => dot.addEventListener("click", () => goTo(Number(dot.dataset.componentGo))));
  track.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") { event.preventDefault(); goTo(active + 1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); goTo(active - 1); }
  });
  track.addEventListener("scroll", () => {
    const center = track.scrollLeft + track.clientWidth * .36;
    let nearest = 0, distance = Infinity;
    cards.forEach((card, index) => {
      const d = Math.abs(card.offsetLeft - track.offsetLeft - center);
      if (d < distance) { distance = d; nearest = index; }
    });
    active = nearest;
    dots.forEach((dot, i) => dot.classList.toggle("active", i === active));
    if (count) count.textContent = String(active + 1).padStart(2, "0") + " / " + String(cards.length).padStart(2, "0");
  }, { passive: true });
  track.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") return;
    drag = { startX: event.clientX, scrollLeft: track.scrollLeft, pointerId: event.pointerId };
    track.setPointerCapture(event.pointerId);
  });
  track.addEventListener("pointermove", (event) => {
    if (!drag) return;
    track.scrollLeft = drag.scrollLeft - (event.clientX - drag.startX);
  });
  const endDrag = () => { drag = null; };
  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);
})();

(function initScrollProgress() {
  const bar = document.getElementById("scrollProgress");
  if (!bar) return;
  let queued = false;
  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.style.transform = "scaleX(" + progress + ")";
    queued = false;
  }
  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();
(function initIntroLoader(){const l=document.getElementById("introLoader");if(!l)return;document.body.classList.add("intro-active");const done=()=>{l.classList.add("is-leaving");document.body.classList.remove("intro-active");document.body.classList.add("intro-complete");setTimeout(()=>l.remove(),800)};if(matchMedia("(prefers-reduced-motion: reduce)").matches){done();return}setTimeout(()=>l.classList.add("show-portfolio"),1250);setTimeout(()=>l.classList.add("zoom-out"),2350);setTimeout(done,2850)})();
(function initBreakout(){const wrap=document.getElementById("breakoutGame"),canvas=document.getElementById("breakoutCanvas");if(!wrap||!canvas)return;const ctx=canvas.getContext("2d");if(!ctx)return;const scoreNode=document.getElementById("gameScore"),livesNode=document.getElementById("gameLives"),startBtn=document.getElementById("gameStart"),restartBtn=document.getElementById("gameRestart");let w=1,h=1,dpr=1,raf=0,running=false,paused=false,score=0,lives=3,bricks=[],paddle={x:0,y:0,width:94,height:7},ball={x:0,y:0,vx:3,vy:-3,r:5},last=0,visible=true;const words=["HELLO","WORLD."],colors=["#f2f2ed","#a6a6a2"];function resize(){const r=wrap.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);paddle.y=h-30;paddle.x=Math.min(w-paddle.width,Math.max(0,paddle.x));build();if(!running){ballReset();draw()}}function build(){bricks=[];const gap=8,bh=30,n=6,bw=Math.min(76,(w-44-(n-1)*gap)/n),total=n*bw+(n-1)*gap,x0=(w-total)/2;words.forEach((word,row)=>[...word].forEach((letter,col)=>bricks.push({x:x0+col*(bw+gap),y:55+row*(bh+gap),width:bw,height:bh,letter,alive:true,color:colors[row]})))}function ballReset(){ball={x:w/2,y:h-52,vx:(Math.random()>.5?1:-1)*2.5,vy:-3.1,r:5};paddle.x=(w-paddle.width)/2}function hud(){scoreNode.textContent=String(score).padStart(3,"0");livesNode.textContent=String(lives).padStart(2,"0")}function draw(){ctx.clearRect(0,0,w,h);ctx.strokeStyle="#ffffff0d";for(let x=0;x<w;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}bricks.forEach(b=>{if(!b.alive)return;ctx.globalAlpha=.12;ctx.fillStyle=b.color;ctx.fillRect(b.x,b.y,b.width,b.height);ctx.globalAlpha=.65;ctx.strokeStyle=b.color;ctx.strokeRect(b.x+.5,b.y+.5,b.width-1,b.height-1);ctx.globalAlpha=1;ctx.fillStyle=b.color;ctx.font='bold 14px "IBM Plex Mono",monospace';ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(b.letter,b.x+b.width/2,b.y+b.height/2)});ctx.fillStyle="#eaeae5";ctx.shadowColor="#fff";ctx.shadowBlur=10;ctx.fillRect(paddle.x,paddle.y,paddle.width,paddle.height);ctx.shadowBlur=0;ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fillStyle="#fff";ctx.shadowColor="#8db8ff";ctx.shadowBlur=14;ctx.fill();ctx.shadowBlur=0;ctx.fillStyle="#777";ctx.font='10px "IBM Plex Mono",monospace';ctx.textAlign="center";ctx.fillText(running?"BREAK THE LETTERS":"READY WHEN YOU ARE",w/2,h-10)}function reset(){cancelAnimationFrame(raf);running=false;paused=false;score=0;lives=3;build();ballReset();hud();wrap.classList.remove("is-playing","is-over");startBtn.innerHTML='START GAME <span>↗</span>';draw()}function end(win){running=false;cancelAnimationFrame(raf);wrap.classList.remove("is-playing");wrap.classList.add("is-over");startBtn.innerHTML=(win?"YOU WIN — PLAY AGAIN":"GAME OVER — TRY AGAIN")+' <span>↻</span>';draw()}function step(t){if(!running||!visible)return;const dt=Math.min(2,(t-last)/16.67);last=t;ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;if(ball.x<ball.r||ball.x>w-ball.r)ball.vx*=-1;if(ball.y<ball.r+8)ball.vy=Math.abs(ball.vy);if(ball.y+ball.r>=paddle.y&&ball.y-ball.r<=paddle.y+paddle.height&&ball.x>=paddle.x&&ball.x<=paddle.x+paddle.width&&ball.vy>0){const hit=(ball.x-paddle.x-paddle.width/2)/(paddle.width/2);ball.vx=hit*4.2;ball.vy=-Math.max(2.8,Math.abs(ball.vy));ball.y=paddle.y-ball.r-1}let left=0;for(const b of bricks){if(!b.alive)continue;left++;if(ball.x+ball.r>b.x&&ball.x-ball.r<b.x+b.width&&ball.y+ball.r>b.y&&ball.y-ball.r<b.y+b.height){b.alive=false;score+=10;ball.vy*=-1;left--;hud();break}}if(left===0){end(true);return}if(ball.y>h+ball.r){lives--;hud();if(lives<=0){end(false);return}ballReset()}draw();raf=requestAnimationFrame(step)}function start(){if(running)return;if(wrap.classList.contains("is-over"))reset();running=true;last=performance.now();wrap.classList.add("is-playing");startBtn.textContent="PLAYING…";raf=requestAnimationFrame(step)}function move(x){const r=canvas.getBoundingClientRect();paddle.x=Math.max(0,Math.min(w-paddle.width,(x-r.left)*(w/r.width)-paddle.width/2));if(!running)draw()}canvas.addEventListener("pointermove",e=>{if(e.pointerType==="touch"||e.buttons)move(e.clientX)},{passive:true});canvas.addEventListener("pointerdown",e=>move(e.clientX),{passive:true});window.addEventListener("keydown",e=>{if(!running)return;if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();if(e.key==="ArrowLeft")paddle.x=Math.max(0,paddle.x-28);if(e.key==="ArrowRight")paddle.x=Math.min(w-paddle.width,paddle.x+28);draw()}});startBtn.addEventListener("click",start);restartBtn.addEventListener("click",reset);const observer=new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(!visible&&running){cancelAnimationFrame(raf);paused=true}else if(visible&&running&&paused){paused=false;last=performance.now();raf=requestAnimationFrame(step)}},{threshold:.05});observer.observe(wrap);window.addEventListener("resize",resize,{passive:true});resize();build();ballReset();draw()})();
(function initHeroPointer(){const hero=document.querySelector(".hero"),word=document.querySelector(".hero-wordmark");if(!hero||!word||matchMedia("(prefers-reduced-motion: reduce)").matches)return;let queued=false,x=0,y=0;hero.addEventListener("pointermove",e=>{x=(e.clientX/innerWidth-.5)*10;y=(e.clientY/innerHeight-.5)*-7;if(queued)return;queued=true;requestAnimationFrame(()=>{word.style.transform="translate3d("+x+"px,"+y+"px,0)";queued=false})},{passive:true});hero.addEventListener("pointerleave",()=>word.style.transform="translate3d(0,0,0)",{passive:true})})();
