import { useEffect, useRef, useState } from "react";
import Viewport from "./Viewport";

export default function StackedView({ url, orientation, scrollEnabled, variant="mobile"}) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(375);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {/* DESKTOP */}
      {renderScaledViewport({
        label: "Desktop",
        width: 1024,
        height: 700,
        containerWidth,
        url,
        orientation,
        scrollEnabled,
        variant
      })}

      {/* TABLET */}
      {renderScaledViewport({
        label: "Tablet",
        width: 768,
        height: 1024,
        containerWidth,
        url,
        orientation,
        scrollEnabled,
        variant
      })}

      {/* MOBILE */}
      {renderScaledViewport({
        label: "Mobile",
        width: 375,
        height: 844,
        containerWidth,
        url,
        orientation,
        scrollEnabled,
        variant
      })}
    </div>
  );
}

function renderScaledViewport({
  label,
  width,
  height,
  containerWidth,
  url,
  orientation,
  scrollEnabled,
  variant
}) {
  const baseScale = variant === "tablet" ? 0.85 : 0.7;
  const scale = Math.min(1, containerWidth / width);
  const scaledHeight = height * scale;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        height: scaledHeight,
      }}
    >
      <div
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        <Viewport
          label={label}
          width={width}
          height={height}
          url={url}
          scalable
          orientation={orientation}
          scrollEnabled={scrollEnabled}
        />
      </div>

      {/* height spacer (this is the magic) */}
      <div
        aria-hidden
        style={{
          height: scaledHeight - height,
        }}
      />
    </div>
  );
}
