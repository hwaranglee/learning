const express = require("express");
const bodyParser = require("body-parser");

const utils = require("./utils");
let db = require("./db");

const accountRouter = require("./apis/account");
const { strings } = require("./constants");

// settings
const app = express();
const port = 3000;

// global middlewares
app.use(bodyParser.json());

// listen
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// apis
// ? / account
app.use("/account", accountRouter);

// ! 404
app.use((req, res, next) => {
  res.status(404).send("404 NOT FOUND");
});

// ! 500
app.use((error, req, res, next) => {
  res.status(500).json({ response: strings.RESPONSE_ERROR, error });
});
