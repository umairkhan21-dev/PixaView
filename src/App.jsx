import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Toolbar from "./commponents/Toolbar";
import MultiView from "./commponents/MultiView";
import BottomBar from "./commponents/BottomBar";
import { DEVICE_PRESETS } from "./commponents/device";
import Footer from "./commponents/Footer";
import { useEffect, useState } from "react";
import AdminLayout from "./commponents/admin/AdminLayout";
import AdminDashboard from "./commponents/admin/AdminDashboard";
import AdminBlogPage from "./commponents/admin/AdminBlogPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import AdminLoginPage from "./pages/admin/Login";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import useBreakpoint from "./hooks/useBreakpoint";
import { API } from "./utils/api";


const VALID_VIEW_MODES = new Set(["ALL", ...Object.keys(DEVICE_PRESETS), "CUSTOM"]);

function normalizeUrl(rawUrl) {
  if (!rawUrl) return "";

  return rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
    ? rawUrl
    : `https://${rawUrl}`;
}

function getActivePreset(viewMode, devicePreset) {
  if (!devicePreset || typeof devicePreset !== "object" || Array.isArray(devicePreset)) {
    return null;
  }

  if ("width" in devicePreset && "height" in devicePreset) {
    return devicePreset;
  }

  return devicePreset[viewMode] ?? null;
}

function buildTesterSearchParams({ url, viewMode, orientation, scrollEnabled, devicePreset }) {
  const params = new URLSearchParams();
  const hasNonDefaultViewState =
    viewMode !== "ALL" || orientation !== "portrait" || !scrollEnabled;

  if (url) params.set("url", url);
  if (url || hasNonDefaultViewState) {
    params.set("mode", viewMode);
    params.set("orientation", orientation);
    params.set("scroll", scrollEnabled ? "1" : "0");
  }

  const activePreset = getActivePreset(viewMode, devicePreset);
  if (viewMode !== "ALL" && activePreset?.width && activePreset?.height) {
    params.set("w", String(activePreset.width));
    params.set("h", String(activePreset.height));
  }

  return params;
}

function TesterPage() {
  const isCompactLayout = useBreakpoint(1024);
  const [inputUrl, setInputUrl] = useState("");
  const [url, setUrl] = useState("");
  const [viewMode, setViewMode] = useState("ALL");
  const [autoSync, setAutoSync] = useState(false);
  const [devicePreset, setDevicePreset] = useState({
    DESKTOP: null,
    TABLET: null,
    MOBILE: null,
    TELEVISION: null,
    CUSTOM: null,
  });
  const [orientation, setOrientation] = useState("portrait");
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  const handleTest = (rawUrl) => {
    if (!rawUrl){
      setInputUrl("");
      setUrl("");
      return;
    }
    const formatted = normalizeUrl(rawUrl);
    setInputUrl(formatted);
    setUrl(formatted);
  };

  const handleShare = async () => {
    const params = buildTesterSearchParams({
      url,
      viewMode,
      orientation,
      scrollEnabled,
      devicePreset,
    });
    const search = params.toString();
    const shareUrl = `${window.location.origin}${window.location.pathname}${search ? `?${search}` : ""}`;

    if (navigator.share) {
      await navigator.share({ url: shareUrl, title: "Responsive Test Report" });
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    window.alert("Share link copied");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextMode = params.get("mode");
    const restoredMode = nextMode && VALID_VIEW_MODES.has(nextMode) ? nextMode : "ALL";

    const urlParam = params.get("url");
    if (urlParam) {
      const formattedUrl = normalizeUrl(urlParam);
      setInputUrl(formattedUrl);
      setUrl(formattedUrl);
    }

    if (nextMode && VALID_VIEW_MODES.has(nextMode)) {
      setViewMode(nextMode);
    }

    const nextOrientation = params.get("orientation");
    if (nextOrientation === "portrait" || nextOrientation === "landscape") {
      setOrientation(nextOrientation);
    }

    const nextScroll = params.get("scroll");
    if (nextScroll !== null) {
      setScrollEnabled(nextScroll === "1" || nextScroll === "true");
    }

    const w = Number(params.get("w") ?? params.get("width"));
    const h = Number(params.get("h") ?? params.get("height"));
    if (
      restoredMode !== "ALL" &&
      Number.isFinite(w) &&
      w > 0 &&
      Number.isFinite(h) &&
      h > 0
    ) {
      setDevicePreset((prev) => ({
        ...(prev && typeof prev === "object" && !Array.isArray(prev) && !("width" in prev) ? prev : {}),
        [restoredMode]: {
          id: `${restoredMode.toLowerCase()}-shared-size`,
          label: "Shared size",
          width: w,
          height: h,
        },
      }));
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const params = buildTesterSearchParams({
      url,
      viewMode,
      orientation,
      scrollEnabled,
      devicePreset,
    });
    const search = params.toString();
    const nextUrl = search ? `${window.location.pathname}?${search}` : window.location.pathname;
    window.history.replaceState(null, "", nextUrl);
  }, [devicePreset, isHydrated, orientation, scrollEnabled, url, viewMode]);

  return (
    <div
      className={`app-container tester-app ${isCompactLayout ? "tester-app--compact" : ""}`}
    >
      <Toolbar onTest={handleTest} viewMode={viewMode} setViewMode={setViewMode} 
      devicePreset={devicePreset} setDevicePreset={setDevicePreset} DEVICE_PRESET={DEVICE_PRESETS} 
      orientation={orientation} setOrientation={setOrientation} scrollEnabled={scrollEnabled} setScrollEnabled={setScrollEnabled}
      inputUrl={inputUrl} setInputUrl={setInputUrl} />
      <main className="main-content">
        <MultiView url={url} viewMode={viewMode} devicePreset={devicePreset} orientation={orientation} scrollEnabled={scrollEnabled}
        autoSync={autoSync}
        compactLayout={isCompactLayout}
        />
      </main>
      <BottomBar autosync={autoSync} setAutoSync={setAutoSync} isAutoSyncAvailable={viewMode === "ALL"} handleShare={handleShare} compactLayout={isCompactLayout} />
      <Footer className="tester-footer" />
    </div>
  );
}

function PageShell({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#111827",
        color: "#e5e7eb",
      }}
    >
      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 960,
          margin: "0 auto",
          padding: "24px 16px",
          boxSizing: "border-box",
        }}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const sessionKey = "analytics-visit-tracked-v2";
    if (sessionStorage.getItem(sessionKey) === "1") return;

    let cancelled = false;

    const trackVisit = async () => {
      try {
        const response = await fetch(`${API}/api/analytics/visit`, {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to track visit");
        }

        if (!cancelled) {
          sessionStorage.setItem(sessionKey, "1");
        }
      } catch {
        // Leave the session unmarked so a later visit in the same session can retry.
      }
    };

    trackVisit();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TesterPage />} />
        <Route
          path="/blog"
          element={
            <PageShell>
              <BlogPage />
            </PageShell>
          }
        />
        <Route
          path="/blog/:slug"
          element={
            <PageShell>
              <BlogPostPage />
            </PageShell>
          }
        />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="blog" element={<AdminBlogPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
