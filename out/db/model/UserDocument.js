const { toJSON } = require("../db");
const schema = {};

function UserDocument(mongoose) {
  if (!schema.value) {
    schema.value = new mongoose.Schema({
      username: {
        type: String,
        required: true,
        unique: true,
      },
      passwordHash: String,
      name: String,
      blogs: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "Blog",
        },
      ],
    });
  }

  const transform = (document, returnedObject) => {
    delete returnedObject.passwordHash;
  };

  schema.value.set("toJSON", toJSON(transform));
  return mongoose.model("User", schema.value);
}

module.exports = { UserDocument };
