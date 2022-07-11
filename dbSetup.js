const { db } = require("./models/postgressPool");
async function initialize() {
    await db.none(
      "CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY,name TEXT,email VARCHAR(128) UNIQUE NOT NULL,password VARCHAR(128) NOT NULL)"
    );
    await db.none(
      "CREATE TABLE IF NOT EXISTS songs(id SERIAL PRIMARY KEY,name TEXT,date_of_release DATE NOT NULL,cover TEXT)"
    );
    await db.none(
      "CREATE TABLE IF NOT EXISTS artists(id SERIAL PRIMARY KEY,name TEXT,dob DATE NOT NULL,bio TEXT)"
    );
    await db.none(
      "CREATE TABLE IF NOT EXISTS song(id SERIAL PRIMARY KEY,song_id INTEGER NOT NULL,artist_id INTEGER NOT NULL)"
    );
    await db.none(
      "CREATE TABLE IF NOT EXISTS songs_ratings(id SERIAL PRIMARY KEY,song_id INTEGER NOT NULL,user_id INTEGER NOT NULL,rate INTEGER NOT NULL)"
    );
    await db.none(
      `CREATE OR REPLACE VIEW topsongs as select DISTINCT i.id,i.name,i.rate,i.date_of_release,CONCAT('${process.env.BACKEND_URI}',i.cover) as cover,(select array(select name from (select * from song where song_id =i.id) as k inner join artists on artist_id=artists.id)) artists from (SELECT songs.id,name,songs.date_of_release,songs.cover,coalesce(round(avg(rate)),0) as rate from songs_ratings right join songs on song_id=songs.id group by songs.id,songs.name order by rate desc limit 10) AS i left join song on i.id=song.song_id order by rate desc`
    );
    await db.none(
      "CREATE OR REPLACE VIEW topartists as select artists.id,name,dob,bio,(select array(select name from (select * from song where artist_id=artists.id)as j inner join songs on j.song_id=songs.id)) as songs from (select artist_id,avg(rate) as rate from song inner join songs_ratings on song.song_id=songs_ratings.song_id group by artist_id order by rate desc limit 10) as k right join artists on artist_id=artists.id limit 10"
    );

}
module.exports = initialize;
