---
name: webgl-atmosphere
description: Decides whether a scene earns WebGL and builds it: Three.js r187 WebGPURenderer + TSL with automatic WebGL2 fallback, OGL for a single shader quad, or Unicorn Studio / Spline when no shader is authored. Covers hero shaders (fluid, noise displacement, hover distortion, particles, grain), DPR caps, render-on-demand, disposal and the poster fallback. Use when the user says "3D", "shader", "WebGL", "particles", "liquid", "תלת מימד", or when a territory calls for atmosphere CSS cannot give.
---

# WebGL atmosphere — earned, not sprinkled

This skill opens only when the contract's `**Opened:**` line names WebGL; the WebGL scene's own pitch and lock are the extra lock that line opens.

WebGL is for atmosphere, not spectacle. One scene, usually the hero or the remembered moment.
If the same feeling is reachable with a video loop, grain and light in CSS, do that.

## 1. Earned when
- The concept is about material or light (steam, water, fabric, neon) and photography cannot move the way the story needs.
- The effect is continuous with scroll or cursor, not a one-off.
- The budget allows: under 300 KB extra JS gzipped, DPR 1.5, 60 fps at 4x throttle on 390 px, and a poster fallback that is itself a finished image.

## 2. Stack choice
| Case | Use |
|---|---|
| Full scene, lighting, models, post | Three.js r187, `WebGPURenderer` + TSL nodes (compiles to WGSL and GLSL; WebGL2 fallback is automatic) |
| One fullscreen shader quad (noise, fluid, distortion) | OGL (~29 KB) or Three with a single `MeshBasicNodeMaterial` |
| No shader author available | Unicorn Studio scene (keep one per page) or Spline V2 export (watermark on free plan) |
| React project | React Three Fiber 9.8 + Drei 10 (postprocessing via three/addons/tsl, not @react-three/postprocessing) |

## 3. Recipes (TSL)
- **Noise displacement image**: plane with the hero image as texture, `uv().add(mx_noise_vec3(positionWorld.mul(2).add(time.mul(0.1))).xy.mul(0.02))`, driven by a `uniform(float)` progress tied to ScrollTrigger scrub.
- **Hover distortion**: pointer velocity to a uniform, UV warp falls off with `smoothstep` from the pointer; lerp velocity to zero each frame.
- **Fluid**: ping-pong render targets (advect, divergence, pressure, gradient subtract); cursor adds velocity; use the fluid as a displacement map over type or image.
- **Particles**: TSL compute (`instancedArray`, `Fn().compute(count)`), 20k to 100k points, sprite texture, additive blending, alpha by depth.
- **Grain and post**: `PostProcessing` from `three/addons/tsl` with film grain, slight chromatic aberration, bloom only if the palette is dark.
- **Models**: Blender to glTF, `gltf-transform optimize --compress meshopt --texture-compress ktx2` (`asset-pipeline`); KTX2 textures; one directional light + environment map, no shadow maps on mobile.

## 4. Discipline
```js
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
// render on demand: only while in view and while something changes
const io = new IntersectionObserver(([e]) => (active = e.isIntersecting));
document.addEventListener('visibilitychange', () => (active = !document.hidden));
```
- Attach after `load` or idle; the poster `<img>` is the LCP and stays under the canvas until the first frame renders, then cross-fades.
- Dispose geometries, materials, textures and render targets on scene teardown and route change.
- Fewer than 10 WebGL contexts per page (one is the goal).
- `prefers-reduced-motion`: shader loops stop at a chosen still frame; cursor reactions off.
- Low-end flag from `cinematic-build` main.js: skip the canvas, keep the poster.
- Fallback chain: WebGPU -> WebGL2 -> poster. Test Safari 26 (iOS), Chrome Android and Firefox.

## 5. Review
Record the scene at 390 and 1440 (`visual-review`), trace with Chrome DevTools MCP at 4x CPU, check GPU memory and long tasks, confirm the poster-only variant reads as the same design.
