const { logger: appLogger } = require("../../../util/config");
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
const {
  BlogDatabaseClient,
} = require("../../../out/db/client/BlogDatabaseClient");
const {
  TestBlogDatabaseClient,
} = require("../../out/db/client/TestDatabaseClient");
const db = require("../../../out/db/db");
const mongoose = require("mongoose");
const Logger = require("../../../util/Logger");
const fixtureUtil = require("../../testUtil/fixtureUtil");
const rest = require("../../../in/rest");
const express = require("express");
const { BlogModel } = require("../../../domain/model/BlogModel");

let app;
let api;
let testLogger;
let connection;
let testBlogDatabaseClient;
let fixture;

before(async () => {
  testLogger = new Logger("blogs test logger");
  appLogger.disableAllLevels();

  connection = await db.init(mongoose);
  testLogger.info("Connected to DB");

  const blogDatabaseClient = BlogDatabaseClient(connection);
  testBlogDatabaseClient = TestBlogDatabaseClient(blogDatabaseClient);

  fixture = JSON.parse(
    fixtureUtil.readFixtureAsStringSync("./fixture/blogs.json"),
  );

  app = express();
  app = rest.configure(app, testBlogDatabaseClient);
  api = supertest(app);
});

beforeEach(async () => {
  await populateDatabase();
});

after(async () => {
  await closeDatabase();
});

afterEach(async () => {
  await clearDatabase();
});

describe("blogsRouter", async () => {
  await test("retrieves all blogs from the database", async () => {
    const response = await api.get("/api/blogs");
    const posts = response.body.posts;

    assert.strictEqual(posts.length, 6);
  });

  await test("returned identifier key is 'id', not '_id'", async () => {
    const response = await api.get("/api/blogs");
    const allPosts = response.body.posts;

    const gets = allPosts.map((post) => {
      // Note: this is not good for prod, but OK for now.
      // This is because we involve the internals (should
      // use public API instead). The result is not observable.
      return testBlogDatabaseClient.getById(post.id);
    });
    const allPostsById = await Promise.all(gets);
    for (const post of allPosts) {
      const postById = getPostById(post.id, "_id", allPostsById);
      assert.ok(postById);
    }
  });

  await test("saves blog to database", async () => {
    const newPost = new BlogModel(
      "My epic post",
      "Roman Martynoff",
      "https://localhost",
      0,
    );

    const response = await api.post("/api/blogs").send(newPost);
    const newPostId = response.body.id;

    // Same here: we involve implementation detail.
    // This is not how you test in real life.
    const { title, author, url, likes } =
      await testBlogDatabaseClient.getById(newPostId);
    const loadedPost = { title, author, url, likes };
    assert.deepEqual(loadedPost, newPost);
  });

  await test("likes are implicitly 0", async () => {
    const newPostWithoutLikes = new BlogModel(
      "My epic post",
      "Roman Martynoff",
      "https://localhost",
      undefined,
    );

    const response = await api.post("/api/blogs").send(newPostWithoutLikes);
    const newPostId = response.body.id;

    // Same here: we involve implementation detail.
    // This is not how you test in real life.
    const { title, author, url, likes } =
      await testBlogDatabaseClient.getById(newPostId);
    const loadedPost = { title, author, url, likes };
    assert.strictEqual(loadedPost.likes, 0);
  });

  await test("missing 'title' produces 400 Bad Request", async () => {
    const newPostWithoutTitle = new BlogModel(
      undefined,
      "Roman Martynoff",
      "https://localhost",
      0,
    );
    const response = await api.post("/api/blogs").send(newPostWithoutTitle);
    assert.strictEqual(response.status, 400);
  });

  await test("missing 'url' produces 400 Bad Request", async () => {
    const newPostWithoutUrl = new BlogModel(
      "My epic post",
      "Roman Martynoff",
      undefined,
      0,
    );
    const response = await api.post("/api/blogs").send(newPostWithoutUrl);
    assert.strictEqual(response.status, 400);
  });
});

// Helpers
function getPostById(id, idKey, posts) {
  return posts.find((post) => {
    const retrievedId = { id: post[idKey] };
    if (retrievedId.id instanceof mongoose.Types.ObjectId) {
      retrievedId.value = retrievedId.id.toString();
    }
    return retrievedId.value === id;
  });
}

async function populateDatabase() {
  testLogger.info("Populating database with test data.");
  await testBlogDatabaseClient.saveAll(fixture);
  testLogger.info("Populated database with test data.");
}

async function clearDatabase() {
  testLogger.info("Clearing database.");
  await testBlogDatabaseClient.deleteAll();
  testLogger.info("Cleared database.");
}

async function closeDatabase() {
  testLogger.info("Closing database connection.");
  await db.close(connection);
  testLogger.info("Closed database connection.");
}
