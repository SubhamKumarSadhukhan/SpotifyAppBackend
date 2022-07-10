const router = require("express").Router();
const { login, register } = require("../controllers/authController");
router.route("/api/login").post(login);
router.route("/api/register").post(register);
module.exports = router;
