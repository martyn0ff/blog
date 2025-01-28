const { test, describe } = require("node:test");
const assert = require("node:assert");
const sut = require("../../util/listHelper");
const fixtureUtil = require("../testUtil/fixtureUtil");

describe("dummy", () => {
  test("always returns one", () => {
    const blogs = [];

    const result = sut.dummy(blogs);

    assert.strictEqual(result, 1);
  });
});

describe("totalLikes", () => {
  test("total likes of single blog is same as its likes count", () => {
    const listWithOneBlog = [
      {
        _id: "5a422aa71b54a676234d17f8",
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
        likes: 5,
        __v: 0,
      },
    ];

    const result = sut.totalLikes(listWithOneBlog);

    assert.strictEqual(result, 5);
  });

  test("total likes of multiple blogs is the sum their likes", () => {
    const blogs = JSON.parse(
      fixtureUtil.readFixtureAsStringSync("./fixture/blogs.json"),
    );

    const totalLikes = sut.totalLikes(blogs);

    assert.strictEqual(totalLikes, 7 + 5 + 12 + 10 + 0 + 2);
  });
});

describe("favoriteBlog", () => {
  test("favorite blog is the blog with most likes", () => {
    const blogs = JSON.parse(
      fixtureUtil.readFixtureAsStringSync("./fixture/blogs.json"),
    );
    const expectedFavoriteBlog = {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      likes: 12,
    };

    const favoriteBlog = sut.favoriteBlog(blogs);

    assert.deepStrictEqual(favoriteBlog, expectedFavoriteBlog);
  });
});

describe("mostBlogs", () => {
  test("mostBlogs returns an most active author and their number of blogs", () => {
    const blogs = JSON.parse(
      fixtureUtil.readFixtureAsStringSync("./fixture/blogs.json"),
    );
    const expectedMostActiveAuthor = {
      author: "Robert C. Martin",
      blogs: 3,
    };

    const mostActiveAuthor = sut.mostBlogs(blogs);

    assert.deepStrictEqual(mostActiveAuthor, expectedMostActiveAuthor);
  });
});

describe("mostLikes", () => {
  test("mostLikes returns an author with most total likes", () => {
    const blogs = JSON.parse(
      fixtureUtil.readFixtureAsStringSync("./fixture/blogs.json"),
    );
    const expectedMostPopularAuthor = {
      author: "Edsger W. Dijkstra",
      likes: 17,
    };

    const mostPopularAuthor = sut.mostLikes(blogs);

    assert.deepStrictEqual(mostPopularAuthor, expectedMostPopularAuthor);
  });
});
