"use client";

import PageWrapper from "@/components/page-wrapper";
import { motion } from "motion/react";
import { useCallback, useRef, useState } from "react";

export default function SliderPage() {
  const [value, setValue] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const dragAreaRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const tickMarks = Array.from({ length: window.innerWidth < 768 ? 51 : 101 }, (_, i) => i * (window.innerWidth < 768 ? 2 : 1));

  const setValueFromClientX = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const localX = clientX - rect.left;
    const ratio = rect.width === 0 ? 0 : localX / rect.width;
    const newValue = Math.max(0, Math.min(100, ratio * 100));
    setValue(newValue);
  }, []);

  const handleSliderClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setValueFromClientX(event.clientX);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const el = event.currentTarget;
    el.setPointerCapture(event.pointerId);
    setIsDragging(true);
    setValueFromClientX(event.clientX);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isDragging) return;
    setValueFromClientX(event.clientX);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch { }
  };
  const handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch { }
  };

  const handleTouchMove = (event: TouchEvent) => {
    event.preventDefault();
    if (!isDragging) return;
    const touch = event.touches[0];
    setValueFromClientX(touch.clientX);
  };

  const handleTouchStart = (event: TouchEvent) => {
    event.preventDefault();
    setIsDragging(true);
    const touch = event.touches[0];
    setValueFromClientX(touch.clientX);
  };

  const handleTouchEnd = (event: TouchEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  dragAreaRef.current?.addEventListener('touchstart', handleTouchStart, { passive: false });
  dragAreaRef.current?.addEventListener('touchmove', handleTouchMove, { passive: false });
  dragAreaRef.current?.addEventListener('touchend', handleTouchEnd, { passive: false });

  return (
    <PageWrapper title="Slider" backLink="/" workNumber="001">
      <div
        className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-8"
      >

        <div
          className="w-full relative max-w-6xl"
        >
          <div className="text-center mb-12">
            <motion.div
              className="text-8xl absolute font-medium select-none leading-0 tracking-wider text-[var(--foreground)]"
              style={{
                transform: `
                translateX(calc(${-value}% + -${(value / 100 * 66 + 2)}px))
                translateY(${(value / 100) * 13}px)
                scale(${(value / 100) * (2 - 1) + 1})
              `,
                transformOrigin: 'bottom',
                left: `${value}%`,
              }}
            >
              <span
                key={Math.round(value)}
                className="leading-none"
              >
                {Math.round(value)}
              </span>
            </motion.div>
          </div>

          <div
            className="relative cursor-pointer py-8"
            ref={sliderRef}
            onClick={handleSliderClick}
          >
            <div className="w-full relative">
              {tickMarks.map((tick) => {
                const distance = Math.abs(tick - value);
                const heightMultiplier = Math.max(0.3, 1 - distance / 20);

                let baseHeight = 100;
                if (tick % 10 === 0) baseHeight = 50;
                if (tick % 100 === 0) baseHeight = 150;

                const finalHeight = baseHeight * heightMultiplier + (distance < 5 ? distance < 2 ? 8 : 4 : 0) + Math.sin(distance / 10) * 10;

                const tickColor = distance < 3
                  ? "var(--slider-strong)"
                  : distance < 8
                    ? "var(--slider-mid)"
                    : "var(--slider-weak)";

                return (
                  <motion.div
                    key={tick}
                    className="absolute top-0 w-px origin-bottom"
                    style={{
                      left: `${tick}%`,
                      transform: `translateX(-50%) translateY(-${finalHeight}px)`
                    }}
                    animate={{
                      height: `${finalHeight}px`,
                      backgroundColor: tickColor
                    }}
                    transition={isDragging ? { type: "tween", duration: 0.06 } : { type: "tween", duration: 0.18 }}
                  >
                    {tick % 20 === 0 && (
                      <div className="absolute top-full mt-2 -translate-x-1/2 text-xs font-light whitespace-nowrap text-[var(--muted-foreground)] select-none">
                        {tick}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div
              ref={dragAreaRef}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              style={{ height: "80px", top: "-40px" }}
            />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}