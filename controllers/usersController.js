const { db } = require("../models/postgressPool");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const Joi = require("joi");
module.exports = {
  addsong: async (req, res, next) => {
    try {
      const schema = {
        name: Joi.string().min(5).required(),
        date_of_release: Joi.date().iso().required(),
        artist_id: Joi.string(),
      };
      const artist_id = JSON.parse(req.body.artist_id);
      const result = Joi.validate(req.body, schema);
      if (result.error)
        return res.status(400).send(result.error.details[0].message);
      if (!artist_id.length)
        return res.status(400).send("Artists Must be selected");
      if (!req.file) return res.status(400).send("Please upload cover image");
      let data = await db.one(
        "insert into songs(name,date_of_release,cover)values($1,$2,$3) RETURNING id",
        [req.body.name, req.body.date_of_release, req.file.filename]
      );
      let values = "";
      for (i in artist_id) {
        if (i == artist_id.length - 1) values += `(${artist_id[i]},${data.id})`;
        else values += `(${artist_id[i]},${data.id}),`;
      }
      await db.none(`insert into song(artist_id,song_id)values${values}`);
      res.send("Song updated succefully.");
    } catch (error) {
      next(error);
    }
  },
  addartist: async (req, res, next) => {
    try {
      const schema = {
        name: Joi.string().min(3).required(),
        dob: Joi.date().iso().required(),
        bio: Joi.string().min(10).required(),
      };
      const result = Joi.validate(req.body, schema);
      if (result.error)
        return res.status(400).send(result.error.details[0].message);
      let data = await db.none(
        "insert into artists(name,dob,bio)values($1,$2,$3)",
        [req.body.name, req.body.dob, req.body.bio]
      );
      res.send("Artist Added successfully");
    } catch (error) {
      next(error);
    }
  },
  ratesong: async (req, res, next) => {
    try {
      console.log(req.user);
      const schema = {
        song_id: Joi.number().required(),
        rate: Joi.number().integer().min(1).max(5).required(),
      };
      const result = Joi.validate(req.body, schema);
      if (result.error)
        return res.status(400).send(result.error.details[0].message);
      const { song_id, rate } = req.body;
      console.log(req.body);
      let count = await db.any(
        "select * from songs_ratings where user_id=$1 and song_id=$2",
        [req.user.id, req.body.song_id]
      );
      console.log(count.length);
      if (count.length) {
        await db.none(
          "update songs_ratings SET rate=$1 WHERE song_id=$2 AND user_id=$3 ",
          [req.body.rate, req.body.song_id, req.user.id]
        );
      } else {
        await db.none(
          "insert into songs_ratings( rate, song_id, user_id) values($1, $2, $3)",
          [req.body.rate, req.body.song_id, req.user.id]
        );
      }
      res.send("Your Rate Saved");
    } catch (error) {
      next(error);
    }
  },
  getartists: async (req, res) => {
    try {
      const artists = await db.any("select id,name from artists");
      res.send(artists);
    } catch (e) {}
  },
  gettop10songs: async (req, res, next) => {
    try {
      const songs = await db.any("select * from topsongs");
      res.send(songs);
    } catch (e) {
      next(error);
    }
  },
  gettop10artists: async (req, res, next) => {
    try {
      const songs = await db.any("select * from topartists");
      res.send(songs);
    } catch (e) {
      next(error);
    }
  },
  getuser: async (req, res) => {
    const token = jwt.sign(
      _.pick(req.user, ["id", "name"]),
      process.env.TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      }
    );
    res.send({
      message: "Success",
      token,
      name: req.user.name,
      email: req.user.email,
    });
  },
};
