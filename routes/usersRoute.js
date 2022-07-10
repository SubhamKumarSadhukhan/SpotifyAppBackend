const router = require("express").Router();
const {
  addsong,
  addartist,
  ratesong,
  gettop10songs,
  gettop10artists,
} = require("../controllers/usersController");
router.route("/api/addartist").post(addartist);
router.route("/api/addsong").post(addsong);
router.route("/api/ratesong").post(ratesong);
router.route("/api/gettop10songs").get(gettop10songs);
router.route("/api/gettop10artists").get(gettop10artists);
module.exports = router;
