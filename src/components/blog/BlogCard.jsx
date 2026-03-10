import { Link } from "react-router-dom";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function getReadingTime(content = "") {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default function BlogCard({ post }) {
  const formattedDate = post.createdAt
    ? DATE_FORMATTER.format(new Date(post.createdAt))
    : "Recently";
  const imageSrc = post.image || post.coverImage || "";

  return (
    <Link to={`/blog/${post.slug}`} className="blog-card" aria-label={`Read ${post.title}`}>
      {imageSrc && (
        <img
          src={imageSrc}
          alt={post.title || "Blog image"}
          className="blog-image"
          loading="lazy"
        />
      )}

      <h2 className="blog-card__title">{post.title || "Untitled Post"}</h2>
      <p className="blog-card__description">{post.description}</p>
      <p className="blog-card__meta">
        <time dateTime={post.createdAt || ""}>{formattedDate}</time>
        <span>•</span>
        <span>{getReadingTime(post.content)} min read</span>
      </p>
      <span className="blog-card__cta">Read Article →</span>
    </Link>
  );
}
