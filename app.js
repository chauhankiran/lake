const express = require("express");
const morgan = require("morgan");
const app = express();

app.set("view engine", "ejs");

app.use(morgan("tiny"));

// home.
app.get("/", async (req, res, next) => {
  res.render("home");
});

// dashboard.
app.get("/dashboard", async (req, res, next) => {
  res.render("dashboard");
});

// projects.
app.get("/projects", async (req, res, next) => {
  res.render("projects");
});

// add project.
app.get("/projects/new", async (req, res, next) => {
  res.render("new-project");
});

// show project.
app.get("/projects/:id", async (req, res, next) => {
  res.render("show-project");
});

// edit project.
app.get("/projects/:id/edit", async (req, res, next) => {
  res.render("edit-project");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Application is up and running on port ${PORT}`);
});
