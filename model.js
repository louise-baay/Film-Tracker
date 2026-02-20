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
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        genre TEXT NOT NULL,
        rating REAL NOT NULL,
        watched INTEGER NOT NULL,
        watch_date TEXT,
        review TEXT,
        poster_url TEXT)
        `;
    return run(sql);
}

function run(sql, params = []){
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject (err);
            else resolve(this);
        })
    })
}

function get(sql, params = []){
    return new Promise((resolve, reject) => {
        db.get(sql, params, function(err, row) {
            if (err) reject (err);
            else resolve(row);
        })
    })
}

function all(sql, params = []){
    return new Promise((resolve, reject) => {
        db.all(sql, params, function(err, rows) {
            if (err) reject (err);
            else resolve(rows);
        })
    })
}


//**List Movies
// get the movie id
// add a movie
// update a movie
// toggle watched
// delete a movie
// cleare watched */

async function listMovies({filter = "all", sort="newest", q=""} = {}){
    const where = [];
    const params = [];

    if(filter === "watched") where.push("watched = 1");
    if(filter === "unwatched") where.push("watched = 0");

    if(q && q.trim() !== ""){
        where.push("(title LIKE ? OR genre LIKE ?)");
        params.push(`%${q.trim()}%`, `%${q.trim()}%`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    let orderBy = "ORDER BY id DESC"; // newest
    if (sort === "oldest") orderBy = "ORDER BY id ASC";
    if (sort === "rating_high") orderBy = "ORDER BY rating DESC, id DESC";
    if (sort === "rating_low") orderBy = "ORDER BY rating ASC, id DESC";
    if (sort === "watch_date") orderBy = "ORDER BY (watch_date IS NULL), watch_date DESC, id DESC";

    const sql = `
        SELECT id, title, genre, rating, watched, watch_date, review, poster_url
        FROM movies
        ${whereSql}
        ${orderBy}
    `;
    return all(sql, params);
}

function getMovieById(id){
    return get(
        `SELECT id, title, genre, rating, watched, watch_date, reviw, poster_url
        FROM movies WHERE id = ?`,
        [id]
    );
}

async function addMovie(data){
    const sql = `
    INSERT INTO movies (title, genre, rating, watched, watch_date, review, poster_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        data.title,
        data.genre,
        data.rating,
        data.watched,
        data.watch_date || null,
        data.review || "",
        data.poster_url || ""
    ];

    const res = await run(sql, params);
    return res.lastID;
}

async function updateMovie(id, data){
    const sql = `
    UPDATE movies
    SET title = ?, genre = ?, watched = ?, watch_date = ?, review = ?, poster_url = ?
    WHERE id = ?`;

    const params = [
        data.title,
        data.genre,
        data.rating,
        data.watched,
        data.watch_date || null,
        data.review || "",
        data.poster_url || "",
        id,
    ];
    await run(sql, params);
}


module.exports = {
    init,
    addMovie,
    listMovies,
    updateMovie,
    getMovieById,
}  