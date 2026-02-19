const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_PATH = path.join(__dirname, "movies.db");
const db = new sqlite3.Database(DB_PATH);


//** TABLE
// id INTEGER PRIMARY KEY
// title TEXT
// genre TEXT
// rating REAL
// watched INTEGER
// watch_date TEXT
// review TEXT
// poster_url TEXT*/

function init(){
    const sql = `
    CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        genre TEXT NOT NULL,
        rating REAL NOT NULL,
        watched INTEGER NOT NULL,
        watched_date TEXT,
        review TEXT,
        poster_url TEXT)`;
    return run(sql);
}

function run(){

}

function get(){

}

function all(){

}


//**List Movies
// get the movie id
// add a movie
// update a movie
// toggle watched
// delete a movie
// cleare watched */