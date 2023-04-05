const express = require("express");
const morgan = require("morgan");
const app = express();

app.use(morgan("tiny"));

app.get("/", async (req, res, next) => {
  res.send("home");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Application is up and running on port ${PORT}`);
});
