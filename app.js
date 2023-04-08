const express = require("express");
const morgan = require("morgan");
const methodOverride = require("method-override");
const { sequelize, Project } = require("./models");
const app = express();

app.set("view engine", "ejs");

app.use(morgan("tiny"));
app.use(methodOverride("_method"));
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));

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
  const projects = await Project.findAndCountAll();
  res.render("projects", { projects: projects.rows, count: projects.count });
});

// new project.
app.get("/projects/new", async (req, res, next) => {
  res.render("new-project");
});

// show project.
app.get("/projects/:id", async (req, res, next) => {
  const id = req.params.id;

  try {
    const project = await Project.findOne({ where: { id } });
    res.render("show-project", { project });
  } catch (err) {
    next(err);
  }
});

// edit project.
app.get("/projects/:id/edit", async (req, res, next) => {
  const id = req.params.id;

  try {
    const project = await Project.findOne({ where: { id } });
    res.render("edit-project", { project });
  } catch (err) {
    next(err);
  }
});

// create project.
app.post("/projects", async (req, res, next) => {
  const { name, key, description } = req.body;

  try {
    const project = await Project.create({
      name,
      key,
      description,
    });

    res.redirect(`/projects/${project.id}`);
  } catch (err) {
    next(err);
  }
});

// update project.
app.put("/projects/:id", async (req, res, next) => {
  const id = req.params.id;
  const { name, key, description } = req.body;

  try {
    const project = await Project.findOne({ where: { id } });

    project.name = name;
    project.key = key;
    project.description = description;

    await project.save();

    res.redirect(`/projects/${id}`);
  } catch (err) {
    next(err);
  }
});

// delete project.
app.delete("/projects/:id", async (req, res, next) => {
  const id = req.params.id;

  try {
    const project = await Project.findOne({ where: { id } });

    await project.destroy();

    res.redirect(`/projects`);
  } catch (err) {
    next(err);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log(`Application is up and running on port ${PORT}`);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
});
