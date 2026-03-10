import { useState } from "react";
import Bloglist from "./Bloglist";
import CreateBlog from "./CreateBlog";

export default function AdminBlogPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <section className="admin-blog-page">
      <p className="admin-blog-page__kicker">Content Studio</p>
      <p className="admin-blog-page__subtitle">
        Review live posts and publish new content from one workspace.
      </p>

      <div className="admin-blog-grid">
        <Bloglist admin refreshKey={refreshKey} />
        <CreateBlog
          sectionId="create-new-post"
          onCreated={() => setRefreshKey((value) => value + 1)}
        />
      </div>
    </section>
  );
}
