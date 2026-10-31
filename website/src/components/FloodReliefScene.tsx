import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import districts from '../data/districts.json';
import { reliefRings, toReliefPoint } from '../mapGeometry';
import type { RiskLevel } from '../types';

const LEVEL_HEIGHT: Record<RiskLevel, number> = { NORMAL: 1, WATCH: 2.2, WARNING: 3.4, DANGER: 4.8, UNKNOWN: 0.8 };
const LEVEL_COLOR: Record<RiskLevel, number> = { NORMAL: 0x1a5a50, WATCH: 0xe8b84a, WARNING: 0xff9a57, DANGER: 0xff5f5f, UNKNOWN: 0x2a4a46 };

function lineFromPlaces(places: Array<[number, number]>, color: number, opacity: number) {
  const points = places.map(([lat, lon]) => {
    const point = toReliefPoint(lon, lat);
    return new THREE.Vector3(point.x, 0.2, point.z);
  });
  const curve = new THREE.CatmullRomCurve3(points);
  return new THREE.Mesh(
    new THREE.TubeGeometry(curve, 72, 0.018, 5, false),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity }),
  );
}

export default function FloodReliefScene({ levels }: { levels: Record<string, RiskLevel> }) {
  const host = useRef<HTMLDivElement>(null);
  const levelsRef = useRef(levels);
  levelsRef.current = levels;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowPower = (navigator.hardwareConcurrency || 8) <= 4;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch {
      setFailed(true);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
    camera.position.set(0, 8.4, 10.4);
    camera.lookAt(0, 0, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden', 'true');

    scene.add(new THREE.HemisphereLight(0x8cf4d8, 0x061515, 2.3));
    const key = new THREE.DirectionalLight(0xb8ffe7, 3.1);
    key.position.set(-4, 8, 6);
    scene.add(key);
    const fill = new THREE.PointLight(0x18bca1, 30, 15);
    fill.position.set(2, 2.5, -2);
    scene.add(fill);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 15),
      new THREE.MeshBasicMaterial({ color: 0x0c2222, transparent: true, opacity: 0.26 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.7;
    scene.add(floor);

    const relief = new THREE.Group();
    scene.add(relief);
    // Each district is its own extruded tile, raised and coloured by its flood level.
    const tiles: Array<{ key: string; mesh: THREE.Mesh; h: number; color: THREE.Color }> = [];
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x60edc6, transparent: true, opacity: 0.32 });
    for (const district of districts) {
      const shapes = reliefRings(district.key).map((ring) => {
        const shape = new THREE.Shape();
        ring.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
        shape.closePath();
        return shape;
      });
      if (!shapes.length) continue;
      const geometry = new THREE.ExtrudeGeometry(shapes, { depth: 0.12, bevelEnabled: false, curveSegments: 1 });
      geometry.rotateX(-Math.PI / 2);
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x123c37, roughness: 0.45, metalness: 0.22, emissive: 0x06211e, emissiveIntensity: 0.55 }));
      mesh.position.y = 0.05;
      mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 30), edgeMaterial));
      relief.add(mesh);
      tiles.push({ key: district.key, mesh, h: 1, color: new THREE.Color(0x123c37) });
    }

    // The paths are a visual river network, not a separate forecast source.
    relief.add(lineFromPlaces([[26.05, 89.85], [25.56, 89.68], [25.1, 89.7], [24.5, 89.75], [23.8, 89.75]], 0x48edce, 0.86));
    relief.add(lineFromPlaces([[24.6, 88.05], [24.1, 88.95], [23.8, 89.75], [23.4, 90.35], [22.9, 90.6]], 0x25bdc4, 0.72));
    relief.add(lineFromPlaces([[25.0, 91.4], [24.4, 91.0], [23.8, 90.9], [23.2, 90.6], [22.4, 90.8]], 0x2fa8b7, 0.68));

    const pulse = new THREE.Mesh(
      new THREE.TorusGeometry(0.15, 0.012, 5, 36),
      new THREE.MeshBasicMaterial({ color: 0xffd272, transparent: true, opacity: 0.68 }),
    );
    pulse.rotation.x = Math.PI / 2;
    relief.add(pulse);

    const onMove = (event: PointerEvent) => {
      const bounds = el.getBoundingClientRect();
      relief.userData.pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
      relief.userData.pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
    };
    const onLeave = () => {
      relief.userData.pointerX = 0;
      relief.userData.pointerY = 0;
    };
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      relief.userData.scroll = Math.max(-0.55, Math.min(0.55, (window.innerHeight * 0.55 - rect.top) / window.innerHeight));
    };
    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });

    let frame = 0;
    let last = 0;
    let visible = true;
    const render = (time: number) => {
      frame = 0;
      if (!visible) return;
      if (lowPower && time - last < 45) {
        frame = window.requestAnimationFrame(render);
        return;
      }
      last = time;
      const pointerX = prefersReduced ? 0 : Number(relief.userData.pointerX || 0);
      const pointerY = prefersReduced ? 0 : Number(relief.userData.pointerY || 0);
      const scroll = prefersReduced ? 0 : Number(relief.userData.scroll || 0);
      relief.rotation.z = (prefersReduced ? 0 : Math.sin(time * 0.00022) * 0.022) + pointerX * 0.12 + scroll * 0.15;
      relief.rotation.x = 0.025 + pointerY * 0.055;
      relief.position.y = prefersReduced ? 0 : Math.sin(time * 0.00055) * 0.045;
      let worst: { key: string; rank: number } | null = null;
      const order: RiskLevel[] = ['NORMAL', 'WATCH', 'WARNING', 'DANGER'];
      for (const tile of tiles) {
        const level = levelsRef.current[tile.key] ?? 'UNKNOWN';
        tile.h += (LEVEL_HEIGHT[level] - tile.h) * (prefersReduced ? 1 : 0.08);
        tile.mesh.scale.y = tile.h;
        tile.color.lerp(new THREE.Color(level === 'NORMAL' ? 0x123c37 : LEVEL_COLOR[level]), prefersReduced ? 1 : 0.08);
        const material = tile.mesh.material as THREE.MeshStandardMaterial;
        material.color.copy(tile.color);
        material.emissive.copy(tile.color).multiplyScalar(level === 'NORMAL' ? 0.35 : 0.5);
        const rank = order.indexOf(level);
        if (rank > 0 && (!worst || rank > worst.rank)) worst = { key: tile.key, rank };
      }
      const target = worst ? districts.find((item) => item.key === worst!.key) : null;
      pulse.visible = Boolean(target);
      if (target) {
        const p = toReliefPoint(target.lon, target.lat);
        pulse.position.set(p.x, 0.75, p.z);
      }
      pulse.scale.setScalar(prefersReduced ? 1 : 0.88 + (Math.sin(time * 0.003) + 1) * 0.2);
      renderer.render(scene, camera);
      if (!prefersReduced) frame = window.requestAnimationFrame(render);
    };
    const visibilityObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? false;
      if (!visible && frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      } else if (visible && !prefersReduced && !frame) {
        frame = window.requestAnimationFrame(render);
      }
    }, { threshold: 0 }) : null;
    visibilityObserver?.observe(el);
    frame = window.requestAnimationFrame(render);

    const resize = new ResizeObserver(() => {
      if (!el.clientWidth || !el.clientHeight) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
      if (prefersReduced) renderer.render(scene, camera);
    });
    resize.observe(el);

    return () => {
      window.cancelAnimationFrame(frame);
      visibilityObserver?.disconnect();
      resize.disconnect();
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      relief.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.LineLoop) {
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) material.forEach((item) => item.dispose());
          else material.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div className={`relief-canvas${failed ? ' relief-fallback' : ''}`} ref={host} aria-label="Three-dimensional relief of Bangladesh with river pathways and 64 district markers">
      {failed && <div className="scene-fallback" aria-hidden="true"><span>বাংলাদেশ</span><i /><b /><em /></div>}
      <div className="scene-orbit orbit-one" aria-hidden="true" />
      <div className="scene-orbit orbit-two" aria-hidden="true" />
    </div>
  );
}
