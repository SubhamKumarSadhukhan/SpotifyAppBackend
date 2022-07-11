const { db } = require("../models/postgressPool");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const { v4: uuidv4 } = require("uuid");
module.exports = {
  login: async (req, res, next) => {
    try {
      const schema = {
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(64).required(),
      };
      const result = Joi.validate(req.body, schema);
      if (result.error) return res.status(400).send("Invalid id or password");
      const user = await db.any("select * from users where email=$1", [
        req.body.email,
      ]);
      if (user.length) {
        const matched = await bcrypt.compare(
          req.body.password,
          user[0].password
        );
        if (matched) {
          // Signing token if password matched
          const token = jwt.sign(
            _.pick(user[0], ["id", "name"]),
            process.env.TOKEN_SECRET,
            {
              expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
            }
          );
          res.send({
            message: "Success",
            token,
            name: user[0].name,
            email: user[0].email,
          });
        } else res.status(400).send("Incorrect Username or Password");
      } else res.status(400).send("Not Registred");
    } catch (e) {
      next(e);
    }
  },
  register: async (req, res, next) => {
    try {
      const schema = {
        name: Joi.string().min(3).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(64).required(),
      };
      const result = Joi.validate(req.body, schema);
      if (result.error)
        return res.status(400).send(result.error.details[0].message);
      let { name, email, password } = req.body;
      password = await bcrypt.hash(password, 10);
      try {
        await db.none(
          "insert into users(name,email,password) values(${name},${email},${password})",
          { name, email, password }
        );
      } catch (e) {
        return res.status(400).send("Already registerd please login");
      }
      res.send("Success");
    } catch (e) {
      next(e);
    }
  },
};
