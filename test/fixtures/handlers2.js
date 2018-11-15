const store = require("./store");

module.exports = {
  listPets: function(req, res, next) {
    res.json(store.all());
  },
  showPetById: function(req, res, next) {
    res.json(store.get(req.params["petId"]));
  }
};
