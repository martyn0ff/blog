function TestBlogDatabaseClient(baseBlogDatabaseClient) {
  const Blog = baseBlogDatabaseClient.Blog;

  async function saveAll(blogObjects) {
    return Blog.bulkSave(blogObjects.map((blog) => new Blog(blog)));
  }

  async function deleteAll() {
    return Blog.deleteMany({});
  }

  return {
    ...baseBlogDatabaseClient,
    saveAll,
    deleteAll,
  };
}

module.exports = { TestBlogDatabaseClient };
