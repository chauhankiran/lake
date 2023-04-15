require("dotenv").config();
const crypto = require("crypto");
const express = require("express");
const morgan = require("morgan");
const cookie = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const methodOverride = require("method-override");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const { sequelize, Project, Issue, Comment, User } = require("./models");
const app = express();

app.set("view engine", "ejs");

app.use(morgan("tiny"));
app.use(methodOverride("_method"));
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));

// Auth middleware
const auth = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send("Forbidden");
    return;
  }
};

const store = new SequelizeStore({ db: sequelize });

app.use(cookie(process.env.COOKIE));
app.use(
  session({
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
    saveUninitialized: true,
    resave: true,
    secret: process.env.SESSION,
    store,
  })
);

// store.sync();

app.use(passport.initialize());
app.use(passport.session());

// passport config.
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      const passwordHash = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");

      try {
        const user = await User.findOne({
          where: { email, password: passwordHash },
        });
        if (user) {
          done(null, user);
        } else {
          done(null, false);
        }
      } catch (err) {
        done(null, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findOne({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
    return;
  }
});

app.use((req, res, next) => {
  if (req.user) {
    res.locals.userId = req.user.id;
  } else {
    res.locals.userId = null;
  }
  next();
});

// login.
app.get("/login", async (req, res, next) => {
  res.render("login");
});

// login.
app.post("/login", async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return;
    }

    if (!user) {
      return;
    }

    req.logIn(user, async (err) => {
      if (err) {
        return;
      }
      res.redirect("/dashboard");
      return;
    });
  })(req, res, next);
});

// register.
app.get("/register", async (req, res, next) => {
  res.render("register");
});

// register.
app.post("/register", async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  const passwordHash = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  try {
    await User.create({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });

    res.redirect("/login");
  } catch (err) {
    next(err);
  }
});

// home.
app.get("/", async (req, res, next) => {
  res.render("home");
});

// dashboard.
app.get("/dashboard", auth, async (req, res, next) => {
  res.render("dashboard");
});

// projects.
app.get("/projects", auth, async (req, res, next) => {
  const projects = await Project.findAndCountAll({
    include: [
      {
        model: User,
        as: "user",
      },
    ],
  });
  res.render("projects", { projects: projects.rows, count: projects.count });
});

// new project.
app.get("/projects/new", auth, async (req, res, next) => {
  res.render("new-project");
});

// show project.
app.get("/projects/:id", auth, async (req, res, next) => {
  const id = req.params.id;

  try {
    const project = await Project.findOne({ where: { id } });
    if (project) {
      res.render("show-project", { project, error: "" });
    } else {
      res.render("show-project", {
        project: {},
        error:
          "Either project doesn't exist or you don't have rights to access",
      });
    }
  } catch (err) {
    next(err);
  }
});

// edit project.
app.get("/projects/:id/edit", auth, async (req, res, next) => {
  const id = req.params.id;

  try {
    const project = await Project.findOne({ where: { id } });
    res.render("edit-project", { project });
  } catch (err) {
    next(err);
  }
});

// create project.
app.post("/projects", auth, async (req, res, next) => {
  const { name, key, description } = req.body;

  try {
    const project = await Project.create(
      {
        name,
        key,
        description,
        userId: req.user.id,
      },
      { silent: true }
    );

    res.redirect(`/projects/${project.id}`);
  } catch (err) {
    next(err);
  }
});

// update project.
app.put("/projects/:id", auth, async (req, res, next) => {
  const id = req.params.id;
  const { name, key, description } = req.body;

  try {
    const project = await Project.findOne({ where: { id } });

    project.name = name;
    project.key = key;
    project.description = description;
    project.userId = req.user.id;
    project.updatedAt = sequelize.fn("NOW");

    await project.save();

    res.redirect(`/projects/${id}`);
  } catch (err) {
    next(err);
  }
});

// delete project.
app.delete("/projects/:id", auth, async (req, res, next) => {
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
app.get("/issues", auth, async (req, res, next) => {
  try {
    const issues = await Issue.findAndCountAll();
    res.render("issues", { issues: issues.rows, count: issues.count });
  } catch (err) {
    next(err);
  }
});

// new issue.
app.get("/issues/new", auth, async (req, res, next) => {
  // Get list of all projects to display as dropdown.
  try {
    const projects = await Project.findAll();
    res.render("new-issue", { projects });
  } catch (err) {
    next(err);
  }
});

// show issue.
app.get("/issues/:id", auth, async (req, res, next) => {
  const id = req.params.id;

  try {
    const issue = await Issue.findOne({ where: { id } });
    const comments = await Comment.findAll({
      where: {
        issueId: id,
      },
      include: [
        {
          model: User,
          as: "user",
        },
      ],
    });

    if (issue) {
      res.render("show-issue", {
        issue,
        comments,
        error: "",
      });
    } else {
      res.render("show-issue", {
        issue: {},
        comments: {},
        error: "Either issue doesn't exist or you don't have rights to access",
      });
    }
  } catch (err) {
    next(err);
  }
});

// edit issue.
app.get("/issues/:id/edit", auth, async (req, res, next) => {
  const id = req.params.id;

  try {
    const projects = await Project.findAll();
    const issue = await Issue.findOne({ where: { id } });
    res.render("edit-issue", { issue, projects });
  } catch (err) {
    next(err);
  }
});

// create issue.
app.post("/issues", auth, async (req, res, next) => {
  const { projectId, title, description } = req.body;

  try {
    const issue = await Issue.create(
      {
        projectId: parseInt(projectId, 10),
        title,
        description,
        userId: req.user.id,
      },
      { silent: true }
    );

    res.redirect(`/issues/${issue.id}`);
  } catch (err) {
    next(err);
  }
});

// update issue.
app.put("/issues/:id", auth, async (req, res, next) => {
  const id = req.params.id;
  const { projectId, title, description } = req.body;

  try {
    const issue = await Issue.findOne({ where: { id } });

    issue.projectId = parseInt(projectId, 10);
    issue.title = title;
    issue.description = description;
    issue.userId = req.user.id;
    issue.updatedAt = sequelize.fn("NOW");

    await issue.save();

    res.redirect(`/issues/${issue.id}`);
  } catch (err) {
    next(err);
  }
});

// delete issue.
app.delete("/issues/:id", auth, async (req, res, next) => {
  const id = req.params.id;

  try {
    const issue = await Issue.findOne({ where: { id } });
    await issue.destroy();

    res.redirect(`/issues`);
  } catch (err) {
    next(err);
  }
});

// create comment.
app.post("/comments", auth, async (req, res, next) => {
  const { content, issueId } = req.body;

  try {
    await Comment.create(
      {
        content,
        issueId,
        userId: req.user.id,
      },
      { silent: true }
    );

    res.redirect(`/issues/${issueId}`);
  } catch (err) {
    next(err);
  }
});

// logout.
app.get("/logout", auth, async (req, res, next) => {
  req.logOut((err) => {
    next(err);
    return;
  });
  res.redirect("/");
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
