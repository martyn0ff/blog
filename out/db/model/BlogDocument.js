const { toJSON } = require("../db");
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
      },
    });
  }

  schema.set("toJSON", toJSON());
  return mongoose.model("Blog", schema);
}

module.exports = { BlogDocument };
