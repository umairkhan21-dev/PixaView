import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./blog.css";
import { API } from "../utils/api";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function parseContentBlocks(content = "") {
  const blocks = [];
  const lines = content.split(/\r?\n/);
  let paragraphLines = [];
  let listItems = [];

  const flushParagraph = () => {
    const text = paragraphLines.join(" ").trim();
    if (text) {
      blocks.push({ type: "paragraph", text });
    }
    paragraphLines = [];
  };

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({ type: "list", items: listItems });
    }
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("•")) {
      flushParagraph();
      const item = line.replace(/^•\s*/, "").trim();
      if (item) listItems.push(item);
      continue;
    }

    flushList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadPost = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API}/api/blogs/${slug}`);
        if (!response.ok) throw new Error("Article not found");

        const data = await response.json();
        if (!cancelled) setPost(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load article");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (slug) {
      loadPost();
    } else {
      setError("Invalid article URL");
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const contentBlocks = useMemo(() => parseContentBlocks(post?.content || ""), [post?.content]);

  if (loading) {
    return <div className="blog-status">Loading article...</div>;
  }

  if (error || !post) {
    return (
      <div className="blog-status is-error">
        {error || "Unable to load article."}
        <div style={{ marginTop: 12 }}>
          <Link to="/blog" className="blog-back-link">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const publishDate = post.createdAt
    ? DATE_FORMATTER.format(new Date(post.createdAt))
    : "Recently";
  const heroImage = post.image || post.coverImage || "";

  return (
    <article className="blog-post">
      <Link to="/blog" className="blog-back-link">
        ← Back to Blog
      </Link>

      {heroImage && (
        <img
          src={heroImage}
          alt={post.title || "Blog cover image"}
          className="blog-post__hero-image"
          loading="eager"
        />
      )}

      <p className="blog-post__meta">
        <time dateTime={post.createdAt || ""}>{publishDate}</time>
      </p>
      <h1 className="blog-post__title">{post.title || "Untitled Post"}</h1>

      <div className="blog-post__content">
        {contentBlocks.map((block, index) =>
          block.type === "list" ? (
            <ul key={index} className="blog-post__list">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          ) : (
            <p key={index}>{block.text}</p>
          )
        )}
       </div>
    </article>
  );
}
