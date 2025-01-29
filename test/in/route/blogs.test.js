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
} = require("../../out/db/client/TestBlogDatabaseClient");
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

async function getBlogById(existingId) {
  const {
    title: existingTitle,
    author: existingAuthor,
    url: existingUrl,
    likes: existingLikes,
  } = await testBlogDatabaseClient.getById(existingId);
  return {
    id: existingId,
    title: existingTitle,
    author: existingAuthor,
    url: existingUrl,
    likes: existingLikes,
  };
}

describe("blogsRouter", async () => {
  await test("GET /api/blogs retrieves all blogs from the database", async () => {
    const response = await api.get("/api/blogs");
    const posts = response.body.posts;

    assert.strictEqual(posts.length, 6);
  });

  await test("GET /api/blogs returns identifier key is 'id', not '_id'", async () => {
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

  await test("POST /api/blogs saves blog to database", async () => {
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

  await test("POST /api/blogs likes are implicitly 0 if missing", async () => {
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

  await test("POST /api/blogs missing 'title' produces 400 Bad Request", async () => {
    const newPostWithoutTitle = new BlogModel(
      undefined,
      "Roman Martynoff",
      "https://localhost",
      0,
    );
    const response = await api.post("/api/blogs").send(newPostWithoutTitle);
    assert.strictEqual(response.status, 400);
  });

  await test("POST /api/blogs missing 'url' produces 400 Bad Request", async () => {
    const newPostWithoutUrl = new BlogModel(
      "My epic post",
      "Roman Martynoff",
      undefined,
      0,
    );
    const response = await api.post("/api/blogs").send(newPostWithoutUrl);
    assert.strictEqual(response.status, 400);
  });

  await test("DELETE /api/blogs/:id deletes blog post from database", async () => {
    const existingId = "5a422aa71b54a676234d17f8";
    const existingBlog = await getBlogById(existingId);
    assert.ok(existingBlog);

    const response = await testBlogDatabaseClient.getById(existingId);

    assert.strictEqual(response.body, undefined);
  });

  await test("DELETE /api/blogs/:id returns 200 OK with deleted blog in body", async () => {
    const existingId = "5a422aa71b54a676234d17f8";
    const existingBlog = await getBlogById(existingId);
    assert.ok(existingBlog);

    const response = await api.delete(`/api/blogs/${existingId}`);
    const previouslyExistingBlog = existingBlog;

    assert.strictEqual(response.status, 200);
    assert.deepEqual(response.body, previouslyExistingBlog);
  });

  await test("PUT /api/blogs/:id updates blog post", async () => {
    const existingId = "5a422aa71b54a676234d17f8";
    const blogToUpdate = await getBlogById(existingId);
    assert.ok(blogToUpdate);
    const newLikes = 1000;
    assert.notDeepEqual(blogToUpdate.likes, newLikes);
    const updates = {
      likes: newLikes,
    };

    await api.put(`/api/blogs/${existingId}`).send(updates);

    const updatedBlog = await testBlogDatabaseClient.getById(existingId);
    assert.strictEqual(updatedBlog.likes, newLikes);
  });

  await test("PUT /api/blogs/:id returns 200 OK with previous blog body on success", async () => {
    const existingId = "5a422aa71b54a676234d17f8";
    const blogBeforeUpdate = await getBlogById(existingId);
    assert.ok(blogBeforeUpdate);
    const newLikes = 1000;
    assert.notDeepEqual(blogBeforeUpdate.likes, newLikes);
    const updates = {
      likes: newLikes,
    };

    const response = await api.put(`/api/blogs/${existingId}`).send(updates);

    assert.strictEqual(response.status, 200);
    assert.deepEqual(response.body, blogBeforeUpdate);
  });

  await test("PUT /api/blogs/:id returns 400 Bad Request with error response body if likes to update is negative", async () => {
    const existingId = "5a422aa71b54a676234d17f8";
    const blogToUpdate = await getBlogById(existingId);
    assert.ok(blogToUpdate);
    const newLikes = -100;
    const updates = {
      likes: newLikes,
    };

    const response = await api.put(`/api/blogs/${existingId}`).send(updates);

    assert.strictEqual(response.status, 400);
    assert.match(response.body.message, /Likes can not be negative/);
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
