import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearAdminToken } from "../../utils/adminAuth";
import "./admin.css";

const titleByPath = {
  "/admin/dashboard": "Dashboard",
  "/admin/blog": "Blog Management",
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTitle = titleByPath[location.pathname] || "Admin";

  const today = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const handleLogout = () => {
    clearAdminToken();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="admin-shell">
      <div className="admin-shell__body">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            {/* <p className="admin-brand__eyebrow">Control Center</p> */}
            <h2 className="admin-brand__title">Admin Panel</h2>
          </div>

          <nav className="admin-nav">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `admin-nav__link${isActive ? " is-active" : ""}`
              }
            >
              <span className="admin-nav__dot" />
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/blog"
              className={({ isActive }) =>
                `admin-nav__link${isActive ? " is-active" : ""}`
              }
            >
              <span className="admin-nav__dot" />
              Blog
            </NavLink>
          </nav>
          <button className="admin-logout" type="button" onClick={handleLogout}>
            Logout
          </button>
        </aside>

        <main className="admin-main">
          <header className="admin-header">
            {/* <p className="admin-header__eyebrow">Administration</p> */}
            <div className="admin-header__row">
              <h1 className="admin-header__title">{activeTitle}</h1>
              <span className="admin-header__meta">{today}</span>
            </div>
          </header>

          <div className="admin-main__content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
