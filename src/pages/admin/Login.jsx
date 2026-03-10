import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminToken, setAdminToken } from "../../utils/adminAuth";
import "./login.css";


const API = import.meta.env.VITE_API_URL;
export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (getAdminToken()) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.token) {
        throw new Error(data?.error || "Invalid credentials");
      }

      setAdminToken(data.token);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={handleSubmit}>
        <p className="admin-login__eyebrow">Admin Access</p>
        <h1 className="admin-login__title">Login</h1>

        {error && <p className="admin-login__error">{error}</p>}

        <label className="admin-login__label" htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          className="admin-login__input"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <label className="admin-login__label" htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          className="admin-login__input"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        <button className="admin-login__button" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
