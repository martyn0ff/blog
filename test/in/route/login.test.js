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

const { LoginRequest } = require("../../../in/model/LoginRequest");
const {
  TestUserDatabaseClient,
} = require("../../out/db/client/TestUserDatabaseClient");
const {
  UserDatabaseClient,
} = require("../../../out/db/client/UserDatabaseClient");
let app;
let sut;
let testLogger;
let connection;
let testUserDatabaseClient;
let usersFixture;

describe("loginRouter", async () => {
  before(async () => {
    testLogger = new Logger("login test logger");
    appLogger.disableAllLevels();
    appLogger.enableLevel("ERROR");

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

  await describe("POST /api/login for user login", async () => {
    await test("If user is not found, 401 Unauthorized is sent with WWW-Authenticate: Bearer header", async () => {
      const nonExistingUserLoginRequest = new LoginRequest(
        "nonExistingUser",
        "passwordIsIrrelevant",
      );

      const response = await sut
        .post("/api/login")
        .send(nonExistingUserLoginRequest);

      assert(response.status === 401);
      assert(response.headers["www-authenticate"] === "Bearer");
    });

    await test("if password is incorrect, HTTP 401 is sent with WWW-Authenticate: Bearer header", async () => {
      const existingUsername = "coolguy42";
      assert(thatUserExists(existingUsername));
      const userWithIncorrectPasswordLoginRequest = new LoginRequest(
        existingUsername,
        "thisPasswordIsIncorrect",
      );

      const response = await sut
        .post("/api/login")
        .send(userWithIncorrectPasswordLoginRequest);

      assert(response.status === 401);
      assert(response.headers["www-authenticate"] === "Bearer");
    });

    await test("if password is correct, HTTP 200 is sent with an access token in body", async () => {
      const existingUsername = "coolguy42";
      const correctPassword = "coolpassword42";
      const userWithCorrectPasswordLoginRequest = new LoginRequest(
        existingUsername,
        correctPassword,
      );

      const response = await sut
        .post("/api/login")
        .send(userWithCorrectPasswordLoginRequest);

      assert(response.status === 200);
      const token = response.body;
      assert(token.length > 0);
    });
  });
});

//
// Helpers
//
async function populateDatabase() {
  try {
    testLogger.info("Populating database with test data.");
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
    await testUserDatabaseClient.deleteAll();
    testLogger.info("Cleared database.");
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

//
// Assertions
//
function thatUserExists(existingUsername) {
  return testUserDatabaseClient.get({ username: existingUsername });
}
