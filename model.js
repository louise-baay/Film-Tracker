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