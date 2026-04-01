import "./toolbar.css"
import { useRef, useState } from "react";
import DeviceMenu from "./DeviceMenu";
import { SlScreenDesktop } from "react-icons/sl";
import { FaMobileAlt } from "react-icons/fa";
import { IoTabletPortraitSharp } from "react-icons/io5";
import { MdOutlineScreenRotation } from "react-icons/md";
import { CiGrid31 } from "react-icons/ci";
import { PiTelevisionDuotone } from "react-icons/pi";
import { RiCustomSize } from "react-icons/ri"
import { CgScrollV } from "react-icons/cg";
import { HiCheck, HiX, HiMenu } from "react-icons/hi";
import useBreakpoint from "../hooks/useBreakpoint";
import { getFaviconUrl } from "../utils/favicon"
import { API } from "../utils/api";



export default function Toolbar({
  onTest,
  viewMode,
  setViewMode,
  DEVICE_PRESET,
  devicePreset,
  setDevicePreset,
  orientation,
  setOrientation,
  setScrollEnabled,
  scrollEnabled,
  inputUrl,
  setInputUrl,
}) {
  const isMobile = useBreakpoint(1024);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [menuAnchorRect, setMenuAnchorRect] = useState(null);
  const toolbarRef = useRef(null);
  const deviceControlsRef = useRef(null);
  const ICON_SIZE = 22;
  const DEVICE_ICONS = {
    ALL: <CiGrid31 size={ICON_SIZE} />,
    DESKTOP: <SlScreenDesktop size={ICON_SIZE} />,
    TABLET: <IoTabletPortraitSharp size={ICON_SIZE} />,
    MOBILE: <FaMobileAlt size={ICON_SIZE} />,
    TELEVISION: <PiTelevisionDuotone size={ICON_SIZE} />,

  }
  const [showCustomSize, setShowCustomSize] = useState(false);
  const [w, setW] = useState(320);
  const [h, setH] = useState(533);
  const isRotateOn = orientation === "landscape";
  // const [devicePreset, setDevicePreset] = useState("");
  const applyCustomSize = () => {
    if (!w || !h) return;
    setDevicePreset((prev) => ({
      ...(prev && typeof prev === "object" && !("width" in prev) ? prev : {}),
      CUSTOM: {
        label: "custom",
        width: Number(w),
        height: Number(h),
      },
    }));
    setViewMode("CUSTOM");
  }
  const inputStyle = {
    width: 82,
    height: 40,
    fontSize: 16,
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #444",
    background: "#333",
    color: "#fff",
    outline: "none",
  };

  const goButtonStyle = {
    height: 40,
    padding: "0 14px",
    fontWeight: 600,
    background: "#00b4ff",
    color: "#000",
    border: "1px solid #00b4ff",
    borderRadius: 8,
    cursor: "pointer",
  };

  function saveUrlToHistory(url) {
    const key = "url-history";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");

    if (!existing.includes(url)) {
      const updated = [url, ...existing].slice(0, 10);
      localStorage.setItem(key, JSON.stringify(updated));
    }
  }
  function getUrlHistory() {
    return JSON.parse(localStorage.getItem("url-history") || "[]")
  }

  function removeUrlFromHistory(urlToRemove) {
    const key = "url-history";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const updated = existing.filter((item) => item !== urlToRemove);
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  }

  function updateSuggestions(query) {
    const history = getUrlHistory();
    const filtered = history.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }

  function formatHistoryItem(rawUrl) {
    try {
      const normalized =
        rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
          ? rawUrl
          : `https://${rawUrl}`;
      const parsed = new URL(normalized);
      return {
        title: parsed.hostname.replace(/^www\./, ""),
        subtitle: rawUrl,
      };
    } catch {
      return {
        title: rawUrl,
        subtitle: rawUrl,
      };
    }
  }

  const applyMode = (mode) => {
    setViewMode(mode);

    if (mode === "ALL") return;

    const presetMap =
      devicePreset && typeof devicePreset === "object" && !("width" in devicePreset)
        ? devicePreset
        : {};

    if (presetMap[mode]) return;

    const defaultPreset = DEVICE_PRESET[mode]?.[0] || null;
    if (!defaultPreset) return;

    setDevicePreset({
      ...presetMap,
      [mode]: defaultPreset,
    });
  };

  const runResponsiveTest = (nextUrl = inputUrl) => {
    const value = nextUrl.trim();
    if (!value) {
      setInputUrl("");
      onTest("");
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }
    const formatted = value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;
    setInputUrl(formatted);
    saveUrlToHistory(formatted);
    onTest(formatted);

    const params = new URLSearchParams();
    params.set("url", formatted);
    params.set("mode", viewMode);
    window.history.replaceState(null, "", "?" + params.toString());

    fetch(`${API}/api/analytics/test`, {
      method: "POST",
    }).catch(() => { });
  }

  return (

    <form
      ref={toolbarRef}
      className="toolbar-shell"
      onSubmit={(e) => {
        e.preventDefault();
        runResponsiveTest();
      }}
      style={{
        overflow: "visible",
        position: "relative"
      }}
    >
      <div className="toolbar-shell__row">
        <div className="toolbar-main">
          <div className="toolbar-brand" aria-label="PixaView">
            <img
              src="/PixaView-removebg-preview.png"
              alt="PixaView"
              className="toolbar-brand__logo"
            />
          </div>

          <div className="toolbar-search">
            <input
              className="toolbar-search__input"
              type="text"
              placeholder="Enter website URL (https://example.com)"
              value={inputUrl}
              onFocus={() => {
                updateSuggestions(inputUrl);
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 120);
              }}
              onChange={(e) => {
                const value = e.target.value;
                setInputUrl(value);
                updateSuggestions(value);
              }}
            />
            {showSuggestions && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: isMobile ? "50%" : 0,
                  width: isMobile ? "min(92vw, 420px)" : "100%",
                  maxWidth: "calc(100vw - 24px)",
                  transform: isMobile ? "translateX(-50%)" : "none",
                  background: "#f8fafc",
                  borderRadius: 12,
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 16px 34px rgba(0,0,0,0.26)",
                  zIndex: 3000,
                  overflow: "hidden",
                  maxHeight: 300,
                  overflowY: "auto",
                }}
              >
                {suggestions.map((item, i) => {
                  const formatted = formatHistoryItem(item);
                  return (
                    <div
                      key={`${item}-${i}`}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        borderBottom: i === suggestions.length - 1 ? "none" : "1px solid #e2e8f0",
                        background: i === 0 ? "#e2e8f0" : "#f8fafc",
                        padding: "8px 14px",
                        textAlign: "left",
                        display: "grid",
                        gridTemplateColumns: "minmax(0, 1fr) auto",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          runResponsiveTest(item);
                          setShowSuggestions(false);
                        }}
                        style={{
                          width: "100%",
                          border: "none",
                          background: "transparent",
                          padding: 0,
                          textAlign: "left",
                          cursor: "pointer",
                          display: "grid",
                          gridTemplateColumns: "20px minmax(0, 1fr)",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div style={{
                          width: 20,
                          height: 20,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}>
                          <img src={getFaviconUrl(item)}
                            alt=""
                            style={{
                              width: 16,
                              height: 16,
                              flexShrink: 0
                            }}
                            onError={(e) => {
                              e.currentTarget.src = "/icons/globe.svg";
                            }} />
                        </div>

                        <div style={{ minWidth: 0, display: "grid", gap: 2 }}>
                          <span
                            style={{
                              color: "#0f172a",
                              fontSize: isMobile ? 15 : 16,
                              lineHeight: 1.2,
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {formatted.title}
                          </span>
                          <span
                            style={{
                              color: "#2563eb",
                              fontSize: isMobile ? 12 : 13,
                              lineHeight: 1.2,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {formatted.subtitle}
                          </span>
                        </div>
                      </button>
                      <button
                        type="button"
                        aria-label={`Remove ${item} from history`}
                        onClick={() => {
                          const updatedHistory = removeUrlFromHistory(item);
                          const filtered = updatedHistory.filter((historyItem) =>
                            historyItem.toLowerCase().includes(inputUrl.toLowerCase())
                          );
                          setSuggestions(filtered);
                          setShowSuggestions(filtered.length > 0);
                        }}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 999,
                          border: "1px solid #fca5a5",
                          background: "#fee2e2",
                          color: "#b91c1c",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 16,
                          fontWeight: 700,
                          lineHeight: 1,
                          padding: 0,
                          flexShrink: 0,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="toolbar-shell__actions">
          <button
            type="submit"
            className="toolbar-primary-btn"
          >
            TEST
          </button>
          <a
            href="/pixaview-chrome-extension.zip"
            download
            className="toolbar-download-btn"
          >
            Download Extension
          </a>
          {isMobile && (
            <button
              type="button"
              className="toolbar-icon-btn toolbar-shell__menu-btn"
              onClick={() => setMenuOpen(v => !v)}
            >
              <HiMenu size={24} />
            </button>
          )}
        </div>
        {!isMobile && (
          <div ref={deviceControlsRef} className="toolbar-device-controls">
            {["ALL", "DESKTOP", "TABLET", "MOBILE", "TELEVISION"].map(mode => (
              <div key={mode} className="device-wrapper">
                <button
                  type="button"
                  onClick={(e) => {
                    applyMode(mode);
                    if (mode === "ALL") {
                      setOpenMenu(null);
                      setMenuAnchorRect(null);
                      return;
                    }

                    const shouldClose = openMenu === mode;
                    setOpenMenu(shouldClose ? null : mode);
                    setMenuAnchorRect(
                      shouldClose ? null : e.currentTarget.getBoundingClientRect()
                    );
                  }}
                  className={`device-btn ${viewMode === mode ? "active" : ""}`}
                  aria-label={mode}
                  style={{
                    width: "42px",
                    height: "42px",
                    padding: 0,
                    borderRadius: "10px",
                    background: viewMode === mode ? "#00b4ff" : "#333",
                    color: viewMode === mode ? "#000" : "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 500,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  {DEVICE_ICONS[mode]}
                  {/* <span>{mode}</span> */}
                </button>


                {/*tooltip*/}
                <div className="device-tooltip">{mode}</div>
              </div>
            ))}
            <div className="device-wrapper">
              <button
                type="button"
                className="toolbar-icon-btn"
                onClick={() => {
                  setOpenMenu(null);
                  setMenuAnchorRect(null);
                  setShowCustomSize((v) => !v);
                }}
                style={{ width:"44px", height:"44px", padding:0,background: "#333", color: "#fff", border: "none" }}
              >
                <span className="toolbar-icon-glyph">
                  <RiCustomSize />
                </span>
              </button>
              <div className="device-tooltip">CUSTOM WIDTH</div>
            </div>

            {/*rotate*/}
            <div className="device-wrapper">
              <button
                type="button"
                onClick={() => setOrientation((o) => (o === "portrait" ? "landscape" : "portrait"))}
                className={`toolbar-icon-btn ${orientation === "landscape" ? "active" : ""}`}
                style={{
                  width:"44px",
                  height:"44px",
                  padding:0,
                  background: orientation === "landscape" ? "#00b4ff" : "#333",
                  borderColor: orientation === "landscape" ? "#00b4ff" : "#444",
                  color: orientation === "landscape" ? "#000" : "#fff",
                }}
              >
                <span className="toolbar-icon-glyph">
                  <MdOutlineScreenRotation />
                </span>
              </button>
              <div className="device-tooltip">ROTATE</div>
            </div>

            <div className="device-wrapper tooltip-right">
              <button
                type="button"
                onClick={() => setScrollEnabled(v => !v)}
                className={`toolbar-icon-btn ${scrollEnabled ? "active" : ""}`}
                style={{ width:"44px", height:"44px", padding:"0",position: "relative" }}
              >
                <span className="toolbar-icon-glyph">
                  <CgScrollV />
                </span>
                <span style={{
                  position: "absolute",
                  bottom: "4px",
                  right: "4px",
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  background: scrollEnabled ? "#22c55e" : "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  color: "#000"
                }}>
                  {scrollEnabled ? <HiCheck /> : <HiX />}
                </span>
              </button>
              <div className="device-tooltip">SCROLL ENABLE/DISABLE</div>
            </div>

          </div>
        )}
      </div>
      {!isMobile && openMenu && (
        <div className="toolbar-dropdown">
          <DeviceMenu
            device={DEVICE_PRESET[openMenu]}
            anchorRect={menuAnchorRect}
            containerRect={toolbarRef.current?.getBoundingClientRect() || null}
            controlsRect={deviceControlsRef.current?.getBoundingClientRect() || null}
            onSelect={(device) => {
              setDevicePreset((prev) => ({
                ...(prev && typeof prev === "object" && !("width" in prev) ? prev : {}),
                [openMenu]: device,
              }));
              setOpenMenu(null);
              setMenuAnchorRect(null);
            }}
          />
        </div>
      )}
      {showCustomSize && (

        <div
          style={{
            position: "absolute",
            top: "60px",
            right: "120px",
            background: "#1e1e1e",
            color: "#fff",
            border: "1px solid #444",
            padding: "12px",
            borderRadius: "12px",
            boxShadow: "0 16px 30px rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            zIndex: 1000,
          }}>
          <input
            type="number"
            value={w}
            onChange={(e) => setW(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyCustomSize();
                setShowCustomSize(false);
              }
            }}
            style={inputStyle}
            suppressContentEditableWarning
            autoFocus
          />
          <span>×</span>
          <input
            type="number"
            value={h}
            onChange={(e) => setH(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyCustomSize();
                setShowCustomSize(false);
              }
            }}
            style={inputStyle}
          />
          <button
            type="button"
            onClick={() => {
              applyCustomSize();
              setShowCustomSize(false);
            }}
            style={goButtonStyle}
          >
            GO
          </button>
        </div>

      )}
      {isMobile && menuOpen && (
        <div
          style={{
            position: "absolute",
            top: "64px",
            right: "12px",
            width: 220,
            background: "#1e1e1e",
            borderRadius: 12,
            padding: 12,
            zIndex: 2000,
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {["ALL", "DESKTOP", "TABLET", "MOBILE"].map(mode => (
            <button
              type="button"
              key={mode}
              onClick={() => {
                applyMode(mode);
                setMenuOpen(false);
              }}
              style={{
                background: "#2a2a2a",
                color: "#fff",
                border: "none",
                padding: "10px",
                borderRadius: 8,
                textAlign: "left",
              }}
            >
              {mode}
            </button>
          ))}

          <hr style={{ borderColor: "#333" }} />

          <button type="button" onClick={() => setShowCustomSize(true)}>Custom Size</button>
          <button type="button" onClick={() => setOrientation(o => o === "portrait" ? "landscape" : "portrait")}>
            Rotate {isRotateOn ? "ON" : "OFF"}
          </button>
          <button type="button" onClick={() => setScrollEnabled(v => !v)}>
            Scroll {scrollEnabled ? "ON" : "OFF"}
          </button>
        </div>
      )}
    </form>

  );
}
