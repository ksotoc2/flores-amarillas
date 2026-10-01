"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Heart, Mail, X, Play, Pause, Music2 } from "lucide-react";

/* ══════════════════════════════════════════════════════════════════════════════
   🎵  MÚSICA
   ══════════════════════════════════════════════════════════════════════════════
   Pega aquí la URL de la canción. Se reproduce automáticamente al abrir.

   Formatos soportados:
     YouTube:    "https://www.youtube.com/watch?v=VIDEO_ID"
                 "https://youtu.be/VIDEO_ID"
     SoundCloud: "https://soundcloud.com/artista/cancion"
     Spotify:    "https://open.spotify.com/track/TRACK_ID"
     MP3 directo:"https://ejemplo.com/cancion.mp3"

   Déjalo vacío → sin música (el botón de música no aparece).
══════════════════════════════════════════════════════════════════════════════ */
const MUSIC_URL = "";

/* ══════════════════════════════════════════════════════════════════════════════
   💬  FRASES que orbitan en la escena (30 variadas)
══════════════════════════════════════════════════════════════════════════════ */
const FRASES = [
  "Feliz 21 de septiembre (atrasado), Milca",
  "Un poco tarde pero llegue...",
  "Gracias por ser tan especial",
  "Como el girasol, siempre mirando hacia ti",
  "Tu 'amistad' mi lugar favorito del mundo",
  "Que este momento te saque una sonrisa enorme",
  "Poco importa la fecha cuando el carino es real",
  "Un abrazo que viaja a traves de la pantalla",
  "Con todo el carino del mundo para ti",
  "Un gracias que siempre se va a quedar corto",
  "Eres de las que hacen mejor cualquier lugar",
  "Que lo mejor de este dia se quede en tu corazon",
  "Siempre habra flores guardadas para ti",
  "Gracias por existir y por estar",
  "Apareces justo cuando mas hace falta",
  "No necesito un motivo para quererte",
  "Quiero que sepas lo mucho que importas",
];

const GLOW_COLORS = [
  "#ffd700", "#ffe066", "#ffcc33", "#ffb347",
  "#fff2b0", "#ffaa00", "#f4c430", "#e6b800",
  "#ffdb58", "#f0c419",
];

/* ══════════════════════════════════════════════════════════════════════════════
   Music URL parser
══════════════════════════════════════════════════════════════════════════════ */
function parseMusicUrl(raw: string): { type: "iframe" | "audio" | "none"; url: string } {
  const s = raw.trim();
  if (!s) return { type: "none", url: "" };

  if (/\.(mp3|ogg|wav|aac|m4a)(\?.*)?$/i.test(s)) return { type: "audio", url: s };

  const ytMatch = s.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/
  );
  if (ytMatch) {
    const id = ytMatch[1];
    return {
      type: "iframe",
      url: `https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&controls=0`,
    };
  }

  if (s.includes("soundcloud.com") && !s.includes("w.soundcloud.com")) {
    return {
      type: "iframe",
      url: `https://w.soundcloud.com/player/?url=${encodeURIComponent(s)}&auto_play=true&hide_related=true&show_comments=false&show_user=false`,
    };
  }

  if (s.includes("open.spotify.com")) {
    const m = s.match(/track\/([A-Za-z0-9]+)/);
    if (m) return { type: "iframe", url: `https://open.spotify.com/embed/track/${m[1]}?autoplay=1` };
  }

  return { type: "iframe", url: s };
}
const PARSED_MUSIC = parseMusicUrl(MUSIC_URL);

/* ══════════════════════════════════════════════════════════════════════════════
   Canvas sprite factories — ZERO emojis, pure vector drawing
══════════════════════════════════════════════════════════════════════════════ */

/** Sunflower drawn with canvas arcs and ellipses */
function makeFlowerCanvas(size = 128): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const cx = size / 2, cy = size / 2;
  const petals = 8;
  const pLen = size * 0.36;
  const pW   = size * 0.155;

  for (let i = 0; i < petals; i++) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((i * Math.PI * 2) / petals + Math.PI / petals);
    const g = ctx.createRadialGradient(0, -pLen * 0.22, 0, 0, -pLen * 0.5, pLen * 0.6);
    g.addColorStop(0, "#ffe566");
    g.addColorStop(0.55, "#f5b800");
    g.addColorStop(1,  "#d07800");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, -pLen * 0.5, pW * 0.5, pLen * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Center disk
  const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.155);
  cg.addColorStop(0,   "#7a4012");
  cg.addColorStop(0.6, "#4f2606");
  cg.addColorStop(1,   "#2d1200");
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.155, 0, Math.PI * 2);
  ctx.fill();
  return c;
}

/** 4-pointed star / sparkle */
function makeStarCanvas(size = 128): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const cx = size / 2, cy = size / 2;

  ctx.shadowColor = "#ffe566";
  ctx.shadowBlur = size * 0.12;

  // Outer glow disc
  const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.5);
  bg.addColorStop(0, "rgba(255,240,140,0.35)");
  bg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // 4-pointed star
  const outer = size * 0.44;
  const inner = size * 0.14;
  const pts = 4;
  ctx.fillStyle = "#ffe566";
  ctx.beginPath();
  for (let i = 0; i < pts * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / pts - Math.PI / 2;
    if (i === 0) ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    else         ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
  }
  ctx.closePath();
  ctx.fill();
  return c;
}

/** Small 2D heart for orbit */
function makeSmallHeartCanvas(size = 128): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const s = size * 0.4;
  const cx = size / 2, cy = size / 2 + s * 0.1;

  ctx.shadowColor = "#ffd700";
  ctx.shadowBlur  = size * 0.1;

  const fg = ctx.createRadialGradient(cx, cy - s * 0.1, 0, cx, cy, s * 0.8);
  fg.addColorStop(0, "#fff0a0");
  fg.addColorStop(0.5, "#f5b800");
  fg.addColorStop(1,   "#b87800");
  ctx.fillStyle = fg;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.35);
  ctx.bezierCurveTo(-s * 0.08, -s * 0.62, -s * 0.52, -s * 0.62, -s * 0.52, -s * 0.16);
  ctx.bezierCurveTo(-s * 0.52, s * 0.12, -s * 0.26, s * 0.4, 0, s * 0.64);
  ctx.bezierCurveTo(s * 0.26, s * 0.4, s * 0.52, s * 0.12, s * 0.52, -s * 0.16);
  ctx.bezierCurveTo(s * 0.52, -s * 0.62, s * 0.08, -s * 0.62, 0, -s * 0.35);
  ctx.fill();
  ctx.restore();
  return c;
}

/** Text sprite for floating phrases */
function makeTextCanvas(text: string, glowColor: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, 512, 128);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff8e0";
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 26;
  let fs = 50;
  ctx.font = `${fs}px 'Dancing Script', cursive`;
  while (ctx.measureText(text).width > 468 && fs > 20) {
    fs -= 2;
    ctx.font = `${fs}px 'Dancing Script', cursive`;
  }
  ctx.fillText(text, 256, 64);
  return c;
}

/* ══════════════════════════════════════════════════════════════════════════════
   Three.js helpers
══════════════════════════════════════════════════════════════════════════════ */

/** Standard Three.js heart shape (from official docs example) */
function createHeartShape(THREE: typeof import("three")): import("three").Shape {
  const shape = new THREE.Shape();
  shape.moveTo(5, 5);
  shape.bezierCurveTo(5, 5,  4,  0,  0,  0);
  shape.bezierCurveTo(-6, 0, -6,  7, -6,  7);
  shape.bezierCurveTo(-6,11, -3, 15.4, 5, 19);
  shape.bezierCurveTo(12,15.4, 16,11, 16,  7);
  shape.bezierCurveTo(16, 7, 16,  0, 10,  0);
  shape.bezierCurveTo(7,  0,  5,  5,  5,  5);
  return shape;
}

/** Saturn-like warm golden ring texture */
function makeRingTexture(THREE: typeof import("three")): import("three").CanvasTexture {
  const sz = 1024;
  const c = document.createElement("canvas"); c.width = c.height = sz;
  const ctx = c.getContext("2d")!;
  ctx.translate(sz / 2, sz / 2);
  const rIn = sz * 0.215, rOut = sz * 0.465;
  const g = ctx.createRadialGradient(0, 0, rIn, 0, 0, rOut);
  g.addColorStop(0.00, "rgba(255,235,185,0.98)");
  g.addColorStop(0.28, "rgba(255,195,65,0.90)");
  g.addColorStop(0.62, "rgba(255,145,18,0.72)");
  g.addColorStop(1.00, "rgba(170,75,0,0.45)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, rOut, 0, Math.PI * 2);
  ctx.arc(0, 0, rIn, 0, Math.PI * 2, true);
  ctx.closePath(); ctx.fill();
  for (let i = 0; i < 32; i++) {
    const r = rIn + (rOut - rIn) * (i / 31);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.lineWidth = ((rOut - rIn) / 32) * (0.44 + Math.random() * 0.46);
    ctx.strokeStyle = i % 3 === 0 ? "rgba(70,25,0,0.22)" : "rgba(255,235,190,0.17)";
    ctx.stroke();
  }
  return new THREE.CanvasTexture(c);
}

/** Warm golden particle field */
function makeParticles(count: number, THREE: typeof import("three")): import("three").Points {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 2500 * (0.2 + Math.random() * 0.8);
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3]     = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.cos(ph);
    pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    const t = Math.random();
    col[i * 3] = 1; col[i * 3 + 1] = 0.62 + t * 0.38; col[i * 3 + 2] = t * 0.2;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color",    new THREE.BufferAttribute(col, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({
    size: 1.8, vertexColors: true, depthWrite: false, transparent: true, opacity: 0.82,
  }));
}

/* ══════════════════════════════════════════════════════════════════════════════
   Letter Modal
══════════════════════════════════════════════════════════════════════════════ */
function LetterModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
          <X size={15} />
        </button>

        <div className="modal-header">
          <Heart size={38} className="modal-header-icon" fill="#f5b800" strokeWidth={0} />
          <h2 className="modal-header-title">Para Milca</h2>
          <p className="modal-header-subtitle">21 de septiembre | atrasado, pero con cariño</p>
        </div>

        <div className="modal-divider" />

        <div className="modal-body">
          <p>
            Holi Milca, se que el 21 de septiembre ya paso hace unos días,
            pero eso no me impidió hacer este pequeño detalle.
          </p>
          <p>
            Esta es mi manera de mandarte ese ramo de flores
            amarillas que se da ese día, pero que por el tiempo
            y las circunstancias se complicó un poco. Las flores
            son digitales, pero el cariño es real.
          </p>
          <p>
            Espero que te saque una sonrisa, porque te la mereces,
            hoy y siempre. Gracias por ser como eres y por estar.
          </p>
        </div>

        <div className="modal-signature">
          <span>Con mucho cariño</span>
          <Heart
            size={16}
            className="modal-signature-heart"
            fill="#f5b800"
            strokeWidth={0}
          />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Main Page
══════════════════════════════════════════════════════════════════════════════ */
export default function GiftPage() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const startRef    = useRef<HTMLDivElement>(null);
  const iframeRef   = useRef<HTMLIFrameElement>(null);
  const audioRef    = useRef<HTMLAudioElement>(null);

  const [started,   setStarted]   = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const musicEnabled = PARSED_MUSIC.type !== "none";

  /* ── Three.js scene ── */
  useEffect(() => {
    if (!started) return;
    let animId: number;
    let renderer: import("three").WebGLRenderer | undefined;

    (async () => {
      const THREE = await import("three");
      const canvas = canvasRef.current;
      if (!canvas) return;

      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);

      const scene  = new THREE.Scene();
      scene.fog    = new THREE.FogExp2(0x120300, 0.00042);

      const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 6000);
      let targetDist = 305, currentDist = 305, rotX = 0.18, rotY = 0;

      /* Particles */
      scene.add(makeParticles(2600, THREE));

      /* Lights (golden warm palette — no red) */
      scene.add(new THREE.AmbientLight(0x332200, 3.2));
      const mainLight = new THREE.PointLight(0xffeebb, 5, 650);
      mainLight.position.set(45, 75, 175); scene.add(mainLight);
      const fillLight = new THREE.PointLight(0xffaa44, 3, 550);
      fillLight.position.set(-140, -35, 65); scene.add(fillLight);
      const rimLight  = new THREE.PointLight(0xffddaa, 2, 450);
      rimLight.position.set(10, -90, -140); scene.add(rimLight);

      /* ─ 3D Heart ─ */
      const heartGeo = new THREE.ExtrudeGeometry(createHeartShape(THREE), {
        depth: 5, bevelEnabled: true, bevelSegments: 6, bevelSize: 1.1, bevelThickness: 1.1,
      });
      heartGeo.center();
      const heartMat = new THREE.MeshStandardMaterial({
        color: 0xffc200, emissive: 0x664400, roughness: 0.3, metalness: 0.28,
      });
      const heart = new THREE.Mesh(heartGeo, heartMat);
      const HEART_S = 2.65;
      heart.scale.setScalar(HEART_S);
      // The Shape's Y axis maps to Three.js Y-up, which flips the canvas-drawn
      // shape. Rotating 180° on Z corrects the orientation so bumps face up.
      heart.rotation.z = Math.PI;
      scene.add(heart);

      /* Glow sprite behind the heart — golden, not red */
      const glowC = document.createElement("canvas"); glowC.width = glowC.height = 512;
      const glowCtx = glowC.getContext("2d")!;
      const gg = glowCtx.createRadialGradient(256, 256, 0, 256, 256, 256);
      gg.addColorStop(0,    "rgba(255, 210, 60, 0.70)");
      gg.addColorStop(0.38, "rgba(220, 150,  0, 0.30)");
      gg.addColorStop(0.72, "rgba(160,  90,  0, 0.10)");
      gg.addColorStop(1,    "rgba(0,0,0,0)");
      glowCtx.fillStyle = gg; glowCtx.fillRect(0, 0, 512, 512);
      const GLOW_SZ = 340;
      const glowSp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(glowC), transparent: true,
        depthWrite: false, blending: THREE.AdditiveBlending,
      }));
      glowSp.scale.set(GLOW_SZ, GLOW_SZ, 1);
      scene.add(glowSp);

      /* Golden ring (tilted differently from reference) */
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(52, 130, 180),
        new THREE.MeshBasicMaterial({
          map: makeRingTexture(THREE), transparent: true,
          side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
        })
      );
      ring.rotation.x = Math.PI / 2.45;
      scene.add(ring);

      /* ─ Orbiting icon sprites (NO emojis — canvas-drawn) ─ */
      const orbitGroup = new THREE.Group();
      scene.add(orbitGroup);

      // Pre-build unique canvases for variety
      const iconPool = [
        makeFlowerCanvas(128), makeFlowerCanvas(128), makeFlowerCanvas(128),
        makeStarCanvas(128),   makeStarCanvas(128),
        makeSmallHeartCanvas(128), makeSmallHeartCanvas(128),
      ];

      const ORBIT_N = 22;
      for (let i = 0; i < ORBIT_N; i++) {
        const tex = new THREE.CanvasTexture(iconPool[i % iconPool.length]);
        const sp  = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
        const sz  = 18 + Math.random() * 18;
        sp.scale.set(sz, sz, 1);
        const phi = Math.acos(2 * Math.random() - 1);
        const theta = Math.random() * Math.PI * 2;
        const r = 62 + Math.random() * 62;
        sp.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
        (sp as import("three").Sprite & { userData: Record<string, number> }).userData = {
          phi, theta, radius: r, speed: 0.003 + Math.random() * 0.0045, tOff: Math.random() * Math.PI * 2,
        };
        orbitGroup.add(sp);
      }

      /* ─ Floating phrase sprites ─ */
      const phraseGroup = new THREE.Group();
      scene.add(phraseGroup);
      const SLOTS = 140;
      const phrases = Array.from({ length: SLOTS }, (_, i) => FRASES[i % FRASES.length]);

      await document.fonts.load("44px 'Dancing Script'").catch(() => {});

      for (let i = 0; i < phrases.length; i++) {
        const tex = new THREE.CanvasTexture(makeTextCanvas(phrases[i], GLOW_COLORS[i % GLOW_COLORS.length]));
        const sp  = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
        sp.scale.set(74, 23.5, 1);
        const phi = Math.acos(2 * Math.random() - 1);
        const theta = Math.random() * Math.PI * 2;
        const r = 165 + Math.random() * 145;
        sp.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
        (sp as import("three").Sprite & { userData: Record<string, number> }).userData = {
          phi, theta, radius: r, speed: 0.0006 + Math.random() * 0.0011, tOff: Math.random() * Math.PI * 2,
        };
        phraseGroup.add(sp);
      }

      /* ─ Controls ─ */
      let dragging = false, lastX = 0, lastY = 0;
      const onDown = (e: MouseEvent | TouchEvent) => {
        dragging = true;
        const p = "touches" in e ? e.touches[0] : e;
        lastX = p.clientX; lastY = p.clientY;
      };
      const onMove = (e: MouseEvent | TouchEvent) => {
        if (!dragging) return;
        const p = "touches" in e ? e.touches[0] : e;
        const dx = (p.clientX - lastX) / window.innerWidth;
        const dy = (p.clientY - lastY) / window.innerHeight;
        rotY -= dx * 5;
        rotX = Math.max(-1.2, Math.min(1.2, rotX + dy * 3.5));
        lastX = p.clientX; lastY = p.clientY;
      };
      const onUp = () => { dragging = false; };
      window.addEventListener("mousedown", onDown);
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup",   onUp);
      window.addEventListener("touchstart", onDown, { passive: true });
      window.addEventListener("touchmove",  onMove, { passive: true });
      window.addEventListener("touchend",   onUp,   { passive: true });

      let pinchDist = 0;
      const onPinch = (e: TouchEvent) => {
        if (e.touches.length !== 2) return;
        e.preventDefault();
        const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        if (pinchDist) { targetDist += (pinchDist - d) * 0.5; targetDist = Math.max(160, Math.min(720, targetDist)); }
        pinchDist = d;
      };
      window.addEventListener("touchmove", onPinch, { passive: false });
      window.addEventListener("touchend",  () => { pinchDist = 0; }, { passive: true });
      window.addEventListener("wheel", (e) => {
        targetDist += e.deltaY * 0.28;
        targetDist = Math.max(160, Math.min(720, targetDist));
      }, { passive: true });

      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer!.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("resize", onResize);

      /* ─ Render loop ─ */
      let t = 0;
      const tick = () => {
        animId = requestAnimationFrame(tick);
        t += 0.01;

        // 3D heart: slow Y rotation + heartbeat scale + subtle bob
        heart.rotation.y  += 0.0068;
        heart.rotation.x   = Math.sin(t * 0.28) * 0.09;
        const hb = HEART_S * (1 + 0.045 * Math.abs(Math.sin(t * 2.5)));
        heart.scale.setScalar(hb);
        heart.position.y   = Math.sin(t * 0.55) * 3.5;

        // Glow breathes
        const gs = GLOW_SZ * (1 + 0.055 * Math.sin(t * 2.2));
        glowSp.scale.set(gs, gs, 1);

        // Ring rotation (z + slow y)
        ring.rotation.z += 0.0021;
        ring.rotation.y += 0.0003;

        // Orbit icons
        orbitGroup.children.forEach((child) => {
          const sp = child as import("three").Sprite & { userData: Record<string, number> };
          sp.userData.theta += sp.userData.speed;
          const { radius: r, phi, theta: th, tOff } = sp.userData;
          sp.position.set(
            r * Math.sin(phi) * Math.cos(th),
            r * Math.cos(phi) + Math.sin(t * 1.3 + tOff) * 6.5,
            r * Math.sin(phi) * Math.sin(th)
          );
          sp.material.opacity = 0.7 + 0.3 * Math.sin(t * 1.9 + tOff);
        });

        // Phrases
        phraseGroup.children.forEach((child) => {
          const sp = child as import("three").Sprite & { userData: Record<string, number> };
          sp.userData.theta += sp.userData.speed;
          const { radius: r, phi, theta: th, tOff } = sp.userData;
          sp.position.set(
            r * Math.sin(phi) * Math.cos(th),
            r * Math.cos(phi),
            r * Math.sin(phi) * Math.sin(th)
          );
          sp.material.opacity = 0.6 + 0.4 * Math.sin(t * 1.6 + tOff);
        });

        // Camera
        currentDist += (targetDist - currentDist) * 0.06;
        const cx2 = Math.cos(rotX), sx2 = Math.sin(rotX);
        const cy2 = Math.cos(rotY), sy2 = Math.sin(rotY);
        camera.position.set(currentDist * sy2 * cx2, currentDist * sx2, currentDist * cy2 * cx2);
        camera.lookAt(0, 0, 0);
        renderer!.render(scene, camera);
      };
      tick();
    })();

    return () => {
      if (animId!) cancelAnimationFrame(animId);
      renderer?.dispose();
    };
  }, [started]);

  /* ── Handlers ── */
  const handleStart = useCallback(() => {
    if (started) return;
    setStarted(true);
    const ss = startRef.current;
    if (ss) { ss.classList.add("hidden"); setTimeout(() => { ss.style.display = "none"; }, 900); }
    // Auto-play music
    if (PARSED_MUSIC.type === "audio") {
      const a = audioRef.current;
      if (a) { a.src = PARSED_MUSIC.url; a.play().catch(() => {}); }
    } else if (PARSED_MUSIC.type === "iframe") {
      const f = iframeRef.current;
      if (f) f.src = PARSED_MUSIC.url;
    }
    if (PARSED_MUSIC.type !== "none") setIsPlaying(true);
  }, [started]);

  const handleMusicToggle = useCallback(() => {
    if (!musicEnabled) return;
    if (isPlaying) {
      if (PARSED_MUSIC.type === "audio") audioRef.current?.pause();
      else if (iframeRef.current) iframeRef.current.src = "";
      setIsPlaying(false);
    } else {
      if (PARSED_MUSIC.type === "audio") {
        const a = audioRef.current;
        if (a) { a.src = PARSED_MUSIC.url; a.play().catch(() => {}); }
      } else if (iframeRef.current) {
        iframeRef.current.src = PARSED_MUSIC.url;
      }
      setIsPlaying(true);
    }
  }, [isPlaying, musicEnabled]);

  /* ── Render ── */
  return (
    <>
      {/* Three.js canvas */}
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0 }} />

      {/* Fixed title */}
      {started && <h1 id="main-title">Para Milca, con mucho cariño</h1>}

      {/* Start screen */}
      <div id="start-screen" ref={startRef} onClick={handleStart}>
        <div id="start-heart-icon">
          <Heart size={148} fill="#f5b800" strokeWidth={0} aria-hidden />
        </div>
        <p id="start-title">Hola Milca,<br />te estaba esperando...</p>
        <p id="start-hint">Toca para abrir tu regalo</p>
      </div>

      {/* Music button — bottom left */}
      {started && musicEnabled && (
        <button
          id="music-btn"
          className="fab"
          onClick={handleMusicToggle}
          aria-label={isPlaying ? "Pausar musica" : "Reproducir musica"}
        >
          {isPlaying ? <Pause size={20} /> : <Music2 size={20} />}
        </button>
      )}

      {/* Envelope button — bottom right */}
      {started && (
        <button
          id="envelope-btn"
          className="fab"
          onClick={() => setShowModal(true)}
          aria-label="Leer el mensaje"
        >
          <Mail size={22} />
        </button>
      )}

      {/* Letter modal */}
      {showModal && <LetterModal onClose={() => setShowModal(false)} />}

      {/* Hidden music iframe */}
      <iframe
        ref={iframeRef}
        title="music-player"
        allow="autoplay; encrypted-media"
        style={{
          display: "block", position: "fixed", bottom: 0, left: 0,
          width: 1, height: 1, border: "none", opacity: 0, pointerEvents: "none",
        }}
      />
      <audio ref={audioRef} loop style={{ display: "none" }} />
    </>
  );
}
