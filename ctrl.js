const express = require("express");
const mustacheExpress = require("mustache-express");
const model = require("./model");

const app = express();
const PORT = 3000;


// 8 Actions - 8 Routes
// Action 1/2/3: List + filter + sort

// Action 4: show edit form

// Action 5: create movie

// Action 6: update movie

// Action 7: toggle watched

// Action 8: delete movie

(async () => {
    await model.init();
    app.listen(PORT, () => {
        console.log(`Movie Tracker running at http://localhost:${PORT}`);
    });
})();