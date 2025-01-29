const { BlogDocument } = require("../model/BlogDocument");
const { logger } = require("../../../util/config");

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

  async function remove(id) {
    return Blog.findByIdAndDelete(id);
  }

  async function update(id, blogUpdates) {
    return Blog.findByIdAndUpdate(id, blogUpdates);
  }

  return {
    Blog,
    getAll,
    save,
    remove,
    update,
  };
}

module.exports = { BlogDatabaseClient };
