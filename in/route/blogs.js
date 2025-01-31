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
      const userId = {};
      if (isMagicNumber(magicNumber)) {
        payload.value = req.body.token;
        userId.value = payload.value.payload.user;
      } else
        try {
          payload.value = jwt.verify(token, config.SECRET);
          userId.value = payload.value.payload.user;
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
        userId.value,
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
      checkMagicNumberForTests();

      const token = req.body.token;
      if (!token) {
        return unauthorizedResponse(res);
      }

      const blogId = req.params.id;
      const blogDocument = {};
      try {
        blogDocument.value = await blogDbClient
          .getById(blogId)
          .select("_id user");
      } catch (error) {
        return next(error);
      }
      if (!blogDocument.value) {
        return res
          .status(404)
          .json(Response.error(`Blog with id ${blogId} was not found`));
      }

      const magicNumber = req.body.magicNumber;
      const payload = {};
      const requestUser = {};
      if (isMagicNumber(magicNumber)) {
        payload.value = req.body.token;
        requestUser.value = payload.value.payload.user;
      } else
        try {
          payload.value = jwt.verify(token, config.SECRET);
          requestUser.value = payload.value.user;
        } catch (error) {
          return next(error);
        }

      const blogObject = blogDocument.value.toObject();
      if (requestUser.value !== blogObject.user) {
        return permissionDeniedResponse(res);
      }

      const deletedBlog = {};
      try {
        deletedBlog.blog = await blogDbClient.deleteById(blogId);
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

function permissionDeniedResponse(res) {
  return res.status(403).send(Response.error("Permission denied."));
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

function validateUpdate(update) {
  if (update.likes < 0) {
    throw new ValidationError("Likes can not be negative");
  }
}

function validateBlog(blog) {
  console.log("Validating", blog);
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
