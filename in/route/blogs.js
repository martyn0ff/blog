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
      validate(newPost);
      const savedPost = await dbClient.save(newPost);
      return res.status(200).json(savedPost);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

function validate(post) {
  if (!post.title) {
    throw new Error("Missing title");
  }
  if (!post.url) {
    throw new Error("Missing url");
  }
  logger.trace("Validated!");
}

module.exports = { blogsRouter };
