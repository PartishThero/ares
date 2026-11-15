import React, { useEffect, useRef } from 'react';
import { formatMarsCoords } from '../utils/coordinates';
import { estimateGaleElevation } from '../utils/calculations';

const FONT = '500 10px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
const HIDDEN_CLASS = 'crosshair-cursor-hidden';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function Crosshair({
  containerRef,
  mapRef,
  color = '#ff7a30',
  thickness = 1,
  opacity = 0.85,
  gap = 12,
  fade = 0.25,
  showCoordinates = true,
  clickPulse = true,
  hideCursor = true,
  active = true
}) {
  const canvasRef = useRef(null);
  const wakeRef = useRef(null);

  useEffect(() => {
    wakeRef.current?.();
  });

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const host = containerRef?.current ?? null;
    const scope = host ?? window;
    const cursorOwner = host ?? document.documentElement;

    const state = {
      x: 0,
      y: 0,
      tx: 0,
      ty: 0,
      inside: false,
      seen: false,
      presence: 0,
      pulses: []
    };

    const size = { w: 0, h: 0, dpr: 1 };
    let raf = 0;
    let last = 0;
    let alive = true;

    const applyResize = () => {
      const rect = canvas.getBoundingClientRect();
      size.dpr = Math.min(window.devicePixelRatio || 1, 2);
      size.w = rect.width;
      size.h = rect.height;
      canvas.width = Math.max(1, Math.round(rect.width * size.dpr));
      canvas.height = Math.max(1, Math.round(rect.height * size.dpr));
    };

    const resize = () => {
      applyResize();
      wake();
    };

    const crisp = (value, width) => {
      const device = Math.round(width * size.dpr);
      return (Math.round(value * size.dpr) + (device % 2 ? 0.5 : 0)) / size.dpr;
    };

    // Draw coordinate tag on axes
    const drawAxisTag = (text, x, y, align) => {
      ctx.font = FONT;
      const metrics = ctx.measureText(text);
      const width = metrics.width + 10;
      const height = 16;
      let left = align === 'center' ? x - width / 2 : x;
      let top = align === 'middle' ? y - height / 2 : y;
      left = clamp(left, 4, size.w - width - 4);
      top = clamp(top, 4, size.h - height - 4);

      ctx.fillStyle = 'rgba(15, 17, 23, 0.92)';
      ctx.beginPath();
      ctx.roundRect(left, top, width, height, 4);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 122, 48, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(text, left + width / 2, top + height / 2 + 0.5);
    };

    // Draw reticle floating telemetry pill
    const drawReticleBadge = (coordText, elevText, x, y) => {
      ctx.font = '600 10px "JetBrains Mono", ui-monospace, monospace';
      const w1 = ctx.measureText(coordText).width;
      ctx.font = '500 9px "JetBrains Mono", ui-monospace, monospace';
      const w2 = elevText ? ctx.measureText(elevText).width : 0;
      const textW = Math.max(w1, w2);
      const width = textW + 16;
      const height = elevText ? 32 : 18;

      let left = x + 14;
      let top = y + 14;
      if (left + width > size.w - 12) left = x - width - 14;
      if (top + height > size.h - 12) top = y - height - 14;
      left = clamp(left, 8, size.w - width - 8);
      top = clamp(top, 8, size.h - height - 8);

      ctx.fillStyle = 'rgba(18, 20, 26, 0.92)';
      ctx.beginPath();
      ctx.roundRect(left, top, width, height, 6);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = '600 10px "JetBrains Mono", ui-monospace, monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.fillText(coordText, left + 8, top + 5);

      if (elevText) {
        ctx.font = '500 9px "JetBrains Mono", ui-monospace, monospace';
        ctx.fillStyle = '#ff7a30';
        ctx.fillText(elevText, left + 8, top + 18);
      }
    };

    const drawLineSegment = (x1, y1, x2, y2, horizontal) => {
      const length = horizontal ? x2 - x1 : y2 - y1;
      if (length <= 0) return;

      if (fade > 0) {
        const gradient = horizontal
          ? ctx.createLinearGradient(0, 0, size.w, 0)
          : ctx.createLinearGradient(0, 0, 0, size.h);
        const at = clamp(horizontal ? state.x / size.w : state.y / size.h, 0.001, 0.999);
        gradient.addColorStop(0, 'rgba(255, 122, 48, 0.08)');
        gradient.addColorStop(at, 'rgba(255, 122, 48, 0.65)');
        gradient.addColorStop(1, 'rgba(255, 122, 48, 0.08)');
        ctx.strokeStyle = gradient;
      } else {
        ctx.strokeStyle = 'rgba(255, 122, 48, 0.55)';
      }

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };

    const draw = () => {
      ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
      ctx.clearRect(0, 0, size.w, size.h);

      if (state.presence > 0.001) {
        ctx.globalAlpha = state.presence * opacity;
        ctx.lineWidth = thickness;
        ctx.lineCap = 'butt';

        const x = crisp(state.x, thickness);
        const y = crisp(state.y, thickness);

        // Crosshair Lines
        drawLineSegment(0, y, x - gap - 6, y, true);
        drawLineSegment(x + gap + 6, y, size.w, y, true);
        drawLineSegment(x, 0, x, y - gap - 6, false);
        drawLineSegment(x, y + gap + 6, x, size.h, false);

        // Center Reticle Aiming Ring & Dot
        ctx.strokeStyle = 'rgba(255, 122, 48, 0.9)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Corner tick brackets
        const bSize = 6;
        const bGap = 6;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Top-left
        ctx.moveTo(x - bGap - bSize, y - bGap); ctx.lineTo(x - bGap, y - bGap); ctx.lineTo(x - bGap, y - bGap - bSize);
        // Top-right
        ctx.moveTo(x + bGap + bSize, y - bGap); ctx.lineTo(x + bGap, y - bGap); ctx.lineTo(x + bGap, y - bGap - bSize);
        // Bottom-left
        ctx.moveTo(x - bGap - bSize, y + bGap); ctx.lineTo(x - bGap, y + bGap); ctx.lineTo(x - bGap, y + bGap + bSize);
        // Bottom-right
        ctx.moveTo(x + bGap + bSize, y + bGap); ctx.lineTo(x + bGap, y + bGap); ctx.lineTo(x + bGap, y + bGap + bSize);
        ctx.stroke();

        // Calculate Martian coordinates from map instance
        let marsCoords = null;
        let elev = null;
        if (mapRef?.current?.getCoordinateFromPixel) {
          const c = mapRef.current.getCoordinateFromPixel([state.x, state.y]);
          if (c && Array.isArray(c)) {
            marsCoords = c;
            elev = estimateGaleElevation(c[0], c[1]);
          }
        }

        if (showCoordinates && marsCoords) {
          const lon = marsCoords[0];
          const lat = marsCoords[1];

          // Axis tags
          const lonStr = `${Math.abs(lon).toFixed(3)}° ${lon >= 0 ? 'E' : 'W'}`;
          const latStr = `${Math.abs(lat).toFixed(3)}° ${lat >= 0 ? 'N' : 'S'}`;
          drawAxisTag(lonStr, x, 12, 'center');
          drawAxisTag(latStr, 12, y, 'middle');

          // Detailed reticle badge
          const coordFormatted = formatMarsCoords(lon, lat);
          const elevFormatted = elev !== null ? `${elev.toLocaleString()} m MOLA` : null;
          drawReticleBadge(coordFormatted, elevFormatted, x, y);
        }
      }

      // Draw click pulses
      state.pulses.forEach((pulse) => {
        const t = pulse.age / 0.55;
        ctx.strokeStyle = `rgba(255, 122, 48, ${(1 - t) ** 2 * opacity})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, t * 45, 0, Math.PI * 2);
        ctx.stroke();
      });
    };

    const tick = (now) => {
      if (!alive) return;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      // Eased responsive tracking
      const ease = 0.35;
      state.x += (state.tx - state.x) * ease;
      state.y += (state.ty - state.y) * ease;

      const wanted = state.inside ? 1 : 0;
      state.presence += (wanted - state.presence) * (1 - Math.exp(-dt / 0.12));

      state.pulses = state.pulses.filter((pulse) => (pulse.age += dt) < 0.55);

      draw();

      const settling =
        Math.abs(state.tx - state.x) > 0.05 ||
        Math.abs(state.ty - state.y) > 0.05 ||
        Math.abs(state.presence - wanted) > 0.005 ||
        state.pulses.length > 0;

      if (settling) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    const wake = () => {
      if (raf || !alive) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const setCursorHidden = (hidden) => {
      if (!hideCursor) return;
      cursorOwner.classList.toggle(HIDDEN_CLASS, hidden);
    };

    wakeRef.current = () => {
      setCursorHidden(state.inside && hideCursor);
      wake();
    };

    const relative = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      state.tx = clamp(clientX - rect.left, 0, rect.width);
      state.ty = clamp(clientY - rect.top, 0, rect.height);
    };

    const enter = () => {
      if (!state.seen) {
        state.seen = true;
        state.x = state.tx;
        state.y = state.ty;
      }
      state.inside = true;
      setCursorHidden(true);
    };

    const leave = () => {
      state.inside = false;
      setCursorHidden(false);
      wake();
    };

    const onMove = (event) => {
      if (event.pointerType === 'touch' && event.buttons === 0) return;
      relative(event.clientX, event.clientY);
      enter();
      wake();
    };

    const onDown = (event) => {
      relative(event.clientX, event.clientY);
      if (clickPulse) {
        state.pulses.push({ x: state.tx, y: state.ty, age: 0 });
      }
      wake();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    scope.addEventListener('pointermove', onMove);
    scope.addEventListener('pointerdown', onDown);
    if (host) {
      host.addEventListener('pointerleave', leave);
    } else {
      document.addEventListener('pointerout', leave);
    }

    applyResize();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      scope.removeEventListener('pointermove', onMove);
      scope.removeEventListener('pointerdown', onDown);
      if (host) {
        host.removeEventListener('pointerleave', leave);
      } else {
        document.removeEventListener('pointerout', leave);
      }
      setCursorHidden(false);
      wakeRef.current = null;
    };
  }, [containerRef, mapRef, active, color, thickness, opacity, gap, fade, showCoordinates, clickPulse, hideCursor]);

  if (!active) return null;

  return (
    <>
      <style>{`.${HIDDEN_CLASS}, .${HIDDEN_CLASS} * { cursor: none !important; }`}</style>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-10 select-none"
      />
    </>
  );
}
