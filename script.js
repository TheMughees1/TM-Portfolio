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
    resize();
  });
  source.addEventListener("error", () => resize());
  if (source.complete) resize();
  window.addEventListener("resize", () => {
    cancelAnimationFrame(frame);
    resize();
  });
  if (!reducedMotion) {
    frame = requestAnimationFrame(draw);
  }
})();