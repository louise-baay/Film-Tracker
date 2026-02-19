const express = require("express");
const mustacheExpress = require("mustache-express");
const model = require("./model");

const app = express();
const PORT = 3000;

app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", __dirname);
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.get("/", async (req,res) => {
    res.render("views", { pageTitle: "Movie Tracker", movies:[]});
});

function normalizeMovieForm(body){
    return {
        title: String(body.title ?? "").trim(),
        genre: String(body.genre ?? "").trim(),
        rating: Number(body.rating),
        watched: body.watched === "1" ? 1 : 0,
        watched_date: String(body.watch_date ?? "").trim(), 
        review: String(body.review ?? "").trim(),
        poster_url: String(body.poster_url ?? "").trim()
    };
}

function validateMovie(data){
    const errors = [];

    if (data.title.length < 2){
        errors.push({ msg: "Title must be at least 2 characters long. "});
    }
    if (data.genre.length < 2){
        errors.push({ msg: "Genre must be at least 2 characters long. "});
    }
    if (!isValidRating(data.rating)) {
        errors.push({ msg: "Rating must be a number between 0 and 10." });
    }
    if (data.watched === 1) {
        if (!isValidDateYYYYMMDD(data.watch_date)) {
        errors.push({ msg: "Watch Date must be a valid date in YYYY-MM-DD format when Watched = Yes." });
        }
    } else {
        // if not watched, allow blank watch_date
        if (data.watch_date !== "" && !isValidDateYYYYMMDD(data.watch_date)) {
        errors.push({ msg: "Watch Date must be blank or a valid YYYY-MM-DD date." });
        }
    }

    return errors;
}

// 8 Actions - 8 Routes
// Action 1/2/3: List + filter + sort

// Action 4: show edit form

// Action 5: create movie
app.post("/add", async (req, res) => {
    const data = normalizeMovieForm(req.body);

    const filter = req.body.filter || "all";
    const sort = req.body.sort || "newest";
    const q = req.body.q || "";

})

// Action 6: update movie

// Action 7: toggle watched

// Action 8: delete movie

(async () => {
    await model.init();
    app.listen(PORT, () => {
        console.log(`Movie Tracker running at http://localhost:${PORT}`);
    });
})();