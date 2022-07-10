const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const { db } = require("./models/postgressPool");
require("dotenv/config");
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromHeader("authorization");
opts.secretOrKey = process.env.TOKEN_SECRET;
module.exports = (passport) => {
  passport.use(
    new JwtStrategy(opts, async function (jwt_payload, done) {
      try {
        const user = await db.one("select * from users where id=$1", [
          jwt_payload.id,
        ]);
        return done(null, user);
      } catch {
        return done(err, false);
      }
    })
  );
};
