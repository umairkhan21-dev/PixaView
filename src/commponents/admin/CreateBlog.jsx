import { useRef, useState } from "react";
import { API } from "../../utils/api";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
export default function CreateBlog({ onCreated, sectionId = "" }) {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [imageName, setImageName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittingMode, setSubmittingMode] = useState("publish");
  const [status, setStatus] = useState({ type: "", message: "" });
  const fileInputRef = useRef(null);
  const slugPreview = slugify(title);
  const wordsCount = content.trim().split(/\s+/).filter(Boolean).length;
  const titleChars = title.trim().length;

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Unable to read image file"));
      reader.readAsDataURL(file);
    });

  const handleImageFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus({ type: "error", message: "Please select an image file." });
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setStatus({ type: "error", message: "Image is too large. Max size is 4MB." });
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setImage(dataUrl);
      setImageName(file.name);
      setStatus({ type: "", message: "" });
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Unable to load image." });
    }
  };

  const submitBlog = async (e, publishNow = true) => {
    if (e) e.preventDefault();
    const slug = slugPreview;
    setStatus({ type: "", message: "" });

    if (!slug) {
      setStatus({ type: "error", message: "Please enter a valid title." });
      return;
    }

    setSubmitting(true);
    setSubmittingMode(publishNow ? "publish" : "draft");
    try {
      const response = await fetch(`${API}/api/blogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, image: image.trim(), content, published: publishNow }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to create blog");
      }

      setTitle("");
      setImage("");
      setImageName("");
      setContent("");
      onCreated?.();
      setStatus({
        type: "success",
        message: publishNow
          ? "Post published successfully."
          : "Draft saved successfully.",
      });
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Unable to create blog" });
    } finally {
      setSubmitting(false);
      setSubmittingMode("publish");
    }
  };

  return (
    <section className="admin-card admin-create" id={sectionId}>
      <header className="admin-card__header">
        <div>
          <h2 className="admin-card__title">Create New Post</h2>
          <p className="admin-card__subtitle">
            Write once, save as draft, or publish when ready.
          </p>
        </div>
      </header>

      {status.message && (
        <p className={`admin-notice ${status.type === "error" ? "is-error" : "is-success"}`}>
          {status.message}
        </p>
      )}

      <form className="admin-form" onSubmit={submitBlog}>
        <label className="admin-form__label" htmlFor="blog-title">Title</label>
        <input
          id="blog-title"
          className="admin-form__input"
          placeholder="Example: Introducing the MultiView Responsive Tester"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoComplete="off"
          autoFocus
          maxLength={120}
          disabled={submitting}
          required
        />
        <p className="admin-form__helper">
          Clear, specific titles perform best. {titleChars}/120
        </p>

        <p className="admin-form__slug">
          Slug: <span>{slugPreview || "your-post-slug"}</span>
        </p>

        <label className="admin-form__label">Post Image</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="admin-image-input"
          onChange={(event) => handleImageFile(event.target.files?.[0])}
          disabled={submitting}
        />
        <div
          className={`admin-image-dropzone${dragActive ? " is-active" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            if (!submitting) setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragActive(false);
            if (submitting) return;
            const dropped = event.dataTransfer?.files?.[0];
            if (dropped) handleImageFile(dropped);
          }}
        >
          <p className="admin-image-dropzone__text">
            Drag & drop an image here, or
          </p>
          <button
            className="admin-image-dropzone__button"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={submitting}
          >
            Add Image
          </button>
          {/* <p className="admin-image-dropzone__hint">PNG, JPG, WEBP up to 4MB</p> */}
        </div>

        {image && (
          <div className="admin-image-preview">
            <img src={image} alt="Selected preview" className="admin-image-preview__img" />
            <div className="admin-image-preview__meta">
              <p className="admin-image-preview__name">{imageName || "Selected image"}</p>
              <button
                type="button"
                className="admin-post__action is-danger"
                onClick={() => {
                  setImage("");
                  setImageName("");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                disabled={submitting}
              >
                Remove Image
              </button>
            </div>
          </div>
        )}

        <label className="admin-form__label" htmlFor="blog-content">Content</label>
        <textarea
          id="blog-content"
          className="admin-form__textarea"
          placeholder="Write your post content..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={9}
          disabled={submitting}
          required
        />

        <div className="admin-form__footer">
          <span className="admin-form__meta">{wordsCount} words</span>
          <div className="admin-form__actions">
            <button
              className="admin-form__submit is-secondary"
              type="button"
              disabled={submitting}
              onClick={(event) => submitBlog(event, false)}
            >
              {submitting && submittingMode === "draft" ? "Saving..." : "Save Draft"}
            </button>
            <button className="admin-form__submit" type="submit" disabled={submitting}>
              {submitting && submittingMode === "publish" ? "Publishing..." : "Publish Post"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
