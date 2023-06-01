const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
// MIDDLEWARES
const middlwares = [
  express.urlencoded({ extended: true }),
  express.json({ limit: "10mb" }),
];

app.use(middlwares);

app.use("/", require("./routes"));

module.exports = () => { };
