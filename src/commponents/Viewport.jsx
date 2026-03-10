import { useEffect, useRef, useState, } from "react";
import { MdKeyboardArrowUp, MdRefresh } from "react-icons/md";

export default function Viewport({
  viewportId,
  label,
  minHeight,
  url,
  width,
  height,
  scalable = false,
  orientation = "portrait",
  scrollEnabled = true,
}) {
  const HEADER_HEIGHT = 44;
  const resolvedWidth = typeof width === "number" ? width : 1280;
  const resolvedHeight = typeof height === "number" ? height : typeof minHeight === "number" ? minHeight : 700;

  const viewportWidth =
    orientation === "portrait" ? resolvedWidth : resolvedHeight;
  const viewportHeight =
    orientation === "portrait" ? resolvedHeight : resolvedWidth;

  const shellWidth = scalable ? viewportWidth : "100%";
  const shellHeight = scalable
    ? viewportHeight
    : typeof minHeight === "number"
      ? minHeight
      : viewportHeight;

  const scrollWrapperHeight = Math.max(shellHeight - HEADER_HEIGHT, 1);


  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hide = setTimeout(() => setVisible(false), 0);
    const show = setTimeout(() => setVisible(true), 30);
    return () => {
      clearTimeout(hide);
      clearTimeout(show);
    };
  }, [url, shellHeight]);

  const [displaySize, setDisplaySize] = useState({
    w: viewportWidth,
    h: viewportHeight,
  });
  const [sizeVisible, setSizeVisible] = useState(true);

  useEffect(() => {
    const hide = setTimeout(() => setSizeVisible(false), 0);
    const t = setTimeout(() => {
      setDisplaySize({ w: viewportWidth, h: viewportHeight });
      setSizeVisible(true);
    }, 150);
    return () => {
      clearTimeout(hide);
      clearTimeout(t);
    };
  }, [viewportWidth, viewportHeight]);

  const scrollWrapperRef = useRef(null);
  const iframeRef = useRef(null);

  const reloadIframe = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      iframe.contentWindow?.location.reload();
      return;
    } catch {
      // Cross-origin fallback: forcing src assignment triggers reload.
    }

    const currentSrc = iframe.getAttribute("src");
    if (currentSrc) iframe.setAttribute("src", currentSrc);
  };

  const scrollIframeToTop = () => {
    scrollWrapperRef.current?.scrollTo({ top: 0, behavior: "smooth" });

    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      iframe.contentWindow?.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    } catch {
      // Cross-origin fallback: reload starts page from top.
      const currentSrc = iframe.getAttribute("src");
      if (currentSrc) iframe.setAttribute("src", currentSrc);
    }
  };

  const blockIfScrollDisabled = (e) => {
    if (!scrollEnabled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const iconButtonStyle = {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "1px solid #94a3b8",
    background: "#eef2ff",
    color: "#0f172a",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  };
  
  return (

    <div
      style={{
        width: shellWidth,
        height: shellHeight,
        background: "#fff",
        borderRadius: "18px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.98)",
        transition:
          "opacity 300ms ease, transform 300ms ease, width 350ms cubic-bezier(0.4,0,0.2,1), height 350ms cubic-bezier(0.4,0,0.2,1)",
        willChange: "width, height, transform",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: HEADER_HEIGHT,
          display: "flex",
          padding: "10px 16px",
          fontSize: "13px",
          color: "#64748b",
          borderBottom: "1px solid #0d0d0eff",
          background: "#ffffffff",
          zIndex: 2,
          alignItems: 'center',
          justifyContent: "space-between"
        }}
      >
        <div style={{ fontSize: 13, color: "#64748b", whiteSpace: "nowrap" }}>
          {label}
          {width && height && (
            <span
              style={{
                marginLeft: 8,
                color: "#9ca3af",
                display: "inline-block",
                opacity: sizeVisible ? 1 : 0,
                transform: sizeVisible
                  ? "translateY(0)"
                  : "translateY(-4px)",
                transition: "opacity 180ms ease, transform 180ms ease",
              }}
            >
              {displaySize.w}×{displaySize.h}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            title="Scroll to top"
            onClick={scrollIframeToTop}
            style={iconButtonStyle}><MdKeyboardArrowUp size={22} color="#0f172a" /></button>
          <button title="Refresh"
            onClick={reloadIframe}
            style={iconButtonStyle}><MdRefresh size={20} color="#0f172a" /></button>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          width: "100%",
          height: scrollWrapperHeight,
          overflow: "hidden",
          background: "#fff",
        }}
      >
        {url ? (
          // <div style={{ height: scrollWrapperHeight, overflow: "hidden" }}>
          <div
            ref={scrollWrapperRef}
            onWheel={blockIfScrollDisabled}
            onTouchMove={blockIfScrollDisabled}
            style={{
              width: "100%",
              height: "100%",
              overflow: "hidden",
              position: "relative",
              overscrollBehavior: "auto",
            }}
          >
            <iframe
              ref={iframeRef}
              src={url}
              title={label}
              scrolling="auto"
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                border: "none",
                background: "#fff",
                pointerEvents: scrollEnabled ? "auto" : "none",
              }}
            />
            {!scrollEnabled && (
              <div
                aria-hidden="true"
                onWheel={blockIfScrollDisabled}
                onTouchMove={blockIfScrollDisabled}
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 3,
                  background: "transparent",
                  cursor: "not-allowed",
                }}
              />
            )}

          </div>

        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#d1d5db",
              fontSize: "14px",
            }}
          >
            No content
          </div>
        )}
      </div>
    </div >
  );
}
