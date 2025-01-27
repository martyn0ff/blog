const express = require("express");
const { BlogDatabaseModel } = require("../../out/db/model/BlogDatabaseModel");

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
      const newPost = await dbClient.save(req.body);
      return res.status(200).json(newPost);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = { blogsRouter };
