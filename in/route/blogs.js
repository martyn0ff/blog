const express = require("express");
const { Response } = require("../model/Response");
const { ValidationError } = require("../../common/error/ValidationError");
const { safeAsyncHandler } = require("../util/routeUtil");
const jwt = require("jsonwebtoken");
const config = require("../../config");
const { BlogModel } = require("../../domain/model/BlogModel");

function blogsRouter(blogDbClient) {
  const router = express.Router();

  // Get all blog posts
  router.get(
    "/",
    safeAsyncHandler(async (req, res, next) => {
      const posts = {};
      try {
        posts.posts = await blogDbClient.getAll();
      } catch (error) {
        return next(error);
      }

      return res.status(200).json(posts.posts);
    }),
  );

  // Create new blog post
  router.post(
    "/",
    safeAsyncHandler(async (req, res, next) => {
      checkMagicNumberForTests();

      const token = req.body.token;
      if (!token) {
        return unauthorizedResponse(res);
      }

      const magicNumber = req.body.magicNumber;
      const payload = {};
      if (isMagicNumber(magicNumber)) {
        payload.value = req.body.token;
      } else
        try {
          payload.value = jwt.verify(token, config.SECRET);
        } catch (error) {
          return next(error);
        }
      // Token defines who posted this blog
      const blog = req.body.blog;
      const newBlog = new BlogModel(
        blog.title,
        blog.author,
        blog.url,
        blog.likes || 0,
        payload.value.payload.user,
      );
      const savedBlog = {};
      try {
        validateBlog(newBlog);
        savedBlog.value = await blogDbClient.save(newBlog);
      } catch (error) {
        // NB: if user does not exist, mongoose
        // will catch that
        return next(error);
      }

      return res.status(200).json(
        Response.success("Blog saved successfully.", {
          id: savedBlog.value.id,
        }),
      );
    }),
  );

  // Delete blog post by ID
  router.delete(
    "/:id",
    safeAsyncHandler(async (req, res, next) => {
      const deletedBlog = {};
      try {
        deletedBlog.blog = await blogDbClient.deleteById(req.params.id);
      } catch (error) {
        return next(error);
      }

      return res.status(200).json(deletedBlog.blog);
    }),
  );

  // Update blog post by ID
  router.put(
    "/:id",
    safeAsyncHandler(async (req, res, next) => {
      const update = req.body;
      const preUpdateBlog = {};
      try {
        validateUpdate(update);
        preUpdateBlog.blog = await blogDbClient.update(req.params.id, update);
      } catch (error) {
        return next(error);
      }
      return res.status(200).json(preUpdateBlog.blog);
    }),
  );

  return router;
}

//
// Helpers
//

function unauthorizedResponse(res) {
  return res.status(401).header("WWW-Authenticate", "Bearer").end();
}

function validateUpdate(update) {
  if (update.likes < 0) {
    throw new ValidationError("Likes can not be negative");
  }
}

// TODO: Remove this and do not use this in production
function checkMagicNumberForTests() {
  if (!process.env.MAGIC_NUMBER) {
    throw new Error(
      "MAGIC_NUMBER is not defined. It is needed for tests and is a temporary measure.",
    );
  }
}

// TODO: Remove this and do not use this in production
function isMagicNumber(magicNumber) {
  return magicNumber === process.env.MAGIC_NUMBER;
}

function validateBlog(blog) {
  if (!blog.title) {
    throw new ValidationError("Missing title");
  }
  if (!blog.url) {
    throw new ValidationError("Missing url");
  }
  if (blog.likes < 0) {
    throw new ValidationError("Likes can not be negative");
  }
  if (!blog.user) {
    throw new ValidationError("Missing user");
  }
}

module.exports = { blogsRouter };
