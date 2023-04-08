const express = require("express");
const morgan = require("morgan");
const methodOverride = require("method-override");
const { sequelize, Project, Issue } = require("./models");
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

// issues.
app.get("/issues", async (req, res, next) => {
  try {
    const issues = await Issue.findAndCountAll();
    res.render("issues", { issues: issues.rows, count: issues.count });
  } catch (err) {
    next(err);
  }
});

// new issue.
app.get("/issues/new", async (req, res, next) => {
  res.render("new-issue");
});

// show issue.
app.get("/issues/:id", async (req, res, next) => {
  const id = req.params.id;

  try {
    const issue = await Issue.findOne({ where: { id } });
    res.render("show-issue", { issue });
  } catch (err) {
    next(err);
  }
});

// edit issue.
app.get("/issues/:id/edit", async (req, res, next) => {
  const id = req.params.id;

  try {
    const issue = await Issue.findOne({ where: { id } });
    res.render("edit-issue", { issue });
  } catch (err) {
    next(err);
  }
});

// create issue.
app.post("/issues", async (req, res, next) => {
  const { projectId, title, description } = req.body;

  try {
    const issue = await Issue.create({
      projectId,
      title,
      description,
    });

    res.redirect(`/issues/${issue.id}`);
  } catch (err) {
    next(err);
  }
});

// update issue.
app.put("/issues/:id", async (req, res, next) => {
  const id = req.params.id;
  const { projectId, title, description } = req.body;

  try {
    const issue = await Issue.findOne({ where: { id } });

    issue.projectId = projectId;
    issue.title = title;
    issue.description = description;

    await issue.save();

    res.redirect(`/issues/${issue.id}`);
  } catch (err) {
    next(err);
  }
});

// delete issue.
app.delete("/issues/:id", async (req, res, next) => {
  const id = req.params.id;

  try {
    const issue = await Issue.findOne({ where: { id } });
    await issue.destroy();

    res.redirect(`/issues`);
  } catch (err) {
    next(err);
  }
});

// 404.
app.all("*", (req, res, next) => {
  res.status(404).send("4-0-4");
});

// error handler.
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("Internal server error");
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
