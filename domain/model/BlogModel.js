class BlogModel {
  title;
  author;
  url;
  likes;

  constructor(title, author, url, likes) {
    this.title = title;
    this.author = author;
    this.url = url;
    this.likes = likes;

    Object.freeze(this);
  }
}

module.exports = { BlogModel };
