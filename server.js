const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());

const middlwares = [
  express.urlencoded({ extended: true }),
  express.json({ limit: "10mb" }),
];

app.use(middlwares);

app.use("/api/v1", require("./routes"));

app.get("/", async (req, res) => {
  try {
    res.send({
      runningOn: process.env.NODE_ENV,
    });
  } catch (e) {
    res.send({ e: e });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`DEV SERVER IS RUNNING ON PORT: ${PORT} ❤️`);
  console.log("DB CONNECTED");
});

module.exports = () => { };
