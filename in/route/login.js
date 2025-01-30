const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../../config");
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

      const isPasswordCorrect = bcrypt.compareSync(
        loginRequest.password,
        user.value.passwordHash,
      );
      if (!isPasswordCorrect) {
        return unauthorizedResponse(res);
      }

      const identity = {
        username: user.value.username,
        id: user.value._id,
      };
      const token = {};
      try {
        token.value = jwt.sign(identity, config.SECRET);
      } catch (error) {
        return next(error);
      }

      return res.status(200).json({
        token: token.value,
        username: user.value.username,
        name: user.value.name,
      });
    }),
  );

  return router;
}

function unauthorizedResponse(res) {
  return res.status(401).header("WWW-Authenticate", "Bearer").end();
}

module.exports = { loginRouter };
