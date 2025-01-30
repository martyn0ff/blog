function TestBlogDatabaseClient(baseBlogDatabaseClient) {
  const Blog = baseBlogDatabaseClient.Blog;

  async function saveAll(blogObjects) {
    return Blog.bulkSave(blogObjects.map((blog) => new Blog(blog)));
  }

  async function deleteAll() {
    return Blog.deleteMany({});
  }

  async function getById(id) {
    return Blog.findById(id);
  }

  return {
    ...baseBlogDatabaseClient,
    saveAll,
    deleteAll,
    getById,
  };
}

module.exports = { TestBlogDatabaseClient };
