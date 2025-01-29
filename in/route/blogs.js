const express = require("express");
const { logger } = require("../../util/config");

function blogsRouter(dbClient) {
  const router = express.Router();

  router.get("/", async (req, res, next) => {
    const posts = {};
    try {
      posts.posts = await dbClient.getAll();
      return res.status(200).json(posts);
    } catch (error) {
      return next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const newPost = req.body;
      validatePost(newPost);
      const savedPost = await dbClient.save(newPost);
      return res.status(200).json(savedPost);
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      const deletedBlog = await dbClient.remove(req.params.id);
      return res.status(200).json(deletedBlog);
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", async (req, res, next) => {
    try {
      const update = req.body;
      validateUpdate(update);
      const preUpdateBlog = await dbClient.update(req.params.id, update);
      return res.status(200).json(preUpdateBlog);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

function validateUpdate(update) {
  if (update.likes < 0) {
    throw new Error("Likes can not be negative");
  }
}

function validatePost(post) {
  if (!post.title) {
    throw new Error("Missing title");
  }
  if (!post.url) {
    throw new Error("Missing url");
  }
  if (post.likes < 0) {
    throw new Error("Likes can not be negative");
  }
}

module.exports = { blogsRouter };
