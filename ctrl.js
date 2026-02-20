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

function isValidRating(raw) {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 && n <= 10;
}

function isValidDateYYYYMMDD(s) {
  // basic format check + actual date check
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(s))) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

function normalizeMovieForm(body){
    return {
        title: String(body.title ?? "").trim(),
        genre: String(body.genre ?? "").trim(),
        rating: Number(body.rating),
        watched: body.watched === "1" ? 1 : 0,
        watch_date: String(body.watch_date ?? "").trim(), 
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

async function renderHome(res, {
  movies = [],
  errors = [],
  form = {},
  mode = "add", // "add" | "edit"
  editMovieId = null,
  filter = "all",
  sort = "newest",
  q = "",
  notice = ""
} = {}) {
  res.render("views", {
    pageTitle: "Movie Tracker",
    movies,

    // mustache “switch” flags
    isAdd: mode === "add",
    isEdit: mode === "edit",

    editMovieId,
    errors,
    hasErrors: errors.length > 0,

    // preserve form values
    form_title: form.title ?? "",
    form_genre: form.genre ?? "",
    form_rating: (form.rating ?? "") === 0 ? 0 : (form.rating ?? ""),
    form_watched_1: form.watched === 1,
    form_watched_0: form.watched === 0 || form.watched == null,
    form_watch_date: form.watch_date ?? "",
    form_review: form.review ?? "",
    form_poster_url: form.poster_url ?? "",

    // top controls
    filter_all: filter === "all",
    filter_watched: filter === "watched",
    filter_unwatched: filter === "unwatched",

    sort_newest: sort === "newest",
    sort_oldest: sort === "oldest",
    sort_rating_high: sort === "rating_high",
    sort_rating_low: sort === "rating_low",
    sort_watch_date: sort === "watch_date",

    q,

    notice,
    hasNotice: notice !== "",
    movieCount: movies.length,
  });
}

// 8 Actions - 8 Routes
// Action 1/2/3: List + filter + sort
app.get("/", async (req,res) => {
    const filter = req.query.filter || "all";
    const sort = req.query.sort || "newest";
    const q = req.query.q || "";

    const movies = await model.listMovies({filter, sort, q});
    const decorated = movies.map(m => ({
        ...m,
        watchedYes: m.watched === 1,
        watchedNo: m.watched === 0,
        hasPoster: !!(m.poster_url && m.poster_url.trim()),
        hasReview: !!(m.review && m.review.trim()),
    }));

    await renderHome(res, {
        movies: decorated,
        mode: "add",
        form: { watched: 0 },
        filter,
        sort,
        q,
    });
})

// Action 4: prefill "Add Movie Form" so we can edit
app.get("/edit/:id", async (req, res) => {
    const id = Number(req.params.id);
    const movieId = await model.getMovieById(id);
    if(!movieId) return res.status(404).send("Movie Not Found!");

    const filter = req.query.filter || "all";
    const sort = req.query. sort  || "newest";
    const q = req.query.q || "";

    const movies = await model.listMovies({filter, sort, q});
    const decorated = movies.map(m => ({
        ...m,
        watchedYes: m.watched === 1,
        watchedNo: m.watched === 0,
        hasPoster: !!(m.poster_url && m.poster_url.trim()),
        hasReview: !!(m.review && m.review.trim()),
    }));

    await renderHome(res, {
        movies: decorated,
        mode: "edit",
        editMovieId: id,
        form: movieId,
        filter,
        sort,
        q,
    });
});

// Action 5: create movie
app.post("/add", async (req, res) => {
    const data = normalizeMovieForm(req.body);
    const errors = validateMovie(data);

    const filter = req.body.filter || "all";
    const sort = req.body.sort || "newest";
    const q = req.body.q || "";

    if(errors.length){
        const movies = await model.listMovies({ filter, sort, q});
        const decorated = movies.map(m => ({
            ...m,
            watchedYes: m.watched === 1,
            watchedNo: m.watched === 0,
            hasPoster: !!(m.poster_url && m.poster_url.trim()),
            hasReview: !!(m.review && m.review.trim()),
        }));
        return renderHome(res, {
            movies: decorated,
            errors,
            mode: "add",
            form: data,
            filter,
            sort,
            q,
        });
    }

    await model.addMovie(data);
    res.redirect(`/?filter=${encodeURIComponent(filter)}&sort=${encodeURIComponent(sort)}&q=${encodeURIComponent(q)}`);
});

// Action 6: update movie
app.post("/edit/:id", async (req, res) => {
    const id = Number(req.params.id);
    const data = normalizeMovieForm(req.body);
    const errors = validateMovie(data);

    const filter = req.body.filter || "";
    const sort = req.body.sort || "newest";
    const q = req.body.q || "";

    if (errors.length){
        const movies = await model.listMovies({filter, sort, q});
        const decorated = movies.map(m => ({
            ...m,
            watchedYes: m.watched === 1,
            watchedNo: m.watched === 0,
            hasPoster: !!(m.poster_url && m.poster_url.trim()),
            hasReview: !!(m.review && m.review.trim()),
        }));

        return renderHome(res, {
            movies: decorated,
            errors,
            mode: "edit",
            editMovieId: id,
            form: {...data, id},
            filter,
            sort,
            q,
        });
    }

    await model.updateMovie(id, data);
    res.redirect(`/?filter=${encodeURIComponent(filter)}&sort=${encodeURIComponent(sort)}&q=${encodeURIComponent(q)}`);
});

// Action 7: toggle watched

// Action 8: delete movie
app.post("/delete/:id", async (req, res) =>{
    const id = Number(req.params.id);
    await model.deleteMovie(id);

    const filter = req.body.filter || "all";
    const sort = req.body.sort || "newest";
    const q = req.body.q || "";

    res.redirect(`/?filter=${encodeURIComponent(filter)}&sort=${encodeURIComponent(sort)}&q=${encodeURIComponent(q)}`);
});

(async () => {
    try{
        await model.init();
        app.listen(PORT, () => {
            console.log(`Movie Tracker running at http://localhost:${PORT}`);
        });
    } catch (err){
        console.error("Startup Failed: ", err);
        process.exit(1);
    }
})();