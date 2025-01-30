const express = require("express");
const bcrypt = require("bcryptjs");
const config = require("../../config");
const { Response } = require("../model/Response");
const { ValidationError } = require("../../common/error/ValidationError");
const constraints = require("../../domain/constraints");
const { safeAsyncHandler } = require("../util/routeUtil");

function usersRouter(userDbClient) {
  const router = express.Router();

  // Create a user
  router.post(
    "/",
    safeAsyncHandler(async (req, res, next) => {
      const user = req.body;
      try {
        validateUser(user);
      } catch (error) {
        return next(error);
      }
      const plainTextPassword = user.password;
      const passwordHash = bcrypt.hashSync(
        plainTextPassword,
        Number(config.BCRYPT_ROUNDS),
      );
      const userToSave = {
        ...user,
        passwordHash,
      };
      // Mongoose will not save it anyway
      // but you never know
      delete userToSave.password;

      const savedUser = {};
      try {
        savedUser.user = await userDbClient.save(userToSave);
      } catch (error) {
        return next(error);
      }

      return res.status(200).json(
        Response.success("User created successfully.", {
          id: savedUser.user._id,
        }),
      );
    }),
  );

  // Get all users
  router.get(
    "/",
    safeAsyncHandler(async (req, res, next) => {
      const users = {};
      try {
        users.users = await userDbClient.getAll();
      } catch (error) {
        next(error);
      }

      return res.status(200).json(users.users);
    }),
  );

  return router;
}

function validateUser(user) {
  if (
    !user.password ||
    user.password.length < constraints.MIN_PASSWORD_LENGTH
  ) {
    throw new ValidationError(
      `Password must be greater than ${constraints.MIN_PASSWORD_LENGTH} characters long.`,
    );
  }
  if (
    !user.username ||
    user.username.length < constraints.MIN_USERNAME_LENGTH
  ) {
    throw new ValidationError(
      `Username must be at least ${constraints.MIN_USERNAME_LENGTH} characters long.`,
    );
  }
}

module.exports = { usersRouter };
