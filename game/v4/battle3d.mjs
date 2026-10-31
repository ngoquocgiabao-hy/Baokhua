/**
 * Bảo Khựa battle scene — procedural low-poly (Media concept):
 * denim #1E5AA8 · sun #FFD91F · ink #16171B · teal aura Long Hạ
 * No GLB required; three.js from CDN import map in game_v4.html
 */
import * as THREE from 'three';

let BloomEffect, EffectComposer, EffectPass, RenderPass;
let postOk = false;
async function loadPost() {
  try {
    const pp = await import('postprocessing');
    BloomEffect = pp.BloomEffect;
    EffectComposer = pp.EffectComposer;
    EffectPass = pp.EffectPass;
    RenderPass = pp.RenderPass;
    postOk = true;
  } catch (e) {
    console.warn('postprocessing CDN fail — bloom off', e);
    postOk = false;
  }
}
const postReady = loadPost();

const DENIM = 0x1e5aa8, DENIM_DEEP = 0x0f3468, SUN = 0xffd91f, INK = 0x16171b;
const SKIN = 0xf0c9a0, TEAL = 0x2ec4b6, WHITE = 0xfff8e7, GOLD = 0xffd34d;

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color, flatShading: true, roughness: opts.roughness ?? 0.72, metalness: opts.metalness ?? 0.08,
    emissive: opts.emissive ?? 0x000000, emissiveIntensity: opts.emissiveIntensity ?? 0,
    transparent: !!opts.transparent, opacity: opts.opacity ?? 1
  });
}

function box(w, h, d, color, opts) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts));
  m.castShadow = false; m.receiveShadow = false;
  return m;
}

function makeBadgeTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#FFD91F'; g.beginPath();
  g.moveTo(32, 4); g.lineTo(60, 32); g.lineTo(32, 60); g.lineTo(4, 32); g.closePath(); g.fill();
  g.fillStyle = '#16171B'; g.font = 'bold 34px serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('宝', 32, 34);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createBattle(canvas) {
  const state = {
    armor: 0, atk: 0, skillLv: 0, stageKey: 'hotel',
    particles: [], shakeT: 0, shakeAmp: 0,
    atkAnim: 0, bossAnim: 0, hitFlash: 0,
    auraColor: new THREE.Color(TEAL),
    running: true, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches
  };
  let composer = null, bloomOn = false;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x4a90b8, 1);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x4a90b8);
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 80);
  camera.position.set(0, 1.95, 5.15);
  camera.lookAt(0, 1.05, 0);
  const camBase = camera.position.clone();

  scene.add(new THREE.HemisphereLight(0xfff0d0, 0x1a3050, 1.15));
  const key = new THREE.DirectionalLight(0xffffff, 1.05);
  key.position.set(3, 6, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0x7ec8ff, 0.35);
  rim.position.set(-4, 3, -2); scene.add(rim);

  // --- Floor / lobby ---
  const floor = box(10, 0.12, 5, 0x3a3f48); floor.position.set(0, -0.06, 0.3); scene.add(floor);
  const rug = box(3.2, 0.02, 1.6, 0x1e5aa8); rug.position.set(0, 0.02, 0.5); scene.add(rug);

  // Stylized Ha Long karsts (backdrop)
  const bg = new THREE.Group(); bg.position.set(0, 0, -3.5); scene.add(bg);
  const sky = box(14, 7, 0.2, 0x6eb6d9); sky.position.y = 3; bg.add(sky);
  [[-3.2, 1.4, 0.9], [-1.4, 2.0, 1.1], [0.2, 1.6, 0.8], [2.0, 2.2, 1.2], [3.5, 1.5, 0.85]].forEach(([x, h, s]) => {
    const k = box(s, h, s * 0.7, 0x5a7a62); k.position.set(x, h / 2, -0.2); bg.add(k);
  });
  const water = box(14, 0.08, 2, 0x2a7a9a); water.position.set(0, 0.2, 0.6); bg.add(water);

  // Reception desk
  const desk = new THREE.Group(); desk.position.set(1.55, 0, 0.15); scene.add(desk);
  const deskBody = box(1.8, 0.95, 0.7, 0x5a5e66); deskBody.position.y = 0.48; desk.add(deskBody);
  const deskTop = box(1.9, 0.08, 0.78, GOLD); deskTop.position.y = 0.98; desk.add(deskTop);
  const bell = box(0.18, 0.12, 0.18, GOLD, { metalness: 0.6, roughness: 0.3 }); bell.position.set(-0.55, 1.1, 0.1); desk.add(bell);
  const book = box(0.35, 0.05, 0.28, WHITE); book.position.set(0.1, 1.06, 0.05); desk.add(book);
  const card = box(0.18, 0.28, 0.02, DENIM); card.position.set(0.55, 1.2, 0.15); desk.add(card);

  const badgeTex = makeBadgeTexture();

  // --- Hero ---
  const hero = new THREE.Group(); hero.position.set(-1.55, 0, 0.4); scene.add(hero);
  const heroParts = {};

  function buildHero() {
    while (hero.children.length) hero.remove(hero.children[0]);
    const body = new THREE.Group(); hero.add(body);

    // legs
    const legL = box(0.28, 0.55, 0.28, INK); legL.position.set(-0.16, 0.28, 0); body.add(legL);
    const legR = box(0.28, 0.55, 0.28, INK); legR.position.set(0.16, 0.28, 0); body.add(legR);
    const bootL = box(0.32, 0.16, 0.36, INK); bootL.position.set(-0.16, 0.08, 0.02); body.add(bootL);
    const bootR = box(0.32, 0.16, 0.36, INK); bootR.position.set(0.16, 0.08, 0.02); body.add(bootR);
    heroParts.bootGoldL = box(0.34, 0.04, 0.38, SUN); heroParts.bootGoldL.position.set(-0.16, 0.02, 0.02); heroParts.bootGoldL.visible = false; body.add(heroParts.bootGoldL);
    heroParts.bootGoldR = box(0.34, 0.04, 0.38, SUN); heroParts.bootGoldR.position.set(0.16, 0.02, 0.02); heroParts.bootGoldR.visible = false; body.add(heroParts.bootGoldR);

    // torso
    const torso = box(0.72, 0.7, 0.42, DENIM); torso.position.set(0, 0.9, 0); body.add(torso);
    heroParts.wave = box(0.74, 0.28, 0.44, DENIM_DEEP); heroParts.wave.position.set(0, 0.68, 0); body.add(heroParts.wave);

    // badge 宝
    const badge = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.28), new THREE.MeshStandardMaterial({ map: badgeTex, transparent: true, flatShading: true }));
    badge.position.set(-0.18, 1.05, 0.22); body.add(badge);
    heroParts.badgeBig = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), new THREE.MeshStandardMaterial({ map: badgeTex, transparent: true, flatShading: true, emissive: SUN, emissiveIntensity: 0.2 }));
    heroParts.badgeBig.position.set(0, 1.05, 0.22); heroParts.badgeBig.visible = false; body.add(heroParts.badgeBig);

    // armor pieces (upgrades)
    heroParts.shoulderL = box(0.32, 0.22, 0.38, DENIM_DEEP, { metalness: 0.2 }); heroParts.shoulderL.position.set(-0.48, 1.18, 0); heroParts.shoulderL.visible = false; body.add(heroParts.shoulderL);
    heroParts.shoulderR = box(0.32, 0.22, 0.38, DENIM_DEEP, { metalness: 0.2 }); heroParts.shoulderR.position.set(0.48, 1.18, 0); heroParts.shoulderR.visible = false; body.add(heroParts.shoulderR);
    heroParts.shoulderGoldL = box(0.34, 0.06, 0.4, SUN, { emissive: SUN, emissiveIntensity: 0.15 }); heroParts.shoulderGoldL.position.set(-0.48, 1.28, 0); heroParts.shoulderGoldL.visible = false; body.add(heroParts.shoulderGoldL);
    heroParts.shoulderGoldR = box(0.34, 0.06, 0.4, SUN, { emissive: SUN, emissiveIntensity: 0.15 }); heroParts.shoulderGoldR.position.set(0.48, 1.28, 0); heroParts.shoulderGoldR.visible = false; body.add(heroParts.shoulderGoldR);
    heroParts.chestPlate = box(0.76, 0.36, 0.46, INK, { metalness: 0.25 }); heroParts.chestPlate.position.set(0, 0.95, 0.02); heroParts.chestPlate.visible = false; body.add(heroParts.chestPlate);

    // arms
    const armL = box(0.22, 0.55, 0.22, DENIM); armL.position.set(-0.52, 0.85, 0); body.add(armL);
    const armR = box(0.22, 0.55, 0.22, DENIM); armR.position.set(0.52, 0.85, 0); body.add(armR);
    heroParts.armWrapL = box(0.24, 0.2, 0.24, INK); heroParts.armWrapL.position.set(-0.52, 0.62, 0); heroParts.armWrapL.visible = false; body.add(heroParts.armWrapL);
    heroParts.armWrapR = box(0.24, 0.2, 0.24, INK); heroParts.armWrapR.position.set(0.52, 0.62, 0); heroParts.armWrapR.visible = false; body.add(heroParts.armWrapR);

    // head
    const head = box(0.55, 0.55, 0.5, SKIN); head.position.set(0, 1.52, 0); body.add(head);
    const hair = box(0.58, 0.28, 0.52, INK); hair.position.set(0, 1.78, -0.02); body.add(hair);
    const spike = box(0.12, 0.22, 0.12, INK); spike.position.set(-0.12, 1.95, 0); body.add(spike);
    const spike2 = box(0.1, 0.18, 0.1, INK); spike2.position.set(0.14, 1.92, 0.05); body.add(spike2);
    // eyes
    const eyeL = box(0.1, 0.1, 0.04, INK); eyeL.position.set(-0.12, 1.54, 0.26); body.add(eyeL);
    const eyeR = box(0.1, 0.1, 0.04, INK); eyeR.position.set(0.12, 1.54, 0.26); body.add(eyeR);
    // headband
    const band = box(0.58, 0.1, 0.52, SUN); band.position.set(0, 1.68, 0.02); body.add(band);
    heroParts.bandTail = box(0.08, 0.45, 0.08, SUN); heroParts.bandTail.position.set(0.32, 1.55, -0.15); heroParts.bandTail.rotation.z = 0.4; body.add(heroParts.bandTail);
    heroParts.bandBadge = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16), new THREE.MeshStandardMaterial({ map: badgeTex, transparent: true }));
    heroParts.bandBadge.position.set(0, 1.68, 0.28); heroParts.bandBadge.visible = false; body.add(heroParts.bandBadge);

    // Weapons group
    heroParts.weapons = new THREE.Group(); heroParts.weapons.position.set(0.55, 0.95, 0.25); body.add(heroParts.weapons);

    // Tier1 shuriken
    heroParts.shuriken = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const blade = box(0.55, 0.06, 0.14, SUN, { emissive: SUN, emissiveIntensity: 0.25, metalness: 0.4 });
      blade.rotation.z = (Math.PI / 2) * i; heroParts.shuriken.add(blade);
    }
    const hub = box(0.14, 0.08, 0.14, INK); heroParts.shuriken.add(hub);
    heroParts.weapons.add(heroParts.shuriken);

    // Tier2 dual blades
    heroParts.blades = new THREE.Group(); heroParts.blades.visible = false;
    const mkBlade = (x) => {
      const g = new THREE.Group();
      const blade = box(0.08, 0.7, 0.04, 0xe8f0ff, { emissive: SUN, emissiveIntensity: 0.45, metalness: 0.5 });
      blade.position.y = 0.35; g.add(blade);
      const hilt = box(0.1, 0.18, 0.1, INK); g.add(hilt);
      const guard = box(0.22, 0.04, 0.08, SUN); guard.position.y = 0.1; g.add(guard);
      g.position.x = x; return g;
    };
    heroParts.blades.add(mkBlade(-0.15)); heroParts.blades.add(mkBlade(0.15));
    heroParts.weapons.add(heroParts.blades);

    // Tier3 dragon shuriken (bigger + glow)
    heroParts.dragonStar = new THREE.Group(); heroParts.dragonStar.visible = false;
    for (let i = 0; i < 4; i++) {
      const blade = box(0.75, 0.08, 0.16, SUN, { emissive: SUN, emissiveIntensity: 0.7, metalness: 0.55 });
      blade.rotation.z = (Math.PI / 2) * i + 0.2; heroParts.dragonStar.add(blade);
    }
    const hub2 = box(0.18, 0.1, 0.18, TEAL, { emissive: TEAL, emissiveIntensity: 0.5 }); heroParts.dragonStar.add(hub2);
    heroParts.weapons.add(heroParts.dragonStar);

    // Aura ring (skill)
    heroParts.aura = new THREE.Mesh(
      new THREE.TorusGeometry(0.85, 0.04, 6, 20),
      mat(TEAL, { emissive: TEAL, emissiveIntensity: 0.8, transparent: true, opacity: 0.75 })
    );
    heroParts.aura.rotation.x = Math.PI / 2; heroParts.aura.position.y = 0.9; heroParts.aura.visible = false; body.add(heroParts.aura);

    heroParts.aura2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.05, 0.03, 6, 16),
      mat(SUN, { emissive: SUN, emissiveIntensity: 0.5, transparent: true, opacity: 0.5 })
    );
    heroParts.aura2.rotation.x = Math.PI / 2; heroParts.aura2.position.y = 1.1; heroParts.aura2.visible = false; body.add(heroParts.aura2);

    heroParts.body = body;
  }
  buildHero();

  // --- Boss ---
  const boss = new THREE.Group(); boss.position.set(1.55, 0, -0.15); scene.add(boss);
  const bossParts = {};
  (function buildBoss() {
    const body = new THREE.Group(); boss.add(body);
    // skirt/legs
    const skirt = box(0.7, 0.5, 0.4, INK); skirt.position.set(0, 0.35, 0); body.add(skirt);
    // blazer
    const torso = box(0.75, 0.75, 0.42, DENIM); torso.position.set(0, 0.95, 0); body.add(torso);
    const trimL = box(0.08, 0.7, 0.44, SUN); trimL.position.set(-0.28, 0.95, 0); body.add(trimL);
    const trimR = box(0.08, 0.7, 0.44, SUN); trimR.position.set(0.28, 0.95, 0); body.add(trimR);
    const shirt = box(0.28, 0.35, 0.4, WHITE); shirt.position.set(0, 1.05, 0.05); body.add(shirt);
    // crossed arms
    const armL = box(0.55, 0.18, 0.18, DENIM); armL.position.set(-0.15, 0.95, 0.28); armL.rotation.z = 0.15; body.add(armL);
    const armR = box(0.55, 0.18, 0.18, DENIM); armR.position.set(0.15, 0.95, 0.28); armR.rotation.z = -0.15; body.add(armR);
    // head
    const head = box(0.5, 0.5, 0.45, SKIN); head.position.set(0, 1.55, 0); body.add(head);
    const bun = box(0.22, 0.22, 0.22, INK); bun.position.set(0, 1.88, -0.05); body.add(bun);
    const hair = box(0.52, 0.2, 0.48, INK); hair.position.set(0, 1.78, -0.02); body.add(hair);
    const browL = box(0.14, 0.04, 0.04, INK); browL.position.set(-0.12, 1.62, 0.24); browL.rotation.z = 0.3; body.add(browL);
    const browR = box(0.14, 0.04, 0.04, INK); browR.position.set(0.12, 1.62, 0.24); browR.rotation.z = -0.3; body.add(browR);
    const eyeL = box(0.09, 0.08, 0.04, INK); eyeL.position.set(-0.12, 1.52, 0.24); body.add(eyeL);
    const eyeR = box(0.09, 0.08, 0.04, INK); eyeR.position.set(0.12, 1.52, 0.24); body.add(eyeR);
    const nameTag = box(0.16, 0.1, 0.02, SUN); nameTag.position.set(-0.22, 1.1, 0.22); body.add(nameTag);
    bossParts.body = body;
    bossParts.glow = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 8), mat(0xff4444, { transparent: true, opacity: 0, emissive: 0xff2222, emissiveIntensity: 0.5 }));
    bossParts.glow.position.y = 1; body.add(bossParts.glow);
  })();

  // ===== Combat VFX (MOBA feel) — models unchanged =====
  const MAX_PARTICLES = 72;
  const projectiles = [];
  const fxMeshes = []; // slash arcs, rings, beams — temporary
  const particlePool = [];

  // Telegraph / impact helpers on boss
  bossParts.telegraph = new THREE.Mesh(
    new THREE.RingGeometry(0.35, 0.55, 24),
    mat(0xff3333, { transparent: true, opacity: 0, emissive: 0xff2222, emissiveIntensity: 0.8 })
  );
  bossParts.telegraph.rotation.x = -Math.PI / 2;
  bossParts.telegraph.position.set(0, 0.05, 0.35);
  boss.add(bossParts.telegraph);

  bossParts.hitFlashMat = [];
  boss.traverse(ch => {
    if (ch.isMesh && ch.material && ch.material.emissive) bossParts.hitFlashMat.push(ch.material);
  });

  state.hitStop = 0;
  state.knockT = 0;
  state.knockDir = 0;
  state.bossHitT = 0;
  state.telegraphT = 0;
  state.levelUpT = 0;
  state.timeScale = 1;
  hero.userData.baseX = -1.55;
  boss.userData.baseX = 1.55;

  function acquireParticle() {
    let p = particlePool.pop();
    if (!p) {
      p = box(0.07, 0.07, 0.07, SUN, { emissive: SUN, emissiveIntensity: 0.7, transparent: true, opacity: 1 });
    }
    p.visible = true;
    return p;
  }
  function releaseParticle(p) {
    p.visible = false;
    if (p.parent) p.parent.remove(p);
    if (particlePool.length < MAX_PARTICLES) particlePool.push(p);
  }

  function spawnParticle(x, y, z, color, n = 12, speed = 0.08) {
    if (state.reduced) n = Math.min(n, 6);
    const room = MAX_PARTICLES - state.particles.length;
    n = Math.min(n, Math.max(0, room));
    for (let i = 0; i < n; i++) {
      const p = acquireParticle();
      p.material.color.setHex(color);
      p.material.emissive.setHex(color);
      p.material.emissiveIntensity = 0.75;
      p.material.opacity = 1;
      p.position.set(x, y, z);
      p.scale.setScalar(0.7 + Math.random() * 0.8);
      p.userData.v = new THREE.Vector3((Math.random() - 0.5) * speed, Math.random() * speed * 1.2, (Math.random() - 0.5) * speed);
      p.userData.life = 1;
      p.userData.decay = 1.6 + Math.random() * 1.2;
      scene.add(p);
      state.particles.push(p);
    }
  }

  function addFxMesh(mesh, life) {
    mesh.userData.life = life;
    mesh.userData.maxLife = life;
    scene.add(mesh);
    fxMeshes.push(mesh);
    return mesh;
  }

  function spawnShockwave(x, y, z, color, scale = 1) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.15, 0.28, 28),
      mat(color, { transparent: true, opacity: 0.9, emissive: color, emissiveIntensity: 0.9 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, y, z);
    ring.userData.grow = 3.5 * scale;
    addFxMesh(ring, 0.45);
  }

  function spawnSlashArc(from, to, color) {
    const mid = from.clone().lerp(to, 0.45);
    mid.y += 0.35;
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(0.85, 0.06, 6, 18, Math.PI * 0.85),
      mat(color, { transparent: true, opacity: 0.95, emissive: color, emissiveIntensity: 1 })
    );
    arc.position.copy(mid);
    arc.rotation.set(-0.4, 0.6, 0.9);
    arc.userData.spin = 8;
    addFxMesh(arc, 0.28);
  }

  function spawnTrailProjectile(origin, target, color, kind) {
    const body = box(
      kind === 'chem_gio' ? 0.12 : 0.32,
      kind === 'chem_gio' ? 0.55 : 0.1,
      kind === 'chem_gio' ? 0.06 : 0.32,
      color,
      { emissive: color, emissiveIntensity: 1, metalness: 0.4 }
    );
    body.position.copy(origin);
    const dir = target.clone().sub(origin);
    const dist = dir.length();
    dir.normalize();
    body.userData.v = dir.multiplyScalar(0.11);
    body.userData.life = Math.min(0.55, dist / 6);
    body.userData.trailColor = color;
    body.userData.trailAcc = 0;
    if (kind === 'chem_gio') body.rotation.z = -0.9;
    scene.add(body);
    projectiles.push(body);
    return body;
  }

  function spawnAoEPillar(x, z, color) {
    const pillar = box(0.35, 2.8, 0.35, color, { transparent: true, opacity: 0.55, emissive: color, emissiveIntensity: 1 });
    pillar.position.set(x, 1.4, z);
    pillar.userData.shrink = true;
    addFxMesh(pillar, 0.55);
    spawnShockwave(x, 0.08, z, color, 1.6);
    spawnParticle(x, 1.2, z, color, 22, 0.14);
    spawnParticle(x, 1.4, z, 0xffffff, 10, 0.1);
  }

  function hitStop(ms) {
    state.hitStop = Math.max(state.hitStop, ms / 1000);
  }

  function applyVisuals() {
    const a = state.armor, atk = state.atk, sk = state.skillLv;
    heroParts.shoulderL.visible = a >= 1;
    heroParts.shoulderR.visible = a >= 1;
    heroParts.armWrapL.visible = a >= 1;
    heroParts.armWrapR.visible = a >= 1;
    heroParts.chestPlate.visible = a >= 2;
    heroParts.shoulderGoldL.visible = a >= 3;
    heroParts.shoulderGoldR.visible = a >= 3;
    heroParts.bootGoldL.visible = a >= 2;
    heroParts.bootGoldR.visible = a >= 2;
    heroParts.badgeBig.visible = a >= 3;
    heroParts.bandBadge.visible = sk >= 2 || a >= 3;
    heroParts.shuriken.visible = sk === 0;
    heroParts.blades.visible = sk === 1;
    heroParts.dragonStar.visible = sk >= 2;
    heroParts.aura.visible = sk >= 2;
    heroParts.aura2.visible = sk >= 2;
    const glow = Math.min(1, 0.2 + atk * 0.08);
    const setEmissive = (obj, c, inten) => obj.traverse(ch => {
      if (ch.material && ch.material.emissive) {
        ch.material.emissive.setHex(c);
        ch.material.emissiveIntensity = inten;
      }
    });
    if (sk === 0) setEmissive(heroParts.shuriken, SUN, glow);
    if (sk === 1) setEmissive(heroParts.blades, SUN, glow + 0.15);
    if (sk >= 2) setEmissive(heroParts.dragonStar, SUN, glow + 0.35);
    const auraCol = sk >= 2 ? TEAL : (atk >= 3 ? 0xff6b35 : SUN);
    if (heroParts.aura.material) {
      heroParts.aura.material.color.setHex(auraCol);
      heroParts.aura.material.emissive.setHex(auraCol);
    }
    state.auraColor.setHex(auraCol);
    const ws = 1 + Math.min(0.45, atk * 0.06);
    heroParts.weapons.scale.setScalar(ws);
  }

  function resize() {
    const parent = canvas.parentElement;
    const w = Math.max(2, (parent && parent.clientWidth) || canvas.clientWidth || 320);
    const h = Math.max(2, (parent && parent.clientHeight) || canvas.clientHeight || 200);
    canvas.width = w; canvas.height = h;
    renderer.setSize(w, h, false);
    if (composer && composer.setSize) composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  let last = performance.now();
  function tick(now) {
    if (!state.running) return;
    requestAnimationFrame(tick);
    let dt = Math.min(0.05, (now - last) / 1000); last = now;

    // Hit-stop / freeze frames
    if (state.hitStop > 0) {
      state.hitStop -= dt;
      dt *= 0.08; // near-freeze
    }

    const t = now * 0.001;

    // idle bob (respect knock)
    const heroKnock = state.knockT > 0 && state.knockDir < 0 ? -0.35 * state.knockT : 0;
    const bossKnock = state.knockT > 0 && state.knockDir > 0 ? 0.4 * state.knockT : 0;
    if (state.knockT > 0) state.knockT -= dt * 2.2;

    hero.position.y = Math.sin(t * 2.2) * 0.03;
    boss.position.y = Math.sin(t * 2.0 + 1) * 0.02;
    if (heroParts.shuriken.visible) heroParts.shuriken.rotation.z += dt * (2.5 + state.atk * 0.4);
    if (heroParts.dragonStar.visible) heroParts.dragonStar.rotation.z += dt * 3.5;
    if (heroParts.aura.visible) {
      heroParts.aura.rotation.z += dt * 1.5;
      heroParts.aura2.rotation.z -= dt * 1.1;
      heroParts.aura.material.opacity = 0.55 + Math.sin(t * 4) * 0.2;
    }

    // attack lunge
    if (state.atkAnim > 0) {
      state.atkAnim -= dt;
      const k = Math.max(0, state.atkAnim);
      hero.position.x = hero.userData.baseX + Math.sin((1 - k) * Math.PI) * 1.35 + heroKnock;
      hero.rotation.y = Math.sin((1 - k) * Math.PI) * 0.45;
    } else {
      hero.position.x = hero.userData.baseX + heroKnock;
      hero.rotation.y = 0.15;
    }

    // boss telegraph pulse
    if (state.telegraphT > 0) {
      state.telegraphT -= dt;
      const p = state.telegraphT;
      bossParts.telegraph.material.opacity = Math.min(0.95, p * 2.2);
      const s = 1 + (1 - Math.min(1, p)) * 1.4;
      bossParts.telegraph.scale.set(s, s, s);
    } else {
      bossParts.telegraph.material.opacity = 0;
      bossParts.telegraph.scale.set(1, 1, 1);
    }

    if (state.bossAnim > 0) {
      state.bossAnim -= dt;
      const k = Math.max(0, state.bossAnim);
      boss.position.x = boss.userData.baseX - Math.sin((1 - k) * Math.PI) * 1.15 + bossKnock;
      bossParts.glow.material.opacity = k * 0.5;
    } else {
      boss.position.x = boss.userData.baseX + bossKnock;
      bossParts.glow.material.opacity = 0;
    }

    // boss hit flash reaction
    if (state.bossHitT > 0) {
      state.bossHitT -= dt;
      const f = Math.min(1, state.bossHitT * 5);
      bossParts.hitFlashMat.forEach(m => { m.emissiveIntensity = 0.2 + f * 1.4; m.emissive.setHex(0xff2222); });
      boss.rotation.z = Math.sin(state.bossHitT * 40) * 0.08 * f;
    } else {
      boss.rotation.z = 0;
    }

    // level-up pillar local
    if (state.levelUpT > 0) {
      state.levelUpT -= dt;
    }

    // projectiles + trails
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const pr = projectiles[i];
      pr.position.addScaledVector(pr.userData.v, dt * 60);
      pr.userData.life -= dt;
      pr.rotation.z += dt * (pr.userData.spin || 12);
      pr.userData.trailAcc = (pr.userData.trailAcc || 0) + dt;
      if (!state.reduced && pr.userData.trailAcc > 0.03) {
        pr.userData.trailAcc = 0;
        spawnParticle(pr.position.x, pr.position.y, pr.position.z, pr.userData.trailColor || SUN, 2, 0.04);
      }
      if (pr.userData.life <= 0) { scene.remove(pr); projectiles.splice(i, 1); }
    }

    // fx meshes (slash, rings, pillars)
    for (let i = fxMeshes.length - 1; i >= 0; i--) {
      const m = fxMeshes[i];
      m.userData.life -= dt;
      const lifeRatio = m.userData.life / m.userData.maxLife;
      if (m.material) m.material.opacity = Math.max(0, lifeRatio);
      if (m.userData.grow) {
        const s = 1 + (1 - lifeRatio) * m.userData.grow;
        m.scale.set(s, s, s);
      }
      if (m.userData.spin) m.rotation.z += dt * m.userData.spin;
      if (m.userData.shrink) m.scale.y = Math.max(0.1, lifeRatio);
      if (m.userData.life <= 0) {
        scene.remove(m);
        if (m.geometry) m.geometry.dispose();
        fxMeshes.splice(i, 1);
      }
    }

    // particles
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.position.add(p.userData.v);
      p.userData.v.y -= 0.004;
      p.userData.life -= dt * (p.userData.decay || 1.8);
      p.material.opacity = Math.max(0, p.userData.life);
      p.material.transparent = true;
      if (p.userData.life <= 0) {
        state.particles.splice(i, 1);
        releaseParticle(p);
      }
    }

    // camera shake
    if (state.shakeT > 0) {
      state.shakeT -= dt;
      const a = state.shakeAmp * Math.max(0, state.shakeT);
      camera.position.x = camBase.x + (Math.random() - 0.5) * a;
      camera.position.y = camBase.y + (Math.random() - 0.5) * a * 0.65;
    } else {
      camera.position.copy(camBase);
    }

    if (state.hitFlash > 0) {
      state.hitFlash -= dt;
      const a = Math.min(0.4, state.hitFlash * 1.5);
      renderer.setClearColor(state.hitFlashColor || 0xffffff, 1);
      // blend via scene fog-ish: temporarily tint lights
    } else {
      renderer.setClearColor(0x4a90b8, 1);
    }

    if (composer && bloomOn) composer.render();
    else renderer.render(scene, camera);
  }

  function applyStageTheme(key) {
    state.stageKey = key || 'hotel';
    const factory = state.stageKey === 'factory';
    // Minimal palette swap — không beautify model
    scene.background.setHex(factory ? 0x5a6a72 : 0x4a90b8);
    renderer.setClearColor(factory ? 0x5a6a72 : 0x4a90b8, 1);
    try {
      // hard-hat tint on boss hair-ish / band if present
      boss.traverse(ch => {
        if (!ch.isMesh || !ch.material || !ch.material.color) return;
        // skip particles
      });
      if (factory) {
        // small orange block as hard hat (once)
        if (!boss.userData.hardHat) {
          const hat = box(0.5, 0.18, 0.45, 0xff8c1a, { metalness: 0.2 });
          hat.position.set(0, 1.95, 0);
          boss.add(hat);
          boss.userData.hardHat = hat;
        }
        boss.userData.hardHat.visible = true;
      } else if (boss.userData.hardHat) {
        boss.userData.hardHat.visible = false;
      }
    } catch (e) {}
  }

  async function setupBloom() {
    await postReady;
    if (!postOk || state.reduced) return;
    try {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new BloomEffect({
        intensity: 0.55,
        luminanceThreshold: 0.72,
        luminanceSmoothing: 0.3,
        mipmapBlur: true
      });
      composer.addPass(new EffectPass(camera, bloom));
      bloomOn = true;
      const _r = resize;
      // keep composer size in sync
      const origResize = resize;
      // monkey: call setSize on composer inside resize via wrap
    } catch (e) {
      console.warn('bloom setup fail', e);
      composer = null; bloomOn = false;
    }
  }
  setupBloom();

  resize();
  applyVisuals();
  applyStageTheme('hotel');
  requestAnimationFrame(tick);
  window.addEventListener('resize', resize, { passive: true });

  // wrap resize to sync composer
  const _resize = resize;
  function resizeWithComposer() {
    _resize();
    if (composer && composer.setSize) {
      const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
      composer.setSize(w, h);
    }
  }
  window.removeEventListener('resize', resize);
  window.addEventListener('resize', resizeWithComposer, { passive: true });

  return {
    resize: resizeWithComposer,
    setStage(key) { applyStageTheme(key); },
    setVisual({ armor = 0, atk = 0, skillLv = 0 } = {}) {
      state.armor = armor; state.atk = atk; state.skillLv = skillLv; applyVisuals();
    },
    /** @returns {{ impactAt:number }} ms until impact for syncing float dmg */
    playHeroAttack(kind = 'phi_tieu') {
      const origin = new THREE.Vector3(hero.position.x, 1.05, hero.position.z);
      const target = new THREE.Vector3(boss.position.x, 1.25, boss.position.z);
      let impactAt = 180;
      state.atkAnim = 0.32;

      if (kind === 'phi_tieu') {
        spawnTrailProjectile(origin, target, SUN, 'phi_tieu');
        spawnParticle(origin.x, origin.y, origin.z, SUN, 8, 0.06);
        impactAt = 200;
        setTimeout(() => {
          spawnParticle(target.x, target.y, target.z, SUN, 16, 0.12);
          spawnParticle(target.x, target.y, target.z, 0xffffff, 8, 0.09);
          spawnShockwave(target.x, 0.1, target.z, SUN, 0.9);
          state.bossHitT = 0.28;
          state.knockT = 0.45; state.knockDir = 1;
          hitStop(70);
          state.shakeT = 0.2; state.shakeAmp = 0.14;
          state.hitFlash = 0.12; state.hitFlashColor = SUN;
        }, impactAt);
      } else if (kind === 'chem_gio') {
        spawnSlashArc(origin, target, 0xffe08a);
        spawnTrailProjectile(origin.clone().add(new THREE.Vector3(0, 0.2, 0)), target, GOLD, 'chem_gio');
        impactAt = 160;
        setTimeout(() => {
          spawnSlashArc(target.clone().add(new THREE.Vector3(-0.3, 0, 0)), target, SUN);
          spawnParticle(target.x, target.y, target.z, GOLD, 18, 0.13);
          spawnParticle(target.x, target.y, target.z, 0xffffff, 10, 0.1);
          spawnShockwave(target.x, 0.12, target.z, GOLD, 1.1);
          state.bossHitT = 0.35;
          state.knockT = 0.55; state.knockDir = 1;
          hitStop(80);
          state.shakeT = 0.26; state.shakeAmp = 0.18;
          state.hitFlash = 0.14; state.hitFlashColor = GOLD;
        }, impactAt);
      } else {
        // Long Hạ ultimate — AoE
        spawnParticle(origin.x, origin.y, origin.z, TEAL, 14, 0.1);
        spawnAoEPillar(target.x, target.z, TEAL);
        const p2 = spawnTrailProjectile(origin, target, TEAL, 'long_ha');
        p2.scale.setScalar(1.4);
        impactAt = 220;
        setTimeout(() => {
          spawnAoEPillar(target.x, target.z, SUN);
          spawnShockwave(target.x, 0.1, target.z, TEAL, 2.2);
          spawnShockwave(target.x, 0.15, target.z, SUN, 1.4);
          spawnParticle(target.x, target.y, target.z, TEAL, 28, 0.16);
          spawnParticle(target.x, target.y + 0.4, target.z, 0xffffff, 14, 0.12);
          state.bossHitT = 0.5;
          state.knockT = 0.7; state.knockDir = 1;
          hitStop(90);
          state.shakeT = 0.4; state.shakeAmp = 0.32;
          state.hitFlash = 0.22; state.hitFlashColor = TEAL;
        }, impactAt);
      }
      return { impactAt };
    },
    playBossAttack() {
      // telegraph then strike
      state.telegraphT = 0.35;
      state.shakeT = 0.12; state.shakeAmp = 0.06;
      setTimeout(() => {
        state.bossAnim = 0.38;
        state.shakeT = 0.32; state.shakeAmp = 0.22;
        state.hitFlash = 0.2; state.hitFlashColor = 0xff3030;
        state.knockT = 0.5; state.knockDir = -1;
        hitStop(75);
        const tpos = new THREE.Vector3(hero.position.x, 1.05, hero.position.z);
        spawnParticle(tpos.x, tpos.y, tpos.z, 0xff5555, 18, 0.12);
        spawnShockwave(tpos.x, 0.08, tpos.z, 0xff3333, 1.0);
      }, 320);
      return { impactAt: 320 };
    },
    playLevelUp() {
      state.levelUpT = 0.9;
      const x = hero.position.x, z = hero.position.z;
      spawnAoEPillar(x, z, SUN);
      spawnShockwave(x, 0.08, z, SUN, 1.8);
      spawnShockwave(x, 0.12, z, TEAL, 1.2);
      spawnParticle(x, 1.2, z, SUN, 20, 0.12);
      spawnParticle(x, 1.5, z, 0xffffff, 10, 0.08);
      state.shakeT = 0.18; state.shakeAmp = 0.1;
    },
    burstAtBoss(color = SUN) {
      spawnParticle(boss.position.x, 1.2, boss.position.z, color, 18, 0.1);
    },
    /** Red flash on boss materials for ms (default 150) */
    flashBoss(ms = 150) {
      state.bossHitT = Math.max(state.bossHitT, ms / 1000);
      state.shakeT = Math.max(state.shakeT, ms / 1000);
      state.shakeAmp = Math.max(state.shakeAmp, 0.16);
      state.hitFlash = Math.max(state.hitFlash, ms / 1000);
      state.hitFlashColor = 0xff3030;
    },
    dispose() {
      state.running = false;
      renderer.dispose();
    },
    get ok() { return !!renderer.getContext(); }
  };
}

export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
  } catch (e) { return false; }
}
