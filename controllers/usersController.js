const { db } = require("../models/postgressPool");
const Joi = require("joi");
module.exports = {
  addsong: async (req, res, next) => {
    try {
      console.log(req.body);
      let data = await db.one(
        "insert into songs(name,date_of_release,cover)values($1,$2,$3) RETURNING id",
        [req.body.name, req.body.date_of_release, req.body.cover]
      );
      console.log(data);
      let values = "";
      for (i in req.body.artist_id) {
        if (i == req.body.artist_id.length - 1)
          values += `(${req.body.artist_id[i]},${data.id})`;
        else values += `(${req.body.artist_id[i]},${data.id}),`;
      }
      console.log(values);
      await db.none(`insert into song(artist_id,song_id)values${values}`);
      data = await db.any("select * from song");
      res.send(data);
    } catch (error) {
      next(error);
    }
  },
  addartist: async (req, res, next) => {
    try {
      let data = await db.any(
        "insert into artists(name,dob,bio)values($1,$2,$3)",
        [req.body.name, req.body.dob, req.body.bio]
      );

      res.send(data);
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
};
