export default function BottomBar({ autosync, setAutoSync, isAutoSyncAvailable = true, handleShare, compactLayout = false }) {
    const barStyle = compactLayout
        ? {
            position: "relative",
            bottom: "auto",
            left: "auto",
            transform: "none",
            margin: 0,
            width: "100%",
            backgroundColor: "#f3f4f6",
            backgroundImage: `linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
            linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
            linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)`,
            backgroundSize: "24px 24px",
            backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0",
            borderRadius: 0,
            padding: "18px 0 14px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 0,
            boxShadow: "none",
            zIndex: 1,
        }
        : {
            position: "fixed",
            bottom: "116px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "fit-content",
            background: "transparent",
            borderRadius: 0,
            padding: 0,
            display: "flex",
            alignItems: "center",
            gap: 0,
            boxShadow: "none",
            zIndex: 1000,
        };

    return (
        <div style={barStyle}>
            
            <button type="button" className="pill-btn" onClick={handleShare}>Share</button>
        </div>
    )
}
