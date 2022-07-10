const router = require("express").Router();
const passport = require("passport");
const authRoute = require("./authRoute");
const usersRoute = require("./usersRoute");
router.use(authRoute);
router.use(passport.authenticate("jwt", { session: false }), usersRoute);
module.exports = router;
