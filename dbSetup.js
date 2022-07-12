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
      `CREATE OR REPLACE VIEW topsongs as select songs.id,name,date_of_release,CONCAT('${process.env.BACKEND_URI}',cover) as cover,(select array(select name from (select artist_id from song where song_id=songs.id) as artists_ids inner join artists on artist_id=artists.id)) as artists,coalesce(rate,0)as rate from (select round(avg(rate)) as rate,song_id from Songs_ratings group by song_id) as top_songs right join songs on song_id=songs.id order by rate desc limit 10`
    );
    await db.none(
      "CREATE OR REPLACE VIEW topartists as select id,name,dob,(select array(select name from (select * from song where artist_id=top10artists.id) as sing_song left join songs on songs.id=sing_song.song_id))as songs from (select id,coalesce(rate,0)as rate,name,dob from (select avg(rate)as rate,song.artist_id from (select song_id,avg(rate)as rate from songs_ratings group by song_id) as average_songs_ratings inner join song on average_songs_ratings.song_id=song.song_id group by song.artist_id) as top_artists right join artists on top_artists.artist_id=artists.id order by rate desc limit 10) as top10artists"
    );
}
module.exports = initialize;
