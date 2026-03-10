import express from "express";
import Blog from "../models/blog.js";

const router = express.Router();


router.post("/", async (req, res) => {
  try {
    const {
      title,
      slug,
      content,
      image = "",
      published = true,
    } = req.body || {};

    const createdBlog = await Blog.create({
      title,
      slug,
      content,
      image,
      published,
    });
    res.status(201).json(createdBlog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.get("/", async (req, res) => {
  const includeDrafts = req.query.includeDrafts === "1" || req.query.includeDrafts === "true";
  const query = includeDrafts ? {} : { published: true };
  const blogs = await Blog.find(query).sort({ createdAt: -1 });
  res.json(blogs);
});


router.get("/:slug", async (req, res) => {
  const foundBlog = await Blog.findOne({ slug: req.params.slug });
  if (!foundBlog) {
    return res.status(404).json({ error: "blog not found" });
  }
  res.json(foundBlog);
});


router.put("/:id", async (req, res) => {
  const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updatedBlog);
});



router.delete("/:id", async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
