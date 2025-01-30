const { BlogDocument } = require("../model/BlogDocument");

function BlogDatabaseClient(mongoose) {
  const Blog = BlogDocument(mongoose);

  async function getAll() {
    return Blog.find({}).populate({
      path: "user",
      select: "-blogs", // redundant, we're already looking at blogs
    });
  }

  async function save(blog) {
    if (!blog.likes) {
      blog.likes = 0;
    }
    const document = new Blog(blog);
    return document.save();
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
