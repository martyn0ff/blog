function dummy(blogs) {
  return 1;
}

function totalLikes(blogs) {
  const reducer = (acc, current) => acc + current;

  return blogs.map((blog) => blog.likes).reduce(reducer, 0);
}

function favoriteBlog(blogs) {
  const reducer = (fav, current) => {
    if (current.likes > fav.likes) {
      return current;
    }
    return fav;
  };

  const { _id, url, __v, ...favoriteBlog } = blogs.reduce(reducer, blogs[0]);
  return favoriteBlog;
}

function mostBlogs(blogs) {
  const authorToBlogsReducer = (result, current) => {
    if (current.author in result) {
      result[current.author] = result[current.author] + 1;
    } else {
      result[current.author] = 1;
    }
    return result;
  };
  const authorStats = blogs.reduce(authorToBlogsReducer, {});

  const mostActiveAuthorReducer = (mostActive, [currAuthor, currBlogs]) => {
    if (currBlogs > mostActive.blogs) {
      return {
        author: currAuthor,
        blogs: currBlogs,
      };
    }

    return mostActive;
  };

  return [...Object.entries(authorStats)].reduce(mostActiveAuthorReducer, {
    author: null,
    blogs: 0,
  });
}

function mostLikes(blogs) {
  const authorToLikesReducer = (result, current) => {
    if (current.author in result) {
      result[current.author] = result[current.author] += current.likes;
    } else {
      result[current.author] = current.likes;
    }
    return result;
  };
  const authorStats = blogs.reduce(authorToLikesReducer, {});
  const mostPopularAuthorReducer = (mostPopular, [currAuthor, currLikes]) => {
    if (currLikes > mostPopular.likes) {
      return {
        author: currAuthor,
        likes: currLikes,
      };
    }

    return mostPopular;
  };

  return [...Object.entries(authorStats)].reduce(mostPopularAuthorReducer, {
    author: null,
    likes: 0,
  });
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
