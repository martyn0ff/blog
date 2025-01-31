const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../../config");
const logger = config.logger;
const { LoginRequest } = require("../model/LoginRequest");
const { safeAsyncHandler } = require("../../in/util/routeUtil");

function loginRouter(userDbClient) {
  const router = express.Router();

  // Login
  router.post(
    "/",
    safeAsyncHandler(async (req, res, next) => {
      const loginRequest = new LoginRequest(
        req.body.username,
        req.body.password,
      );
      const user = {};
      try {
        user.value = await userDbClient.findOne({
          username: loginRequest.username,
        });
      } catch (error) {
        return next(error);
      }

      // Don't signal that user is not found to confuse attackers
      if (!user.value) {
        return unauthorizedResponse(res);
      }

      const isPasswordCorrect = validateCredentials(
        loginRequest.password,
        user.value.passwordHash,
      );
      if (!isPasswordCorrect) {
        logger.error(
          `Incorrect password provided for ${loginRequest.username}`,
        );
        return unauthorizedResponse(res);
      }

      const identity = {
        username: user.value.username,
        user: user.value._id,
      };
      const token = {};
      try {
        token.value = jwt.sign(identity, config.SECRET);
      } catch (error) {
        return next(error);
      }

      return res.status(200).json(token.value);
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

function validateCredentials(password, passwordHash) {
  return bcrypt.compareSync(password, passwordHash);
}

module.exports = { loginRouter };
