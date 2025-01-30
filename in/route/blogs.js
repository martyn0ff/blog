const express = require("express");
const { Response } = require("../model/Response");
const { ValidationError } = require("../model/ValidationError");

function blogsRouter(blogDbClient) {
  const router = express.Router();

  // Get all blog posts
  router.get("/", async (req, res, next) => {
    const posts = {};
    try {
      posts.posts = await blogDbClient.getAll();
    } catch (error) {
      return next(error);
    }

    return res.status(200).json(posts.posts);
  });

  // Create new blog post
  router.post("/", async (req, res, next) => {
    const newPost = req.body;
    const savedPost = {};
    try {
      validatePost(newPost);
      savedPost.post = await blogDbClient.save(newPost);
    } catch (error) {
      return next(error);
    }

    return res
      .status(200)
      .json(
        Response.success("User saved successfully.", { id: savedPost.post.id }),
      );
  });

  // Delete blog post by ID
  router.delete("/:id", async (req, res, next) => {
    const deletedBlog = {};
    try {
      deletedBlog.blog = await blogDbClient.remove(req.params.id);
    } catch (error) {
      return next(error);
    }

    return res.status(200).json(deletedBlog.blog);
  });

  // Update blog post by ID
  router.put("/:id", async (req, res, next) => {
    const update = req.body;
    const preUpdateBlog = {};
    try {
      validateUpdate(update);
      preUpdateBlog.blog = await blogDbClient.update(req.params.id, update);
    } catch (error) {
      return next(error);
    }

    return res.status(200).json(preUpdateBlog.blog);
  });

  return router;
}

function validateUpdate(update) {
  if (update.likes < 0) {
    throw new ValidationError("Likes can not be negative");
  }
}

function validatePost(post) {
  if (!post.title) {
    throw new ValidationError("Missing title");
  }
  if (!post.url) {
    throw new ValidationError("Missing url");
  }
  if (post.likes < 0) {
    throw new ValidationError("Likes can not be negative");
  }
}

module.exports = { blogsRouter };
