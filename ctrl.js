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

// 8 Actions - 8 Routes
// Action 1/2/3: List + filter + sort

// Action 4: show edit form

// Action 5: create movie

// Action 6: update movie

// Action 7: toggle watched

// Action 8: delete movie

(async () => {
    //await model.init();
    app.listen(PORT, () => {
        console.log(`Movie Tracker running at http://localhost:${PORT}`);
    });
})();