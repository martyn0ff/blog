function unknownEndpoint() {
  return (req, res) => {
    res.status(404).send(`
      <h1>404</h1>
      <p>There is nothing here :(</p>
    `);
  };
}

module.exports = { unknownEndpoint };
