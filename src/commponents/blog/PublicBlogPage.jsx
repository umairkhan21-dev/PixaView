import { useEffect, useMemo, useState } from "react";
import "./publicBlog.css";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function getReadingTime(content = "") {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function getExcerpt(content = "", maxLength = 180) {
  if (content.length <= maxLength) return content;
  return `${content.slice(0, maxLength).trim()}...`;
}
const API = import.meta.env.VITE_API_URL;

export default function PublicBlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedBlogIds, setExpandedBlogIds] = useState({});

  useEffect(() => {
    let cancelled = false;

    const loadBlogs = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API}/api/blogs`);
        if (!response.ok) {
          throw new Error("Failed to load blog posts");
        }

        const data = await response.json();
        if (!cancelled) {
          setBlogs(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load blog posts");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBlogs();

    return () => {
      cancelled = true;
    };
  }, []);

  const statsLabel = useMemo(() => {
    if (loading) return "Loading posts";
    if (error) return "Feed unavailable";
    if (blogs.length === 0) return "No posts yet";
    return `${blogs.length} post${blogs.length > 1 ? "s" : ""}`;
  }, [blogs.length, error, loading]);

  const toggleExpanded = (blogId) => {
    setExpandedBlogIds((prev) => ({
      ...prev,
      [blogId]: !prev[blogId],
    }));
  };

  return (
    <section className="public-blog">
      <header className="public-blog__hero">
        <p className="public-blog__eyebrow">Insight & Updates</p>
        <h1 className="public-blog__title">Our Blog</h1>
        <p className="public-blog__subtitle">
          Product updates, engineering notes, and practical guides from our
          team.
        </p>
        <span className="public-blog__stats">{statsLabel}</span>
      </header>

      {loading && (
        <div className="public-blog__grid">
          {Array.from({ length: 3 }).map((_, index) => (
            <article key={index} className="public-blog__card is-skeleton">
              <div className="skeleton skeleton-line short" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line long" />
            </article>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="public-blog__empty" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && blogs.length === 0 && (
        <div className="public-blog__empty">No published posts available.</div>
      )}

      {!loading && !error && blogs.length > 0 && (
        <div className="public-blog__grid">
          {blogs.map((blog) => {
            const isExpanded = Boolean(expandedBlogIds[blog._id]);
            const showExpand = blog.content.length > 180;

            return (
              <article key={blog._id} className="public-blog__card">
                <div className="public-blog__meta">
                  <time dateTime={blog.createdAt || ""}>
                    {blog.createdAt
                      ? DATE_FORMATTER.format(new Date(blog.createdAt))
                      : "Recently"}
                  </time>
                  <span>{getReadingTime(blog.content)} min read</span>
                </div>

                <h2 className="public-blog__card-title">
                  {blog.title || "Untitled Post"}
                </h2>

                <p className="public-blog__content">
                  {isExpanded ? blog.content : getExcerpt(blog.content)}
                </p>

                <div className="public-blog__card-footer">
                  <span className="public-blog__slug">/{blog.slug || "post"}</span>
                  {showExpand && (
                    <button
                      type="button"
                      className="public-blog__toggle"
                      onClick={() => toggleExpanded(blog._id)}
                    >
                      {isExpanded ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
