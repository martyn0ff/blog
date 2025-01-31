const { toJSON, toObject } = require("../db");
const { BlogModel } = require("../../../domain/model/BlogModel");
let schema;

function BlogDocument(mongoose) {
  if (!schema) {
    schema = new mongoose.Schema({
      title: String,
      author: String,
      url: String,
      likes: Number,
      user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
      },
    });
  }

  schema.set("toJSON", toJSON());
  schema.set(
    "toObject",
    toObject((doc, o) => {
      const { title, author, url, likes, user } = o;
      return new BlogModel(title, author, url, likes, user);
    }),
  );
  return mongoose.model("Blog", schema);
}

module.exports = { BlogDocument };
