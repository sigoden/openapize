const store = require("./store");

module.exports = {
  listPets: function(req, res, next) {
    res.json(store.all());
  },
  postPets: function(req, res, next) {
    res.json(store.get(store.put(req.body)));
  },
  showPetById: function(req, res, next) {
    res.json(store.get(req.params["petId"]));
  }
};
