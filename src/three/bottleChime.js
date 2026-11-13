import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// The cobalt-glass bottle chime that hangs over TiinTiin's stoep, rebuilt in 3D.
// Real transmission (refraction of the stoep photo behind), pendulum physics,
// and "wind" from scroll velocity and the cursor.

const ARCH_W = 4.4;
const ARCH_H = 6.2;

function archShape(w, h, inset = 0) {
  const r = w / 2 - inset;
  const bottom = -h / 2 + inset;
  const springY = h / 2 - w / 2; // where the semicircle starts
  const s = new THREE.Shape();
  s.moveTo(-r, bottom);
  s.lineTo(r, bottom);
  s.lineTo(r, springY);
  s.absarc(0, springY, r, 0, Math.PI, false);
  s.lineTo(-r, bottom);
  return s;
}

function bottleProfile(kind) {
  // [radius, y] from the base up, for LatheGeometry
  if (kind === 'hock') {
    return [
      [0, 0], [0.24, 0], [0.29, 0.03], [0.3, 0.12], [0.3, 1.25], [0.27, 1.55], [0.18, 1.95],
      [0.105, 2.3], [0.095, 2.75], [0.12, 2.78], [0.125, 2.86], [0.1, 2.9], [0, 2.9],
    ];
  }
  if (kind === 'apothecary') {
    return [
      [0, 0], [0.34, 0], [0.4, 0.06], [0.42, 0.2], [0.42, 0.95], [0.38, 1.12], [0.24, 1.26],
      [0.13, 1.32], [0.12, 1.62], [0.15, 1.65], [0.15, 1.74], [0.11, 1.78], [0, 1.78],
    ];
  }
  // tall cordial bottle
  return [
    [0, 0], [0.2, 0], [0.24, 0.03], [0.25, 0.12], [0.25, 1.7], [0.22, 1.9], [0.12, 2.2],
    [0.085, 2.45], [0.08, 3.05], [0.1, 3.08], [0.1, 3.16], [0.075, 3.2], [0, 3.2],
  ];
}

/**
 * @param {object} opts
 * @param {boolean} [opts.mobile] narrow screen: fewer bottles, lower resolution
 * @param {boolean} [opts.lite]   touch device: cheaper glass (no refraction pass), ~30fps, and the
 *                                scene holds still while the page scrolls so the GPU is free for it.
 */
export function createBottleChime(container, { imageUrl, mobile = false, lite = false, onReady } = {}) {
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !lite, powerPreference: 'high-performance' });
  const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.8);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
  camera.position.set(0, -0.2, 12.5);

  // ---- arch with the stoep photo ----
  const archGroup = new THREE.Group();
  archGroup.position.set(0, -0.35, -2.2);
  scene.add(archGroup);

  const photoGeo = new THREE.ShapeGeometry(archShape(ARCH_W, ARCH_H, 0.02), 48);
  // map shape coords to 0..1 UVs (cover-fit for a 4:3 landscape photo)
  const uv = photoGeo.attributes.uv;
  const pos = photoGeo.attributes.position;
  const imgAspect = 4 / 3;
  const archAspect = ARCH_W / ARCH_H;
  const sx = archAspect / imgAspect; // portion of the image width we show
  for (let i = 0; i < uv.count; i++) {
    const u = pos.getX(i) / ARCH_W + 0.5;
    const v = pos.getY(i) / ARCH_H + 0.5;
    uv.setXY(i, 0.5 + (u - 0.5) * sx - 0.06, v);
  }
  const photoMat = new THREE.MeshBasicMaterial({ color: 0x6a6f7e, toneMapped: false });
  const photo = new THREE.Mesh(photoGeo, photoMat);
  archGroup.add(photo);

  new THREE.TextureLoader().load(imageUrl, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    photoMat.map = tex;
    photoMat.color.set(0xb9bcc8);
    photoMat.needsUpdate = true;
    // draw right away, so the canvas is never blank even if the page is mid-scroll (lite holds still then)
    renderer.render(scene, camera);
    onReady?.();
  });

  // cobalt plaster frame, like TiinTiin's window surrounds
  const frameShape = archShape(ARCH_W + 0.7, ARCH_H + 0.35);
  frameShape.holes.push(archShape(ARCH_W, ARCH_H));
  const frameGeo = new THREE.ExtrudeGeometry(frameShape, {
    depth: 0.22,
    bevelEnabled: true,
    bevelSize: 0.06,
    bevelThickness: 0.06,
    bevelSegments: 3,
    curveSegments: 48,
  });
  frameGeo.translate(0, 0.175, -0.12);
  const frame = new THREE.Mesh(
    frameGeo,
    new THREE.MeshStandardMaterial({ color: 0x1a36a8, roughness: 0.86, metalness: 0, envMapIntensity: 0.22 })
  );
  archGroup.add(frame);

  // ---- bottles ----
  // Real glass (transmission + dispersion) renders the whole scene a second time every frame to
  // refract it; on touch devices a transparent, clear-coated cobalt reads the same at phone size.
  const glass = lite
    ? new THREE.MeshPhysicalMaterial({
        color: 0x1638d8,
        metalness: 0,
        roughness: 0.08,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        specularIntensity: 0.9,
        envMapIntensity: 0.9,
      })
    : new THREE.MeshPhysicalMaterial({
        color: 0x86a2ff,
        metalness: 0,
        roughness: 0.025,
        transmission: 1,
        thickness: 0.32,
        ior: 1.47,
        dispersion: 0.25,
        attenuationColor: new THREE.Color(0x1438d6),
        attenuationDistance: 1.25,
        clearcoat: 1,
        clearcoatRoughness: 0.03,
        specularIntensity: 1,
        envMapIntensity: 1.7,
      });

  const kinds = ['hock', 'cordial', 'apothecary'];
  const geos = Object.fromEntries(
    kinds.map((k) => {
      const g = new THREE.LatheGeometry(
        bottleProfile(k).map(([r, y]) => new THREE.Vector2(r, y)),
        lite ? 32 : mobile ? 36 : 56
      );
      g.computeVertexNormals();
      return [k, g];
    })
  );

  const layout = mobile
    ? [
        { x: -1.3, z: 0.9, len: 3.4, kind: 'hock', s: 0.74 },
        { x: -0.3, z: 1.6, len: 5.0, kind: 'cordial', s: 0.7 },
        { x: 0.75, z: 0.4, len: 3.0, kind: 'apothecary', s: 0.8 },
        { x: 1.55, z: 1.3, len: 4.4, kind: 'hock', s: 0.68 },
      ]
    : [
        { x: -2.1, z: 0.6, len: 3.6, kind: 'hock', s: 0.78 },
        { x: -1.3, z: 1.7, len: 5.2, kind: 'cordial', s: 0.72 },
        { x: -0.45, z: 0.2, len: 3.0, kind: 'apothecary', s: 0.82 },
        { x: 0.35, z: 1.3, len: 4.5, kind: 'hock', s: 0.7 },
        { x: 1.1, z: 2.2, len: 6.0, kind: 'cordial', s: 0.64 },
        { x: 1.85, z: 0.7, len: 3.7, kind: 'apothecary', s: 0.76 },
        { x: 2.55, z: 1.6, len: 4.9, kind: 'hock', s: 0.66 },
      ];

  const ANCHOR_Y = 6.4;
  const wireMat = new THREE.LineBasicMaterial({ color: 0xc9ccd6, transparent: true, opacity: 0.55 });
  const bottles = layout.map((b, i) => {
    const pivot = new THREE.Group();
    pivot.position.set(b.x, ANCHOR_Y, b.z);
    scene.add(pivot);

    const mesh = new THREE.Mesh(geos[b.kind], glass);
    const height = bottleProfile(b.kind).at(-1)[1];
    mesh.scale.setScalar(b.s);
    // hang neck-up: the top of the neck sits `len` below the pivot
    mesh.position.y = -b.len - height * b.s;
    pivot.add(mesh);

    // little wire loop/cap at the neck
    const cap = new THREE.Mesh(
      new THREE.TorusGeometry(0.108 * b.s, 0.013, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0xb8bcc6, metalness: 1, roughness: 0.3 })
    );
    cap.position.y = -b.len - 0.1 * b.s;
    cap.rotation.x = Math.PI / 2;
    pivot.add(cap);

    const wireGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -b.len, 0)]);
    const wire = new THREE.Line(wireGeo, wireMat);
    pivot.add(wire);

    return {
      pivot,
      mesh,
      len: b.len + height * b.s * 0.5,
      ax: (Math.random() - 0.5) * 0.06, // swing around z (left/right)
      az: (Math.random() - 0.5) * 0.04, // swing around x (front/back)
      vx: 0,
      vz: 0,
      spin: Math.random() * Math.PI * 2,
      spinV: (Math.random() - 0.5) * 0.25,
      seed: i * 1.7 + Math.random(),
    };
  });

  // ---- lights ----
  const key = new THREE.DirectionalLight(0xffd6a1, 2.4);
  key.position.set(4, 6, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x6f8dff, 1.6);
  rim.position.set(-5, 2, -4);
  scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));

  // ---- interaction ----
  const pointer = { x: 0, y: 0, px: 0, py: 0, inside: false, vx: 0 };
  const raycastPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -1);
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const hit = new THREE.Vector3();
  let gust = 0;
  let camTX = 0;
  let camTY = 0;

  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(raycastPlane, hit)) {
      pointer.vx = hit.x - pointer.x;
      pointer.px = pointer.x;
      pointer.py = pointer.y;
      pointer.x = hit.x;
      pointer.y = hit.y;
    }
    pointer.inside = true;
    camTX = ndc.x * 0.5;
    camTY = ndc.y * 0.3;
  };
  const onLeave = () => {
    pointer.inside = false;
    camTX = 0;
    camTY = 0;
  };
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);

  // ---- loop ----
  let raf = 0;
  let visible = false;
  let last = performance.now();
  let time = 0;
  let windTarget = 0;
  let lastScroll = -1e9;
  let lastDraw = 0;
  const onScroll = () => {
    lastScroll = performance.now();
  };
  if (lite) window.addEventListener('scroll', onScroll, { passive: true });

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the arch framed on tall or narrow canvases
    camera.fov = camera.aspect < 0.62 ? 40 : 32;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const step = (now) => {
    raf = 0;
    if (!visible || document.hidden) return;
    raf = requestAnimationFrame(step);
    if (lite) {
      // Touch: hold still while the page scrolls (the last frame stays on screen), ~30fps otherwise.
      if (now - lastScroll < 160) {
        last = now;
        return;
      }
      if (now - lastDraw < 32) return;
      lastDraw = now;
    }
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    time += dt;

    gust += (windTarget - gust) * 0.06;
    windTarget *= 0.92;
    const breeze = Math.sin(time * 0.6) * 0.15 + Math.sin(time * 1.37 + 1.2) * 0.08;

    for (const b of bottles) {
      const g = 9.8 / b.len;
      // breeze + gust push mostly left/right, a little front/back
      let fx = (breeze + gust) * 0.55 * (0.7 + 0.3 * Math.sin(time * 0.9 + b.seed));
      let fz = (breeze * 0.4 + gust * 0.25) * Math.cos(time * 0.7 + b.seed);
      if (pointer.inside) {
        const bx = b.pivot.position.x + Math.sin(b.ax) * b.len;
        const by = ANCHOR_Y - Math.cos(b.ax) * b.len;
        const d = Math.hypot(pointer.x - bx, pointer.y - by);
        if (d < 1.1) {
          fx += pointer.vx * 26 * (1 - d / 1.1);
          fz += pointer.vx * 6 * (1 - d / 1.1);
        }
      }
      b.vx += (-g * Math.sin(b.ax) - 0.9 * b.vx + fx) * dt;
      b.vz += (-g * Math.sin(b.az) - 0.9 * b.vz + fz) * dt;
      b.ax += b.vx * dt;
      b.az += b.vz * dt;
      b.ax = THREE.MathUtils.clamp(b.ax, -0.6, 0.6);
      b.az = THREE.MathUtils.clamp(b.az, -0.45, 0.45);
      b.spinV += (Math.sin(time * 0.3 + b.seed) * 0.05 - b.spinV * 0.4 + b.vx * 0.6) * dt;
      b.spin += b.spinV * dt;
      b.pivot.rotation.set(b.az, 0, b.ax);
      b.mesh.rotation.y = b.spin;
    }
    pointer.vx *= 0.8;

    camera.position.x += (camTX - camera.position.x) * 0.04;
    camera.position.y += (-0.2 + camTY - camera.position.y) * 0.04;
    camera.lookAt(0, 0.2, 0);

    renderer.render(scene, camera);
  };

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(step);
    }
  });
  io.observe(canvas);
  const onVis = () => {
    if (!document.hidden && visible && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(step);
    }
  };
  document.addEventListener('visibilitychange', onVis);

  return {
    /** feed scroll velocity (px/s); fast scrolling becomes a gust */
    wind(v) {
      const w = THREE.MathUtils.clamp(v / 900, -2.2, 2.2);
      if (Math.abs(w) > Math.abs(windTarget)) windTarget = w;
    },
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('scroll', onScroll);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      scene.traverse((o) => {
        o.geometry?.dispose?.();
        if (o.material) [].concat(o.material).forEach((m) => {
          m.map?.dispose?.();
          m.dispose?.();
        });
      });
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
