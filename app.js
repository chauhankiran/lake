"use strict";

require("dotenv").config();
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const favicon = require("serve-favicon");
const morgan = require("morgan");
const helmet = require("helmet");
const cookie = require("cookie-parser");
const session = require("express-session");
const flash = require("express-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const methodOverride = require("method-override");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const {
  sequelize,
  Project,
  Issue,
  Comment,
  Type,
  Priority,
  Status,
  ProjectMember,
  User,
} = require("./models");
const app = express();

app.set("view engine", "ejs");

app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(morgan("tiny"));
app.use(helmet());
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
app.use(flash());

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
    res.locals.userType = req.user.type;
  } else {
    res.locals.userId = null;
  }
  next();
});

// login.
app.get("/login", async (req, res, next) => {
  res.render("login", { page: "login" });
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
  res.render("register", { page: "register" });
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
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      type: "user",
      password: passwordHash,
    });

    res.redirect("/login");
  } catch (err) {
    next(err);
  }
});

// home.
app.get("/", async (req, res, next) => {
  res.render("home", { page: "" });
});

// dashboard.
app.get("/dashboard", auth, async (req, res, next) => {
  try {
    const assignedIssues = await Issue.findAll({
      where: { assigneeId: req.user?.id },
    });

    res.render("dashboard", { page: "dashboard", assignedIssues });
  } catch (err) {
    next(err);
  }
});

// projects.
app.get("/projects", auth, async (req, res, next) => {
  const user = await User.findByPk(req.user?.id);
  const projects = await user.getProjects();
  const count = await user.countProjects();

  res.render("projects", {
    projects: projects,
    count,
    page: "projects",
  });
});

// new project.
app.get("/projects/new", auth, async (req, res, next) => {
  res.render("new-project", { page: "new-project" });
});

// show project.
app.get("/projects/:id", auth, async (req, res, next) => {
  const id = req.params.id;

  try {
    const project = await Project.findOne({ where: { id } });
    const members = await project.getUsers();
    const membersCount = await project.countUsers();

    // Get the status of the issues.
    const issues = await Issue.findAndCountAll({ where: { projectId: id } });

    if (project) {
      res.render("show-project", {
        project,
        members,
        membersCount,
        issues: issues.rows,
        issuesCount: issues.count,
        error: "",
        page: "show-project",
      });
    } else {
      res.render("show-project", {
        page: "show-project",
        project: {},
        members: [],
        membersCount: 0,
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
    res.render("edit-project", { project, page: "edit-project" });
  } catch (err) {
    next(err);
  }
});

// create project.
app.post("/projects", auth, async (req, res, next) => {
  const { name, key, completionDate, description } = req.body;

  try {
    // Create project.
    const projectObj = {
      name: name.trim(),
      key: key.trim(),
      description: description.trim(),
      userId: req.user.id,
    };

    if (completionDate) {
      projectObj.completionDate = new Date(completionDate);
    }

    const project = await Project.create(projectObj, { silent: true });

    // Add created user as project member.
    await ProjectMember.create(
      {
        projectId: project.id,
        userId: req.user.id,
        createdBy: req.user.id,
      },
      { silent: true }
    );

    req.flash("info", "Project is created");
    res.redirect(`/projects/${project.id}`);
  } catch (err) {
    next(err);
  }
});

// update project.
app.put("/projects/:id", auth, async (req, res, next) => {
  const id = req.params.id;
  const { name, key, completionDate, description } = req.body;

  try {
    const project = await Project.findOne({ where: { id } });

    project.name = name.trim();
    project.key = key.trim();
    project.completionDate = new Date(completionDate);
    project.description = description.trim();
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

app.post("/projects/:id/add-member", auth, async (req, res, next) => {
  const id = req.params.id;
  const { userId } = req.body;

  try {
    // TODO: Add validation to not add same user again.
    await ProjectMember.create(
      {
        projectId: id,
        userId,
        createdBy: req.user.id,
      },
      { silent: true }
    );

    req.flash("info", "Member is added");
    res.redirect(`/projects/${id}`);
  } catch (err) {
    next(err);
  }
});

// issues.
app.get("/issues", auth, async (req, res, next) => {
  try {
    const issues = await Issue.findAndCountAll();
    res.render("issues", {
      issues: issues.rows,
      count: issues.count,
      page: "issues",
    });
  } catch (err) {
    next(err);
  }
});

// new issue.
app.get("/issues/new", auth, async (req, res, next) => {
  // Get list of all projects to display as dropdown.
  try {
    const user = await User.findByPk(req.user?.id);
    const projects = await user.getProjects();
    const types = await Type.findAll();
    const priorities = await Priority.findAll();
    const statuses = await Status.findAll();

    // TODO: Update the following query to only fetch the users based on project selection.
    const users = await User.findAll();

    res.render("new-issue", {
      projects,
      types,
      priorities,
      statuses,
      users,
      page: "new-issue",
    });
  } catch (err) {
    next(err);
  }
});

// show issue.
app.get("/issues/:id", auth, async (req, res, next) => {
  const id = req.params.id;

  try {
    const issue = await Issue.findOne({
      where: { id },
      include: [
        {
          model: Type,
          as: "type",
        },
        {
          model: Priority,
          as: "priority",
        },
        {
          model: Status,
          as: "status",
        },
        {
          model: User,
          as: "assignee",
        },
      ],
    });
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
        page: "show-issue",
        comments,
        error: "",
      });
    } else {
      res.render("show-issue", {
        issue: {},
        page: "show-issue",
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
    const user = await User.findByPk(req.user?.id);
    const projects = await user.getProjects();
    const types = await Type.findAll();
    const priorities = await Priority.findAll();
    const statuses = await Status.findAll();
    const issue = await Issue.findOne({ where: { id } });

    // TODO: Update the following query to only fetch the users based on project selection.
    const users = await User.findAll();

    res.render("edit-issue", {
      issue,
      projects,
      types,
      priorities,
      statuses,
      users,
      page: "edit-project",
    });
  } catch (err) {
    next(err);
  }
});

// create issue.
app.post("/issues", auth, async (req, res, next) => {
  const {
    projectId,
    title,
    description,
    typeId,
    priorityId,
    assigneeId,
    statusId,
    dueDate,
    estimation,
  } = req.body;

  try {
    // Create issue
    const issueObj = {
      projectId: parseInt(projectId, 10),
      title: title.trim(),
      description: description.trim(),
      typeId: parseInt(typeId, 10),
      priorityId: parseInt(priorityId, 10),
      userId: req.user.id,
      assigneeId: parseInt(assigneeId, 10),
      statusId: parseInt(statusId, 10),
      estimation: parseInt(estimation, 10),
    };

    if (dueDate) {
      issueObj.dueDate = new Date(dueDate);
    }

    const issue = await Issue.create(issueObj, { silent: true });

    req.flash("info", "Issue is created");
    res.redirect(`/issues/${issue.id}`);
  } catch (err) {
    next(err);
  }
});

// update issue.
app.put("/issues/:id", auth, async (req, res, next) => {
  const id = req.params.id;
  const {
    projectId,
    title,
    description,
    typeId,
    priorityId,
    assigneeId,
    statusId,
    dueDate,
    estimation,
  } = req.body;

  try {
    const issue = await Issue.findOne({ where: { id } });

    issue.projectId = parseInt(projectId, 10);
    issue.title = title.trim();
    issue.description = description.trim();
    issue.typeId = parseInt(typeId, 10);
    issue.priorityId = parseInt(priorityId, 10);
    issue.assigneeId = parseInt(assigneeId, 10);
    issue.statusId = parseInt(statusId, 10);
    issue.estimation = parseInt(estimation, 10);
    issue.userId = req.user.id;
    issue.updatedAt = sequelize.fn("NOW");

    if (dueDate) {
      issue.dueDate = new Date(dueDate);
    }

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
        content: content.trim(),
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

// get settings.
app.get("/settings", auth, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user?.id } });
    res.render("settings", { page: "settings", user });
  } catch (err) {
    next(err);
  }
});

// update settings.
app.post("/settings", auth, async (req, res, next) => {
  const { firstName, lastName } = req.body;

  try {
    const user = await User.findOne({ where: { id: req.user?.id } });

    user.firstName = firstName;
    user.lastName = lastName;

    await user.save();

    req.flash("info", "Settings are updated.");
    res.redirect("/settings");
  } catch (err) {
    next(err);
  }
});

app.get("/admin/users", auth, async (req, res, next) => {
  try {
    const users = await User.findAndCountAll();

    res.render("users", {
      page: "admin",
      count: users.count,
      users: users.rows,
    });
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
