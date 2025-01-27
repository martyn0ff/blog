const { toJSON } = require("../db");
let schema;

function BlogDatabaseModel(mongoose) {
  if (!schema) {
    schema = new mongoose.Schema({
      title: String,
      author: String,
      url: String,
      likes: Number,
    });
  }

  schema.set("toJSON", toJSON());
  return mongoose.model("BlogDatabaseModel", schema);
}

module.exports = { BlogDatabaseModel };
