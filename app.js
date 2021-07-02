const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const accountRouter = require("./apis/account");
const { strings } = require("./constants");

// ? settings
const app = express();
const port = 3000;
let corsOption = {
  origin: 'http://localhost:5000',
  credentials: true,
};


// ? global middlewares
app.use(cors(corsOption));
app.use(bodyParser.json());

// ? listen
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// ? apis
// ? / account
app.use("/account", accountRouter);

// ! 404
app.use((req, res, next) => {
  res.status(404).send("404 NOT FOUND");
});

// ! 500
app.use((error, req, res, next) => {
  res.status(500).json({ response: strings.RESPONSE_ERROR, error, is: "?" });
});
