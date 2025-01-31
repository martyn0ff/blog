const { BlogDocument } = require("../model/BlogDocument");

function BlogDatabaseClient(mongoose) {
  const Blog = BlogDocument(mongoose);

  function getAll() {
    return Blog.find({}).populate({
      path: "user",
      select: "-blogs", // redundant, we're already looking at blogs
    });
  }

  function save(blog) {
    const document = new Blog(blog);
    return document.save();
  }

  function deleteById(id) {
    return Blog.findByIdAndDelete(id);
  }

  function update(id, blogUpdates) {
    return Blog.findByIdAndUpdate(id, blogUpdates);
  }

  function getById(id) {
    return Blog.findById(id);
  }

  return {
    Blog,
    getAll,
    getById,
    save,
    deleteById,
    update,
  };
}

module.exports = { BlogDatabaseClient };
