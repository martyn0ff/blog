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
  constraints,
} = require("../../integrationTests");

const {
  UserDatabaseClient,
} = require("../../../out/db/client/UserDatabaseClient");
const {
  TestUserDatabaseClient,
} = require("../../out/db/client/TestUserDatabaseClient");
const { UnsavedUserModel } = require("../../../domain/model/UnsavedUserModel");
const morgan = require("morgan");

let app;
let sut;
let testLogger;
let connection;
let testUserDatabaseClient;
let usersFixture;

describe("usersRouter", async () => {
  //
  // Hooks
  //

  before(async () => {
    testLogger = new Logger("users test logger");
    appLogger.disableAllLevels();

    // mongoose.set("debug", true);
    connection = await db.init(mongoose);
    testLogger.info("Connected to DB");

    const userDatabaseClient = UserDatabaseClient(connection);
    const dbClientRegistry = {
      userDatabaseClient,
      testUserDatabaseClient: TestUserDatabaseClient(userDatabaseClient),
    };
    testUserDatabaseClient = dbClientRegistry.testUserDatabaseClient;

    usersFixture = JSON.parse(
      fixtureUtil.readFixtureAsStringSync("./fixture/users.json"),
    );

    app = express();
    // app.use(morgan("dev"));
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

  await test("GET /api/users retrieves all existing users in database", async () => {
    const response = await sut.get("/api/users");
    const users = response.body;

    assert.strictEqual(users.length, 5);
  });

  await test("GET /api/users returns identifier key as 'id', not '_id'", async () => {
    const response = await sut.get("/api/users");

    const allUsers = response.body;
    const gets = allUsers.map((user) =>
      testUserDatabaseClient.getById(user.id),
    );
    const allUsersById = await Promise.all(gets);
    for (const user of allUsers) {
      const userById = findUserById(user.id, "_id", allUsersById);
      assert.ok(userById);
    }
  });

  await test("GET /api/users returns users without a password or passwordHash", async () => {
    const response = await sut.get("/api/users");

    const allUsers = response.body;
    allUsers.forEach((user) => {
      assert(!user.password);
      assert(!user.passwordHash);
    });
  });

  await test("POST /api/users creates a new user", async () => {
    const newUser = new UnsavedUserModel(
      "roman",
      "myStrongPassword",
      "Roman Martynoff",
    );

    await sut.post("/api/users").send(newUser);

    const allUsersResponse = await sut.get("/api/users");
    const allUsers = allUsersResponse.body;
    assert.strictEqual(allUsers.length, usersFixture.length + 1);
  });

  await test(
    "creating new user requires username and password to be at least 3 characters  long",
    { only: true },
    async () => {
      assert(constraints.MIN_PASSWORD_LENGTH === 3);
      assert(constraints.MIN_USERNAME_LENGTH === 3);

      const shortPassword = "a".repeat(constraints.MIN_PASSWORD_LENGTH - 1);
      const validPassword = "a".repeat(constraints.MIN_PASSWORD_LENGTH);
      const shortUsername = "a".repeat(constraints.MIN_USERNAME_LENGTH - 1);
      const validUsername = "a".repeat(constraints.MIN_USERNAME_LENGTH);
      const validName = "Roman Martynoff";
      const undefinedPassword = undefined;
      const undefinedUsername = undefined;
      const usersCountBeforeSaving = usersFixture.length;

      const userWithoutPassword = new UnsavedUserModel(
        validUsername,
        undefinedPassword,
        validName,
      );
      const userWithShortPassword = new UnsavedUserModel(
        validUsername,
        shortPassword,
        validName,
      );
      const userWithoutUsername = new UnsavedUserModel(
        undefinedUsername,
        validPassword,
        validName,
      );
      const userWithShortUsername = new UnsavedUserModel(
        shortUsername,
        validPassword,
        validName,
      );
      const invalidUsers = [
        userWithoutPassword,
        userWithShortPassword,
        userWithoutUsername,
        userWithShortUsername,
      ];

      // Concurrent requests via forEach/Promise.all fail
      // with ECONNRESET. See: https://github.com/ladjs/supertest/issues/709
      for (const user of invalidUsers) {
        await sut.post("/api/users").send(user);
      }

      const allUsersResponse = await sut.get("/api/users");
      const allUsers = allUsersResponse.body;
      const usersCountAfterSaving = allUsers.length;

      assert(usersCountBeforeSaving === usersCountAfterSaving);
    },
  );
});

//
// Helpers
//
async function populateDatabase() {
  testLogger.info("Populating database with test data.");
  await testUserDatabaseClient.saveAll(usersFixture);
  testLogger.info("Populated database with test data.");
}

async function clearDatabase() {
  testLogger.info("Clearing database.");
  await testUserDatabaseClient.deleteAll();
  testLogger.info("Cleared database.");
}

async function closeDatabase() {
  testLogger.info("Closing database connection.");
  await db.close(connection);
  testLogger.info("Closed database connection.");
}

function findUserById(id, idKey, users) {
  return users.find((post) => {
    const retrievedId = { id: post[idKey] };
    if (retrievedId.id instanceof mongoose.Types.ObjectId) {
      retrievedId.value = retrievedId.id.toString();
    }
    return retrievedId.value === id;
  });
}
