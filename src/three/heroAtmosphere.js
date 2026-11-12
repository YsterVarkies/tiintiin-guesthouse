import * as THREE from 'three';

// Drifting, sun-lit dust motes + soft god-rays over the hero photo.
// It turns a still photograph into something that feels filmed.

const dustVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  attribute float aSeed;
  attribute float aScale;
  varying float vAlpha;
  varying float vSeed;

  void main() {
    vec3 p = position;
    float speed = 0.12 + aSeed * 0.22;
    float t = uTime * speed;
    p.y = mod(p.y + t * 0.55 + 5.0, 10.0) - 5.0;
    p.x = mod(p.x + sin(t * 1.4 + aSeed * 12.0) * 0.45 + uTime * 0.06 * (aSeed - 0.35) + 9.0, 18.0) - 9.0;
    p.z += cos(t * 1.1 + aSeed * 7.0) * 0.3;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aScale * uPixelRatio * (9.0 / -mv.z);

    float edge = smoothstep(-5.0, -3.6, p.y) * (1.0 - smoothstep(3.6, 5.0, p.y));
    float twinkle = 0.5 + 0.5 * sin(uTime * (1.2 + aSeed * 2.4) + aSeed * 40.0);
    vAlpha = edge * (0.35 + 0.65 * twinkle);
    vSeed = aSeed;
  }
`;

const dustFragment = /* glsl */ `
  uniform float uFade;
  uniform vec2 uResolution;
  uniform vec3 uWarm;
  uniform vec3 uCool;
  varying float vAlpha;
  varying float vSeed;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float a = smoothstep(0.5, 0.0, d);
    a = a * a;
    vec2 uv = gl_FragCoord.xy / uResolution;
    // motes catch the light most in the sun-shaft from the top right
    float sun = smoothstep(0.15, 1.1, uv.x * 0.75 + uv.y * 0.55);
    vec3 col = mix(uCool, uWarm, smoothstep(0.2, 0.9, vSeed));
    gl_FragColor = vec4(col, a * vAlpha * uFade * (0.18 + 0.82 * sun));
  }
`;

const raysVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const raysFragment = /* glsl */ `
  uniform float uTime;
  uniform float uFade;
  uniform float uAspect;
  uniform vec2 uMouse;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    uv.x *= uAspect;
    vec2 src = vec2(uAspect * 1.08, 1.22) + uMouse * vec2(0.04, 0.03);
    vec2 dir = uv - src;
    float ang = atan(dir.y, dir.x);
    float dist = length(dir);

    float r1 = sin(ang * 22.0 + uTime * 0.13) * 0.5 + 0.5;
    float r2 = sin(ang * 37.0 - uTime * 0.09 + 1.7) * 0.5 + 0.5;
    float r3 = sin(ang * 9.0 + uTime * 0.05 + 4.1) * 0.5 + 0.5;
    float rays = pow(r1 * r2, 2.2) * (0.6 + 0.4 * r3);

    float fall = smoothstep(2.1, 0.15, dist);
    float bloom = smoothstep(1.1, 0.0, dist);
    float breathe = 0.85 + 0.15 * sin(uTime * 0.35);

    vec3 col = mix(vec3(1.0, 0.72, 0.42), vec3(1.0, 0.9, 0.75), bloom);
    float a = (rays * 0.16 + bloom * bloom * 0.32) * fall * uFade * breathe;
    gl_FragColor = vec4(col * a, a);
  }
`;

export function createHeroAtmosphere(container, { mobile = false } = {}) {
  // A fresh canvas per mount: React may re-mount, and a released context can't be reused.
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
    premultipliedAlpha: true,
  });
  const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.6);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  // ---- dust ----
  const count = mobile ? 170 : 460;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const scales = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() * 2 - 1) * 9;
    positions[i * 3 + 1] = (Math.random() * 2 - 1) * 5;
    positions[i * 3 + 2] = -6 + Math.random() * 10;
    seeds[i] = Math.random();
    scales[i] = 0.35 + Math.pow(Math.random(), 3) * 1.9;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  dustGeo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

  const dustMat = new THREE.ShaderMaterial({
    vertexShader: dustVertex,
    fragmentShader: dustFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: dpr },
      uSize: { value: mobile ? 7 : 9 },
      uFade: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uWarm: { value: new THREE.Color('#ffd49a') },
      uCool: { value: new THREE.Color('#e9eeff') },
    },
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  // ---- rays (screen-space quad, drawn after the dust) ----
  const raysMat = new THREE.ShaderMaterial({
    vertexShader: raysVertex,
    fragmentShader: raysFragment,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uFade: { value: 0 },
      uAspect: { value: 1 },
      uMouse: { value: new THREE.Vector2() },
    },
  });
  const rays = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), raysMat);
  rays.frustumCulled = false;
  rays.renderOrder = 2;
  scene.add(rays);

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let fade = 0;
  let fadeTarget = 0;
  let visible = true;
  let raf = 0;
  const clock = new THREE.Clock();

  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    dustMat.uniforms.uResolution.value.set(w * dpr, h * dpr);
    raysMat.uniforms.uAspect.value = w / h;
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const tick = () => {
    raf = 0;
    if (!visible || document.hidden) return;
    const t = clock.getElapsedTime();
    pointer.x += (pointer.tx - pointer.x) * 0.045;
    pointer.y += (pointer.ty - pointer.y) * 0.045;
    fade += (fadeTarget - fade) * 0.04;
    camera.position.x = pointer.x * 0.7;
    camera.position.y = -pointer.y * 0.45;
    camera.lookAt(0, 0, 0);
    dustMat.uniforms.uTime.value = t;
    dustMat.uniforms.uFade.value = fade;
    raysMat.uniforms.uTime.value = t;
    raysMat.uniforms.uFade.value = fade;
    raysMat.uniforms.uMouse.value.set(pointer.x, pointer.y);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(tick);
  });
  io.observe(canvas);
  const onVis = () => {
    if (!document.hidden && !raf) raf = requestAnimationFrame(tick);
  };
  document.addEventListener('visibilitychange', onVis);
  raf = requestAnimationFrame(tick);

  return {
    /** -1..1 normalised pointer */
    setPointer(x, y) {
      pointer.tx = x;
      pointer.ty = y;
    },
    /** 0..1 overall strength (fade in after the preloader, out on scroll) */
    setStrength(v) {
      fadeTarget = v;
    },
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      dustGeo.dispose();
      dustMat.dispose();
      rays.geometry.dispose();
      raysMat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
