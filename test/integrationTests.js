const { logger: appLogger } = require("../config");
const {
  test,
  describe,
  before,
  after,
  beforeEach,
  afterEach,
} = require("node:test");
const assert = require("node:assert");
const supertest = require("supertest");

const db = require("../out/db/db");
const mongoose = require("mongoose");
const Logger = require("../util/Logger");
const fixtureUtil = require("./testUtil/fixtureUtil");
const rest = require("../in/rest");
const express = require("express");
const constraints = require("../domain/constraints");

module.exports = {
  appLogger,
  test,
  describe,
  before,
  after,
  beforeEach,
  afterEach,
  assert,
  supertest,
  db,
  mongoose,
  Logger,
  fixtureUtil,
  rest,
  express,
  constraints,
};
