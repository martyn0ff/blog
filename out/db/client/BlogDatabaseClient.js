const { BlogDatabaseModel } = require("../model/BlogDatabaseModel");

function BlogDatabaseClient(mongoose) {
  const Blog = BlogDatabaseModel(mongoose);

  async function getAll() {
    return Blog.find({});
  }

  async function save(blog) {
    const dbModel = new Blog(blog);
    return dbModel.save();
  }

  return {
    getAll,
    save,
  };
}

module.exports = { BlogDatabaseClient };
