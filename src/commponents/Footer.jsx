import { Link } from "react-router-dom";

const DONATE_URL = "buymeacoffee.com/Umairthedev";
const API = import.meta.env.VITE_API_URL;

function toExternalHref(value) {
  const raw = String(value || "").trim();
  if (!raw) return "#";
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

export default function Footer({ className = "" }) {
    const donateHref = toExternalHref(DONATE_URL);

    const handleDonateClick = async (event) => {
        if (!donateHref || donateHref === "#") return;

        event.preventDefault();
        try {
            await fetch(`${API}/api/analytics/support`, {
                method: "POST",
            });
        } catch {
            // Keep redirect behavior even when analytics call fails.
        }
        window.location.assign(donateHref);
    };

    return (
        <footer
            className={className}
            style={{
                width: "100%",
                flexShrink: 0,
                margin: 0,
                padding: "20px 0",
                position: "relative",
                background: "#0f172a",
                color: "#cbd5f5",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                fontSize: "14px"
            }}>
            <div className="footer-nav" style={{
                display: "flex",
                gap: "20px",
                flexWrap: "wrap",
                justifyContent: "center"
            }}>
                <Link to="/blog" className="footer-link" style={linkStyle}>Blog</Link>
                <a
                  href={donateHref}
                  onClick={handleDonateClick}
                  className="footer-link"
                  style={linkStyle}
                >
                  Donate
                </a>
            </div>
            <div style={{opacity: 0.7}}>
                © {new Date().getFullYear()} PixaView. All rights reserved.
            </div>
        </footer>
    );
};
const linkStyle = {
  color: "#e0e7ff",
  textDecoration: "none",
  fontWeight: 500,
  transition: "all 0.2s ease",
};
