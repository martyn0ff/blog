const { BlogDocument } = require("../model/BlogDocument");

function BlogDatabaseClient(mongoose) {
  const Blog = BlogDocument(mongoose);

  async function getAll() {
    return Blog.find({});
  }

  async function save(blog) {
    if (!blog.likes) {
      blog.likes = 0;
    }
    const dbModel = new Blog(blog);
    return dbModel.save();
  }

  return {
    Blog,
    getAll,
    save,
  };
}

module.exports = { BlogDatabaseClient };
