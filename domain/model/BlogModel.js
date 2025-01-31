class BlogModel {
  title;
  author;
  url;
  likes;
  // different from author: this is the user
  // that exists in the database and posted
  // this blog URL
  user;

  constructor(title, author, url, likes, user) {
    this.title = title;
    this.author = author;
    this.url = url;
    this.likes = likes;
    this.user = user;

    Object.freeze(this);
  }
}

module.exports = { BlogModel };
