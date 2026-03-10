import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const API = import.meta.env.VITE_API_URL;

function getWords(text = "") {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function AdminDashboard() {
  const [blogs, setBlogs] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalVisitors: 0,
    responsiveTests: 0,
    supporters: 0,
  });
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [errorBlogs, setErrorBlogs] = useState("");
  const [errorAnalytics, setErrorAnalytics] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadBlogs = async () => {
      setLoadingBlogs(true);
      setErrorBlogs("");
      try {
        const response = await fetch(`${API}/api/blogs?includeDrafts=1`);
        if (!response.ok) throw new Error("Failed to load dashboard data");

        const data = await response.json();
        if (!cancelled) {
          setBlogs(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setErrorBlogs(err.message || "Unable to load dashboard");
        }
      } finally {
        if (!cancelled) setLoadingBlogs(false);
      }
    };

    const loadAnalytics = async () => {
      setLoadingAnalytics(true);
      setErrorAnalytics("");
      try {
        const response = await fetch(`${API}/api/analytics`);
        if (!response.ok) throw new Error("Failed to load analytics");

        const data = await response.json();
        if (!cancelled) {
          setAnalytics({
            totalVisitors: Number(data?.totalVisitors || 0),
            responsiveTests: Number(data?.responsiveTests || 0),
            supporters: Number(data?.supporters || 0),
          });
        }
      } catch (err) {
        if (!cancelled) {
          setErrorAnalytics(err.message || "Unable to load analytics");
        }
      } finally {
        if (!cancelled) setLoadingAnalytics(false);
      }
    };

    loadBlogs();
    loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, []);

  const recentPosts = useMemo(() => blogs.slice(0, 5), [blogs]);

  return (
    <section className="dashboard">
      <div className="dashboard__stats">
        <article className="dashboard-card">
          <p className="dashboard-card__label">Total Visitors</p>
          <p className="dashboard-card__value">
            {loadingAnalytics ? "--" : analytics.totalVisitors}
          </p>
        </article>

        <article className="dashboard-card">
          <p className="dashboard-card__label">Responsive Tests</p>
          <p className="dashboard-card__value">
            {loadingAnalytics ? "--" : analytics.responsiveTests}
          </p>
        </article>

        <article className="dashboard-card">
          <p className="dashboard-card__label">Supporters</p>
          <p className="dashboard-card__value">
            {loadingAnalytics ? "--" : analytics.supporters}
          </p>
        </article>
      </div>

      <div className="dashboard-grid">
        <article className="dashboard-panel">
          <h2 className="dashboard-panel__title">Quick Actions</h2>
          <p className="dashboard-panel__text">
            Manage content and verify what visitors see on the public blog.
          </p>

          <div className="dashboard-panel__actions">
            <Link to="/admin/blog" className="dashboard-action is-primary">
              Manage Posts
            </Link>
            <Link to="/blog" className="dashboard-action">
              View Public Blog
            </Link>
            <Link to="/admin/blog#create-new-post" className="dashboard-action">
              Create New Post
            </Link>
          </div>
        </article>

        <article className="dashboard-panel">
          <h2 className="dashboard-panel__title">Recent Posts</h2>

          {loadingBlogs && <p className="dashboard-loading">Loading latest posts...</p>}
          {!loadingBlogs && errorBlogs && <p className="dashboard-error">{errorBlogs}</p>}
          {!loadingBlogs && !errorBlogs && recentPosts.length === 0 && (
            <p className="dashboard-empty">No posts available yet.</p>
          )}

          {!loadingBlogs && !errorBlogs && recentPosts.length > 0 && (
            <ul className="dashboard-list">
              {recentPosts.map((post) => (
                <li key={post._id} className="dashboard-list__item">
                  <p className="dashboard-list__title">{post.title || "Untitled post"}</p>
                  <p className="dashboard-list__meta">
                    {post.createdAt
                      ? DATE_FORMATTER.format(new Date(post.createdAt))
                      : "Recently"}{" "}
                    • {Math.max(1, Math.round(getWords(post.content) / 200))} min read
                  </p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>

      {!loadingAnalytics && errorAnalytics && (
        <p className="dashboard-error">{errorAnalytics}</p>
      )}
    </section>
  );
}
