import { useEffect, useRef, useState } from "react";
import Viewport from "./Viewport";
import StackedView from "./stackedview";
import useBreakpoint from "../hooks/useBreakpoint";


const DEVICES = [
  { key: "MOBILE", label: "Mobile", width: 375, height: 700 },
  { key: "TABLET", label: "Tablet", width: 768, height: 700 },
  { key: "DESKTOP", label: "Desktop", width: 1280, height: 700 }
]



export default function MultiView({ viewMode, url, devicePreset, orientation, scrollEnabled, autoSync, compactLayout = false }) {
  const isMobileScreen = useBreakpoint(768);
  const isTabletScreen = useBreakpoint(1024);
  const [scrollRatio, setScrollRatio] = useState(0)
  const isSyncingRef = useRef(false)
  const [syncScrollRange, setSyncScrollRange] = useState(1200);
  const [activeViewportId, setActiveViewportId] = useState("mobile");
  const syncEnabled = autoSync && viewMode === "ALL";
  const SCALE = 0.5;
  const mobileRef = useRef(null);
  const tabletRef = useRef(null);
  const desktopRef = useRef(null);
  const singleTabScrollRef = useRef(null);
  const fallback = DEVICES[viewMode];
  const activePreset =
    devicePreset &&
      typeof devicePreset === "object" &&
      !Array.isArray(devicePreset) &&
      !("width" in devicePreset)
      ? devicePreset[viewMode]
      : devicePreset;
  const singleResolvedWidth = activePreset?.width || fallback?.width || 1280;
  const singleResolvedHeight = activePreset?.height || fallback?.height || 700;
  const singleViewportWidth = orientation === "portrait" ? singleResolvedWidth : singleResolvedHeight


  useEffect(() => {
    const t = setTimeout(() => {
      setScrollRatio(0);
      setSyncScrollRange(1200);
      setActiveViewportId("mobile");
    }, 0);
    return () => clearTimeout(t);
  }, [url]);

  const extendSyncScrollRange = (requestedBy = 160) => {
    const step = Math.max(120, Math.floor(requestedBy));
    setSyncScrollRange(prev => Math.min(prev + step, 3600));
  };

  const hasUrl = Boolean(url);
  return (
    <div
      style={{
        flex: 1,
        width: "100%",
        // width:"230%",
        // height: "100%",
        // overflowX:"transparent"
        // overflowX:"scroll",
        // overflowX: viewMode === "ALL" ? "hidden" : "auto",
        // overflowY:"visible"
        background: "#fafbfeff",
        padding: compactLayout ? "16px" : "24px",
        boxSizing: "border-box",
        overflowX: "hidden",
        overflowY: compactLayout ? "visible" : "auto",
        minHeight: 0,
        backgroundColor: "#f8fafc",
        backgroundImage: `linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
        linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
        linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)`,
        backgroundSize: "32px 32px",
        backgroundPosition: `0 0, 0 16px, 16px -16px, -16px 0px`,
        // paddingBottom:"120vh"
      }}>
      {/* <div style={{
          // minWidth:"max-content",
          display:"flex",
          justifyContent:"center",
          padding:"24px",
          borderSizing:"border-box"
        }}> */}
      {!hasUrl && (
        <div style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b7280",
          fontSize: "16px",
          userSelect: "none",
          // minHeight:"150vh"
        }}>
          Enter a website URL above to preview responsiveness
        </div>
      )}


      {/*all view*/}
      {hasUrl && viewMode === "ALL" && (
        (isMobileScreen || isTabletScreen) ? (
          <div
            style={{
              width: "100%",
              overflowX: "hidden",
              overflowY: "hidden",
              WebkitOverflowScrolling: "touch",
              boxSizing: "border-box",
            }}
          >
            <StackedView
              url={url}
              orientation={orientation}
              scrollEnabled={scrollEnabled}
              variant={isTabletScreen ? "tablet" : "mobile"} />
          </div>
        ) : (
          <div
            style={{
              // display: "flex",
              // gap: "32px",
              // overflowX: "auto",
              // overflowY: "hidden",
              // paddingBottom: "24px",
              // alignItems: "flex-start",
              // maxWidth: "1400px",
              // margin: "0 auto",
              width: "100%",
              overflow: "hidden",
              display: "flex",
              // justifyContent: "center",
              alignItems: "flex-start",
              padding: "0"
            }}
          >
            {/* {DEVICES.map((device) => (
            <div key={device.key}
              style={{
                flex: "0 0 auto",
              }}>
              <Viewport label={device.label}
                width={device.width}
                minHeight={device.height}
                url={url}
                scalable
                orientation={orientation}
                scrollEnabled={scrollEnabled} />
            </div>
          ))} */}
            <div
              style={{
                width: "100%",
                overflowX: "hidden",
                overflowY: "hidden",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div style={{
                display: "inline-flex",
                gap: "40px",
                transform: `scale(${SCALE})`,
                transformOrigin: "top center",
                willChange: "transform"
              }}>
                <>
                  <div style={{ width: orientation === "portrait" ? 375 : 844 }}>
                    <Viewport
                      ref={mobileRef}
                      label="iPhone 12 Pro"
                      id="mobile"
                      viewportId="mobile"
                      width={375}
                      height={844}
                      url={url}
                      scalable
                      orientation={orientation}
                      scrollEnabled={scrollEnabled}
                      autoSync={syncEnabled}
                      scrollRatio={scrollRatio}
                      setScrollRatio={setScrollRatio}
                      isSyncingRef={isSyncingRef}
                      syncScrollRange={syncScrollRange}
                      onNeedMoreScrollRange={extendSyncScrollRange}
                      activeViewportId={activeViewportId}
                      setActiveViewportId={setActiveViewportId} />
                  </div>
                </>
                <>
                  <div style={{ width: orientation === "portrait" ? 768 : 1024 }}>
                    <Viewport
                      ref={tabletRef}
                      label="iPad"
                      id="Tablet"
                      viewportId="tablet"
                      width={768}
                      height={1024}
                      url={url}
                      scalable
                      orientation={orientation}
                      scrollEnabled={scrollEnabled}
                      autoSync={syncEnabled}
                      scrollRatio={scrollRatio}
                      setScrollRatio={setScrollRatio}
                      isSyncingRef={isSyncingRef}
                      syncScrollRange={syncScrollRange}
                      onNeedMoreScrollRange={extendSyncScrollRange}
                      activeViewportId={activeViewportId}
                      setActiveViewportId={setActiveViewportId} />
                  </div>
                </>
                <>
                  <div style={{ width: orientation === "portrait" ? 1440 : 900 }}>
                    <Viewport
                      ref={desktopRef}
                      label="MacBook Pro"
                      id="Desktop"
                      viewportId="desktop"
                      width={1440}
                      height={900}
                      url={url}
                      scalable
                      orientation={orientation}
                      scrollEnabled={scrollEnabled}
                      autoSync={syncEnabled}
                      scrollRatio={scrollRatio}
                      setScrollRatio={setScrollRatio}
                      isSyncingRef={isSyncingRef}
                      syncScrollRange={syncScrollRange}
                      onNeedMoreScrollRange={extendSyncScrollRange}
                      activeViewportId={activeViewportId}
                      setActiveViewportId={setActiveViewportId} />
                  </div>
                </>
              </div>
            </div>
          </div>
        )
      )}
      {hasUrl && viewMode !== "ALL" && (
        <div
          ref={singleTabScrollRef}
          style={{
            width: "100%",
            minHeight: "100%",
            overflowX: "auto",
            overflowY: "visible",
            WebkitOverflowScrolling: "touch",
            scrollbarGutter: "stable",
          }}
        >
          <div
            style={{
              minWidth: `max(100%, ${singleViewportWidth + 80}px)`,
              display: "flex",
              justifyContent: "center",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: `${singleViewportWidth}px`,
                padding: "40px",
                boxSizing: "border-box",
              }}
            >
              <Viewport
                label={activePreset?.label || viewMode}
                width={singleResolvedWidth}
                minHeight={singleResolvedHeight}
                url={url}
                scalable
                orientation={orientation}
                scrollEnabled={scrollEnabled}
              />
            </div>
          </div>
        </div>
      )}
    </div>

  );
}
