import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const vertexShader = `
precision mediump float;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision mediump float;

uniform float uTime;
uniform vec2 uResolution;
uniform float uPixelSize;
uniform float uDistortion;
uniform float uChromatic;

varying vec2 vUv;

vec2 barrelDistort(vec2 uv, float amount) {
  vec2 cc = uv - 0.5;
  float r = length(cc);
  float k = 1.0 + amount * (r * r);
  return 0.7 + cc * k;
}

vec2 pixelate(vec2 uv, float pixelSize) {
  if (pixelSize <= 1.0) return uv;
  vec2 px = uResolution.xy / pixelSize;
  return floor(uv * px) / px;
}

vec2 to3D(vec2 uv) {
  float horizon = 0.5;
  float perspective = 1.0;
  
  float depth = (uv.y - horizon) * perspective;
  depth = max(depth, 0.001);
  
  vec2 projected;
  projected.x = (uv.x - 0.5) / (1.0 + abs(depth) * 0.6) + 0.5;
  projected.y = (uv.y - horizon) / (1.0 + abs(depth) * 1.2) + horizon;
  
  return projected;
}

float perspectiveGrid(vec2 uv, float t) {
  vec2 p3d = to3D(uv);
  
  float lines = 0.0;
  float numLines = 20.0;
  
  for(float i = 0.0; i < numLines; i++) {
    float lineY = 0.5 + (i / numLines) * 0.5;
    
    float wave = sin(p3d.x * 6.0 + t * 0.4 + i * 0.2) * 0.03;
    wave += sin(p3d.x * 12.0 + t * 0.25 + i * 0.4) * 0.05;
    
    float lineDist = abs(uv.y - (lineY + wave));
    
    float depth = (uv.y - 0.5) * 1.5;
    depth = max(depth, 0.05);
    float thickness = 0.0002 / max(depth, 0.3);
    
    float line = smoothstep(thickness * 1.5, thickness * 0.5, lineDist);

    float glow1 = smoothstep(thickness * 30.0, thickness * 10.0, lineDist) * 0.1;
    float glow2 = smoothstep(thickness * 50.0, thickness * 20.0, lineDist) * 0.05;
    float glow3 = smoothstep(thickness * 70.0, thickness * 30.0, lineDist) * 0.02;
    
    float totalLine = line + glow1 + glow2 + glow3;
    
    float proximityBoost = 1.0 + (1.0 - depth) * 1.5;
    totalLine *= proximityBoost;
    
    lines += totalLine;
  }
  
  return lines;
}

float waves(vec2 uv, float t){
  vec2 p3d = to3D(uv);
  float y = 0.0;
  float amp = 0.4;
  
  y += sin((p3d.x + t*0.2) * 8.0) * amp;
  y += sin((p3d.x * 1.5 - t*0.4) * 4.0) * (amp * 0.6);
  y += sin((p3d.x * 2.2 + t*0.15) * 12.0) * (amp * 0.35);
  
  float depth = (uv.y - 0.6) * 2.0;
  depth = max(depth, 0.1);
  y /= (1.0 + depth);
  
  return uv.y - (0.7 + y * 0.1);
}

float thinWaves(vec2 uv, float t, float offset){
  vec2 p3d = to3D(uv);
  float y = 0.0;
  float amp = 0.15;
  
  y += sin((p3d.x + t*0.3 + offset) * 12.0) * amp;
  y += sin((p3d.x * 1.8 - t*0.5 + offset) * 6.0) * (amp * 0.7);
  y += sin((p3d.x * 2.5 + t*0.2 + offset) * 18.0) * (amp * 0.4);
  
  float depth = (uv.y - 0.6) * 2.0;
  depth = max(depth, 0.1);
  y /= (1.0 + depth);
  
  return uv.y - (0.7 + y * 0.1 + offset * 0.05);
}


float lineShape(float v, float thickness){
  float f = abs(v);
  return smoothstep(thickness, 0.0, f);
}

void main(){
  vec2 uv = vUv;
  vec2 originalUv = uv;
  uv = barrelDistort(uv, uDistortion * 0.1);

  float perspGrid = perspectiveGrid(uv, uTime);
  
  float w = waves(uv, uTime);
  float lines = lineShape(w, 0.02) * 0.3;

  float thin1 = lineShape(thinWaves(uv, uTime, 0.1), 0.008) * 0.2;
  float thin2 = lineShape(thinWaves(uv, uTime, -0.15), 0.006) * 0.15;
  float thin3 = lineShape(thinWaves(uv, uTime, 0.25), 0.010) * 0.18;

  vec2 noiseUv = uv * 100.0 + uTime * 5.0;
  float noise = fract(sin(dot(noiseUv, vec2(12.9898,78.233))) * 43758.5453);
  noise += fract(sin(dot(noiseUv * 1.3 + uTime * 2.0, vec2(93.9898,17.233))) * 23758.5453) * 0.5;
  float grain = smoothstep(0.6, 0.65, noise) * 0.1;

  float depth = (uv.y - 0.5) * 2.0;
  depth = max(depth, 0.1);
  
  float perspGlow = perspGrid * 3.5;

  // Color palette
  vec3 cyan = vec3(0.0, 1.0, 0.9);
  vec3 magenta = vec3(1.0, 0.1, 0.7);
  vec3 purple = vec3(0.7, 0.2, 1.0);
  vec3 orange = vec3(1.0, 0.5, 0.0);
  vec3 blue = vec3(0.1, 0.3, 1.0);

  vec3 gridColor = cyan * perspGlow * 1.2;
  
  vec3 thinCol1 = magenta * thin1 * 0.6;
  vec3 thinCol2 = purple * thin2 * 0.5;
  vec3 thinCol3 = orange * thin3 * 0.5;

  vec3 grainCol = grain * cyan * 0.8;
  
  vec3 color = gridColor + thinCol1 + thinCol2 + thinCol3;

  float ca = uChromatic;
  vec2 caShiftR = vec2(ca, 0.0); 
  vec2 caShiftG = vec2(ca+0.01, 0.0);
  vec2 caShiftB = vec2(ca+0.011, 0.0);

  float perspGridR = perspectiveGrid(uv + caShiftR, uTime);
  float perspGridG = perspectiveGrid(uv + caShiftG, uTime);
  float perspGridB = perspectiveGrid(uv + caShiftB, uTime);

  vec3 chroma = vec3(
    cyan.r * perspGridR + color.r,
    cyan.g * perspGridG + color.g,
    purple.b * perspGridB + color.b
  );

  vec2 pUv = pixelate(uv, uPixelSize);
  float perspGridP = perspectiveGrid(pUv, uTime);
  vec3 pixelColor = cyan * perspGridP;
  
  vec3 finalCol = mix(color, mix(chroma, pixelColor, 0.3), clamp(uPixelSize / 20.0, 0.0, 0.8));

  float atmosphere = smoothstep(1.0, 0.4, uv.y);
  atmosphere = max(atmosphere, 0.4);
  finalCol *= atmosphere;

  finalCol += grainCol;

  gl_FragColor = vec4(finalCol, 1.0);
}
`;

function ShaderPlane({ pixelSize = 8, distortion = 0.6, chromatic = 0.6 }) {
  const meshRef = useRef(null);
  const { size } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uPixelSize: { value: pixelSize },
      uDistortion: { value: distortion },
      uChromatic: { value: chromatic },
    }),
    [pixelSize, distortion, chromatic, size],
  );

  useFrame(({ clock, size }) => {
    if (!meshRef.current) return;
    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uResolution.value.set(size.width, size.height);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

export default function RetroWaveShader(props: {
  pixelSize?: number;
  distortion?: number;
  chromatic?: number;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "#000",
        position: "relative",
      }}
    >
      <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 1] }}>
        <ShaderPlane
          pixelSize={props.pixelSize ?? 10}
          distortion={props.distortion ?? 0.1}
          chromatic={props.chromatic ?? 0.01}
        />
      </Canvas>
    </div>
  );
}
