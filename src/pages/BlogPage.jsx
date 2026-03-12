import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import BlogCard from "../components/blog/BlogCard";
import "./blog.css";
import { API } from "../utils/api";

function getDescription(content = "", maxLength = 120) {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trim()}...`;
}
export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadPosts = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API}/api/blogs`);
        if (!response.ok) throw new Error("Failed to load posts");

        const data = await response.json();
        if (cancelled) return;

        const normalizedPosts = (Array.isArray(data) ? data : [])
          .filter((post) => Boolean(post?.slug))
          .map((post) => ({
            ...post,
            description: getDescription(post.content),
          }));

        setPosts(normalizedPosts);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load posts");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPosts();

    return () => {
      cancelled = true;
    };
  }, []);

  const statusText = useMemo(() => {
    if (loading) return "Loading posts...";
    if (error) return error;
    if (posts.length === 0) return "No posts available.";
    return null;
  }, [loading, error, posts.length]);

  return (
    <section className="blog-page">
      <div className="blog-nav">
        <Link to="/" className="blog-back-link">
          ← Back to Main Page
        </Link>
      </div>

      <header className="blog-hero">
        <p className="blog-hero__eyebrow">Latest Updates</p>
        <h1 className="blog-hero__title">Blog</h1>
        <p className="blog-hero__subtitle">
          Product updates, tutorials, and practical engineering notes.
        </p>
      </header>

      {statusText ? (
        <div className={`blog-status${error ? " is-error" : ""}`}>{statusText}</div>
      ) : (
        <div className="blog-list-grid">
          {posts.map((post) => (
            <BlogCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}
