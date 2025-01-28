const { logger } = require("../../../../util/config");

function TestBlogDatabaseClient(baseClient) {
  const Blog = baseClient.Blog;

  async function saveAll(blogObjects) {
    blogObjects.forEach((o) => logger.trace(o));
    return Blog.bulkSave(blogObjects.map((blog) => new Blog(blog)));
  }

  async function deleteAll() {
    return Blog.deleteMany({});
  }

  async function getById(id) {
    return Blog.findById(id);
  }

  return {
    ...baseClient,
    saveAll,
    deleteAll,
    getById,
  };
}

module.exports = { TestBlogDatabaseClient };
