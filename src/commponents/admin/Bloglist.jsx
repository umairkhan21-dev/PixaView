import { useCallback, useEffect, useRef, useState } from "react";
import { API } from "../../utils/api";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
});
function getWordsCount(content = "") {
    return content.trim().split(/\s+/).filter(Boolean).length;
}

function getExcerpt(content = "", maxLength = 170) {
    if (content.length <= maxLength) return content;
    return `${content.slice(0, maxLength).trim()}...`;
}

function slugify(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

export default function Bloglist({ admin = false, refreshKey = 0 }) {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingBlogId, setEditingBlogId] = useState("");
    const [editForm, setEditForm] = useState({ title: "", content: "", published: true, image: null });
    const [editImageName, setEditImageName] = useState("");
    const [savingEdit, setSavingEdit] = useState(false);
    const editFileInputRef = useRef(null);

    const readFileAsDataUrl = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = () => reject(new Error("Unable to read image file"));
            reader.readAsDataURL(file);
        });

    const loadBlogs = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const endpoint = admin
                ? `${API}/api/blogs?includeDrafts=1`
                : `${API}/api/blogs`;
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error("Failed to load blogs");
            }

            const data = await response.json();
            setBlogs(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Unable to fetch blogs");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBlogs();
    }, [loadBlogs, refreshKey]);

    const startEdit = (blog) => {
        setEditingBlogId(blog._id);
        setEditForm({
            title: blog.title || "",
            content: blog.content || "",
            published: blog.published !== false,
            image: blog.image || blog.coverImage || null,
        });
        setEditImageName(blog.image || blog.coverImage ? "Current image" : "");
    };

    const cancelEdit = () => {
        setEditingBlogId("");
        setEditForm({ title: "", content: "", published: true, image: null });
        setEditImageName("");
        if (editFileInputRef.current) {
            editFileInputRef.current.value = "";
        }
    };

    const handleEditImageFile = async (file) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            window.alert("Please select an image file.");
            return;
        }
        if (file.size > 4 * 1024 * 1024) {
            window.alert("Image is too large. Max size is 4MB.");
            return;
        }

        try {
            const dataUrl = await readFileAsDataUrl(file);
            setEditForm((prev) => ({ ...prev, image: dataUrl }));
            setEditImageName(file.name);
        } catch (err) {
            window.alert(err.message || "Unable to load image.");
        }
    };

    const removeEditImage = () => {
        setEditForm((prev) => ({ ...prev, image: null }));
        setEditImageName("");
        if (editFileInputRef.current) {
            editFileInputRef.current.value = "";
        }
    };

    const saveEdit = async (blog) => {
        const title = editForm.title.trim();
        const content = editForm.content.trim();
        if (!title || !content) {
            window.alert("Title and content are required.");
            return;
        }

        setSavingEdit(true);
        try {
            const response = await fetch(`${API}/api/blogs/${blog._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    content,
                    published: editForm.published,
                    slug: blog.slug || slugify(title),
                    image: editForm.image,
                }),
            });

            if (!response.ok) {
                const responseError = await response.json().catch(() => ({}));
                throw new Error(responseError.error || "Failed to update post");
            }

            const updated = await response.json();
            setBlogs((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
            cancelEdit();
        } catch (err) {
            window.alert(err.message || "Unable to update post");
        } finally {
            setSavingEdit(false);
        }
    };

    const deleteBlog = async (blog) => {
        if (!admin) return;
        const title = blog.title || "this post";
        if (!window.confirm(`Delete "${title}"? This action cannot be undone.`)) return;

        const response = await fetch(`${API}/api/blogs/${blog._id}`,{
            method: "DELETE"
        });

        if (!response.ok) {
            window.alert("Failed to delete blog");
            return;
        }

        setBlogs((prevBlogs) => prevBlogs.filter((item) => item._id !== blog._id));
    };

    return(
        <section className="admin-card admin-posts">
            <header className="admin-card__header">
                <div>
                    <h2 className="admin-card__title">{admin ? "Manage Posts" : "Blogs"}</h2>
                    <p className="admin-card__subtitle">
                        {loading ? "Syncing content..." : `${blogs.length} post${blogs.length === 1 ? "" : "s"} available`}
                    </p>
                </div>
            </header>

            {loading && <p className="admin-blog-state">Loading blogs...</p>}
            {error && <p className="admin-blog-state is-error">{error}</p>}
            {!loading && !error && blogs.length === 0 && (
                <p className="admin-blog-state">No blogs found yet.</p>
            )}

            {!loading && !error && blogs.length > 0 && (
                <div className="admin-posts__list">
                    {blogs.map((blog) => (
                        <article key={blog._id} className="admin-post">
                            {editingBlogId === blog._id ? (
                                <div className="admin-edit">
                                    <label className="admin-form__label" htmlFor={`edit-title-${blog._id}`}>Title</label>
                                    <input
                                        id={`edit-title-${blog._id}`}
                                        className="admin-form__input"
                                        value={editForm.title}
                                        onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
                                        disabled={savingEdit}
                                    />

                                    <label className="admin-form__label" htmlFor={`edit-content-${blog._id}`}>Content</label>
                                    <textarea
                                        id={`edit-content-${blog._id}`}
                                        className="admin-form__textarea is-edit"
                                        rows={6}
                                        value={editForm.content}
                                        onChange={(event) => setEditForm((prev) => ({ ...prev, content: event.target.value }))}
                                        disabled={savingEdit}
                                    />

                                    <label className="admin-form__label" htmlFor={`edit-status-${blog._id}`}>Status</label>
                                    <select
                                        id={`edit-status-${blog._id}`}
                                        className="admin-form__input"
                                        value={editForm.published ? "published" : "draft"}
                                        onChange={(event) => setEditForm((prev) => ({
                                            ...prev,
                                            published: event.target.value === "published",
                                        }))}
                                        disabled={savingEdit}
                                    >
                                        <option value="published">Published</option>
                                        <option value="draft">Draft</option>
                                    </select>

                                    <label className="admin-form__label">Post Image</label>
                                    <input
                                        ref={editFileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="admin-image-input"
                                        onChange={(event) => handleEditImageFile(event.target.files?.[0])}
                                        disabled={savingEdit}
                                    />

                                    {editForm.image && (
                                        <div className="admin-image-preview">
                                            <img
                                                src={editForm.image}
                                                alt={editForm.title || "Selected preview"}
                                                className="admin-image-preview__img"
                                            />
                                            <div className="admin-image-preview__meta">
                                                <p className="admin-image-preview__name">{editImageName || "Selected image"}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="admin-post__actions">
                                        <button
                                            className="admin-post__action"
                                            type="button"
                                            onClick={() => editFileInputRef.current?.click()}
                                            disabled={savingEdit}
                                        >
                                            Replace Image
                                        </button>
                                        <button
                                            className="admin-post__action is-danger"
                                            type="button"
                                            onClick={removeEditImage}
                                            disabled={savingEdit || !editForm.image}
                                        >
                                            Remove Image
                                        </button>
                                    </div>

                                    <div className="admin-post__actions">
                                        <button
                                            className="admin-post__action"
                                            onClick={() => saveEdit(blog)}
                                            type="button"
                                            disabled={savingEdit}
                                        >
                                            {savingEdit ? "Saving..." : "Save"}
                                        </button>
                                        <button
                                            className="admin-post__action is-muted"
                                            onClick={cancelEdit}
                                            type="button"
                                            disabled={savingEdit}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="admin-post__top">
                                        <h3 className="admin-post__title">{blog.title || "Untitled Post"}</h3>
                                        <span className={`admin-post__badge ${blog.published === false ? "is-draft" : "is-published"}`}>
                                            {blog.published === false ? "Draft" : "Published"}
                                        </span>
                                    </div>

                                    <p className="admin-post__meta">
                                        {(blog.createdAt && DATE_FORMATTER.format(new Date(blog.createdAt))) || "Recently"} •{" "}
                                        {getWordsCount(blog.content)} words
                                    </p>
                                    <p className="admin-post__excerpt">{getExcerpt(blog.content)}</p>

                                    {admin && (
                                        <div className="admin-post__actions">
                                            <button
                                                className="admin-post__action"
                                                onClick={() => startEdit(blog)}
                                                type="button"
                                            >
                                                Edit
                                            </button>
                                            <a
                                                className="admin-post__action is-link"
                                                href={`/blog/${blog.slug}`}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                View
                                            </a>
                                            <button
                                                className="admin-post__action is-danger"
                                                onClick={() => deleteBlog(blog)}
                                                type="button"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </section>
    )
}
