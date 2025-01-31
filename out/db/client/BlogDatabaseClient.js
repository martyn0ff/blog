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
    const document = new Blog(blog);
    return document.save();
  }

  async function deleteById(id) {
    return Blog.findByIdAndDelete(id);
  }

  async function update(id, blogUpdates) {
    return Blog.findByIdAndUpdate(id, blogUpdates);
  }

  return {
    Blog,
    getAll,
    save,
    deleteById,
    update,
  };
}

module.exports = { BlogDatabaseClient };
