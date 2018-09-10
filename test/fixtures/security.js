module.exports = {
  jwt: function(req, res, next) {
    if (req.headers["authorization"]) {
      next();
      return;
    }
    res.statusCode = 403;
    next(new Error("No permision"));
  }
};
