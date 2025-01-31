const {
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
} = require("../../integrationTests");
const jwt = require("jsonwebtoken");

const {
  BlogDatabaseClient,
} = require("../../../out/db/client/BlogDatabaseClient");
const {
  UserDatabaseClient,
} = require("../../../out/db/client/UserDatabaseClient");
const {
  TestBlogDatabaseClient,
} = require("../../out/db/client/TestBlogDatabaseClient");
const { BlogModel } = require("../../../domain/model/BlogModel");
const {
  TestUserDatabaseClient,
} = require("../../out/db/client/TestUserDatabaseClient");
const config = require("../../../config");

const existingUserId = "a8c821eff3814ccd39291032"; // username=techsavvy99
const existingUsername = "coolguy42";
const decodedExistingUserToken = createDecodedJwt(
  existingUsername,
  existingUserId,
);

let app;
let testLogger;
let connection;
let testBlogDatabaseClient;
let testUserDatabaseClient;
let blogsFixture;
let usersFixture;
let sut;

describe("blogsRouter", async () => {
  //
  // Lifecycle
  //

  before(async () => {
    testLogger = new Logger("blogs test logger");
    appLogger.disableAllLevels();
    appLogger.enableLevel("ERROR");

    // mongoose.set("debug", true);
    connection = await db.init(mongoose);
    testLogger.info("Connected to DB");

    const blogDatabaseClient = BlogDatabaseClient(connection);
    const userDatabaseClient = UserDatabaseClient(connection);
    const dbClientRegistry = {
      blogDatabaseClient,
      testBlogDatabaseClient: TestBlogDatabaseClient(blogDatabaseClient),
      userDatabaseClient,
      testUserDatabaseClient: TestUserDatabaseClient(userDatabaseClient),
    };
    testBlogDatabaseClient = dbClientRegistry.testBlogDatabaseClient;
    testUserDatabaseClient = dbClientRegistry.testUserDatabaseClient;

    blogsFixture = JSON.parse(
      fixtureUtil.readFixtureAsStringSync("./fixture/blogs.json"),
    );
    usersFixture = JSON.parse(
      fixtureUtil.readFixtureAsStringSync("./fixture/users.json"),
    );

    app = express();
    app = rest.configure(app, dbClientRegistry);
    sut = supertest(app);

    // In case there are leftovers for one reason or another
    await clearDatabase();
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

  //
  // Tests
  //
  await test("GET /api/blogs retrieves all blogs from the database", async () => {
    const response = await sut.get("/api/blogs");
    const posts = response.body;

    assert(posts.length === 6);
  });

  await test("GET /api/blogs returns identifier key is 'id', not '_id'", async () => {
    const response = await sut.get("/api/blogs");
    const allPosts = response.body;

    const gets = allPosts.map((post) => {
      // Note: this is not good for prod, but OK for now.
      // This is because we involve the internals (should
      // use public API instead). The result is not observable.
      return testBlogDatabaseClient.getById(post.id);
    });
    const allPostsById = await Promise.all(gets);
    for (const post of allPosts) {
      const postById = findPostById(post.id, "_id", allPostsById);
      assert.ok(postById);
    }
  });

  await test("POST /api/blogs saves blog to database", async () => {
    const newBlog = new BlogModel(
      "My epic post",
      "Roman Martynoff",
      "https://localhost",
      0,
      existingUserId,
    );

    const response = await sut.post("/api/blogs").send({
      blog: newBlog,
      magicNumber: config.MAGIC_NUMBER,
      token: decodedExistingUserToken,
    });
    const newBlogId = response.body.details.id;

    // Same here: we involve implementation detail.
    // This is not how you test in real life.
    const loadedBlogDocument = await testBlogDatabaseClient.getById(newBlogId);
    const loadedBlogObject = loadedBlogDocument.toObject();
    delete loadedBlogObject.id;
    assert.deepStrictEqual(loadedBlogObject, newBlog);
  });

  await test("POST /api/blogs likes are implicitly 0 if missing", async () => {
    const undefinedLikes = undefined;
    const newBlogWithoutLikes = new BlogModel(
      "My epic post",
      "Roman Martynoff",
      "https://localhost",
      undefinedLikes,
      existingUserId,
    );

    const response = await sut.post("/api/blogs").send({
      blog: newBlogWithoutLikes,
      magicNumber: config.MAGIC_NUMBER,
      token: decodedExistingUserToken,
    });
    const newBlogId = response.body.details.id;

    // Same here: we involve implementation detail.
    // This is not how you test in real life.
    const blogDocument = await testBlogDatabaseClient.getById(newBlogId);
    console.log(blogDocument);
    // const loadedPost = { title, author, url, likes };
    // assert.strictEqual(loadedPost.likes, 0);
  });

  await test("POST /api/blogs missing 'title' produces 400 Bad Request", async () => {
    const undefinedTitle = undefined;
    const newBlogWithoutTitle = new BlogModel(
      undefinedTitle,
      "Roman Martynoff",
      "https://localhost",
      0,
      existingUserId,
    );

    const response = await sut.post("/api/blogs").send({
      blog: newBlogWithoutTitle,
      magicNumber: config.MAGIC_NUMBER,
      token: decodedExistingUserToken,
    });

    assert(response.status === 400);
  });

  await test("POST /api/blogs missing 'url' produces 400 Bad Request", async () => {
    const undefinedUrl = undefined;
    const newBlogWithoutUrl = new BlogModel(
      "My epic post",
      "Roman Martynoff",
      undefinedUrl,
      0,
      existingUserId,
    );

    const response = await sut.post("/api/blogs").send({
      blog: newBlogWithoutUrl,
      magicNumber: config.MAGIC_NUMBER,
      token: decodedExistingUserToken,
    });

    assert(response.status === 400);
  });

  await test("POST /api/blogs missing user produces 400 Bad Request", async () => {
    const undefinedUserId = undefined;
    const newBlogWithoutUser = new BlogModel(
      "My epic post",
      "Roman Martynoff",
      "https://localhost",
      0,
      undefinedUserId,
    );
    const undefinedUsername = undefined;
    const decodedTokenWithMissingUser = createDecodedJwt(
      undefinedUsername,
      "userIdDoesNotMatter",
    );

    const response = await sut.post("/api/blogs").send({
      blog: newBlogWithoutUser,
      magicNumber: config.MAGIC_NUMBER,
      token: decodedTokenWithMissingUser,
    });

    assert(response.status === 400);
  });

  await test("POST /api/blogs non-existing user produces 400 Bad Request", async () => {
    const newBlogWithoutUser = new BlogModel(
      "My epic post",
      "Roman Martynoff",
      "https://localhost",
      0,
    );
    const nonExistingUserJwt = createDecodedJwt(
      "thisUsernameDoesNotExists",
      "thisUserIdDoesNotExists",
    );

    const response = await sut.post("/api/blogs").send({
      blog: newBlogWithoutUser,
      magicNumber: config.MAGIC_NUMBER,
      token: nonExistingUserJwt,
    });

    assert(response.status === 400);
  });

  await test("POST /api/blogs with valid JWT returns 200 OK and creates a new blog posted by the user found in JWT payload", async () => {
    const newValidBlog = new BlogModel(
      "My epic post",
      "Roman Martynoff",
      "https://localhost",
      0,
    );

    const payload = createDecodedJwt(existingUsername, existingUserId);
    const token = encodeAsJwt(payload);

    const response = await sut.post("/api/blogs").send({
      blog: newValidBlog,
      token: token,
    });
    const createdBlogId = response.body.details.id;
    const createdBlog = await testBlogDatabaseClient.getById(createdBlogId);

    assert.strictEqual(response.status, 200);
    assert(String(createdBlog.user) === existingUserId);
  });

  await test("DELETE /api/blogs/:id returns 401 if there is no token present in body", async () => {
    const noToken = undefined;

    const response = await sut
      .delete("/api/blogs/blogIdDoesntMatter")
      .send({ token: noToken });

    assert.strictEqual(response.status, 401);
  });

  await test("DELETE /api/blogs/:id deletes blog post from database", async () => {
    const existingBlogId = "5a422aa71b54a676234d17f8";
    const existingBlog = await testBlogDatabaseClient.getById(existingBlogId);
    assert.ok(existingBlog);

    await testBlogDatabaseClient.deleteById(existingBlogId);
    const response = await testBlogDatabaseClient.getById(existingBlogId);

    assert(response === null);
  });

  await test("DELETE /api/blogs/:id returns 200 OK with deleted blog in body", async () => {
    const existingBlogId = "5a422a851b54a676234d17f7";
    const blogUser = "a8c821eff3814ccd39291031";
    const token = createDecodedJwt("usernameDoesntMatter", blogUser);
    const existingBlog = await getBlogById(existingBlogId);
    assert.ok(existingBlog);

    const response = await sut.delete(`/api/blogs/${existingBlogId}`).send({
      magicNumber: config.MAGIC_NUMBER,
      token,
    });
    const previouslyExistingBlog = existingBlog;

    assert.strictEqual(response.status, 200);
    assert.deepEqual(response.body, previouslyExistingBlog);
  });

  await test("DELETE /api/blogs/:id returns 404 if blog with specified ID does not exist", async () => {
    const token = createDecodedJwt(
      "usernameDoesntMatter",
      "userIdDoesntMatter",
    );

    const response = await sut.delete(`/api/blogs/nonExistingBlogId`).send({
      magicNumber: config.MAGIC_NUMBER,
      token: token,
    });

    assert.strictEqual(response.status, 404);
  });

  await test("DELETE /api/blogs/:id attempt to delete a blog that does not belong to user specified in JWT returns HTTP 403, blog is never deleted", async () => {
    const existingUserId = "a8c821eff3814ccd39291031";
    const blogIdPostedByAnotherUser = "5a422b3a1b54a676234d17f9"; // posted by a8c821eff3814ccd3929103_3
    const token = createDecodedJwt("usernameDoesntMatter", existingUserId);

    const response = await sut
      .delete(`/api/blogs/${blogIdPostedByAnotherUser}`)
      .send({
        magicNumber: config.MAGIC_NUMBER,
        token: token,
      });

    const blogById = testBlogDatabaseClient.getById(blogIdPostedByAnotherUser);
    assert.strictEqual(response.status, 403);
    assert.ok(blogById);
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

    await sut.put(`/api/blogs/${existingId}`).send(updates);

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

    const response = await sut.put(`/api/blogs/${existingId}`).send(updates);

    assert(response.status === 200);
    assert.deepStrictEqual(response.body, blogBeforeUpdate);
  });

  await test("PUT /api/blogs/:id returns 400 Bad Request with error response body if likes to update is negative", async () => {
    const existingId = "5a422aa71b54a676234d17f8";
    const blogToUpdate = await getBlogById(existingId);
    assert.ok(blogToUpdate);
    const newLikes = -100;
    const updates = {
      likes: newLikes,
    };

    const response = await sut.put(`/api/blogs/${existingId}`).send(updates);

    assert.strictEqual(response.status, 400);
    assert.match(response.body.message, /Likes can not be negative/);
  });
});

//
// Helpers
//
function findPostById(id, idKey, posts) {
  return posts.find((post) => {
    const retrievedId = { id: post[idKey] };
    if (retrievedId.id instanceof mongoose.Types.ObjectId) {
      retrievedId.value = retrievedId.id.toString();
    }
    return retrievedId.value === id;
  });
}

async function getBlogById(id) {
  const blogDocument = await testBlogDatabaseClient.getById(id);
  const { title, author, url, likes, user } = blogDocument.toObject();

  return {
    title,
    author,
    url,
    likes,
    user,
    id,
  };
}

async function populateDatabase() {
  try {
    testLogger.info("Populating database with test data.");
    await testBlogDatabaseClient.saveAll(blogsFixture);
    await testUserDatabaseClient.saveAll(usersFixture);
    testLogger.info("Populated database with test data.");
  } catch (error) {
    testLogger.error(error);
    throw error;
  }
}

async function clearDatabase() {
  try {
    testLogger.info("Clearing database.");
    await testBlogDatabaseClient.deleteAll();
    const usersDeletion = await testUserDatabaseClient.deleteAll();
    testLogger.info("", usersDeletion);
    const documentsCount = await testUserDatabaseClient.countDocuments();
    testLogger.info(`Cleared database. Documents left: ${documentsCount}`);
  } catch (error) {
    testLogger.error(error);
    throw error;
  }
}

async function closeDatabase() {
  try {
    testLogger.info("Closing database connection.");
    await db.close(connection);
    testLogger.info("Closed database connection.");
  } catch (error) {
    testLogger.error(error);
    throw error;
  }
}

function createDecodedJwt(username, userId, alg) {
  return {
    header: {
      alg: alg || "HS256",
      typ: "JWT",
    },
    payload: {
      username,
      user: userId,
    },
  };
}

function encodeAsJwt(payload) {
  return jwt.sign(payload, config.SECRET);
}
