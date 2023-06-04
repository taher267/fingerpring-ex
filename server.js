var geoip = require('geoip-lite');
const express = require("express");
const cors = require("cors");
const Fingerprint = require("express-fingerprint");
const app = express();


// var ip = "15.165.248.236";
// var geo = geoip.lookup(ip);

// console.log(geo);
const fingerp = Fingerprint({
  parameters: [
    // Defaults
    Fingerprint.useragent,
    Fingerprint.acceptHeaders,
    Fingerprint.geoip,

    // Additional parameters
    function (next) {
      // ...do something...
      next(null, {
        param1: "value1",
      });
    },
    function (next) {
      // ...do something...
      next(null, {
        param2: "value2",
      });
    },
  ],
});

const middlwares = [
  fingerp,
  cors(),
  express.urlencoded({ extended: true }),
  express.json({ limit: "10mb" }),
];

app.use(middlwares);

app.use("/api/v1", require("./routes"));

app.get("/", async (req, res) => {
  try {
    const xforwarded = req.headers["x-forwarded-for"];
    const remoteAddress = req?.connection?.remoteAddress;
    const socketRepore = req.socket?.remoteAddress;
    const connection = req?.connection?.socket?.remoteAddress;
    const ip = req.ip
    res.send({
      runningOn: process.env.NODE_ENV,
      xforwarded,
      remoteAddress,
      socketRepore,
      connection,
      ip,
    });
  } catch (e) {
    res.send({ e: e });
  }
});
app.get('/fingerprint', function (req, res) {
  res.json(req.fingerprint)
})
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`DEV SERVER IS RUNNING ON PORT: ${PORT} ❤️`);
  console.log("DB CONNECTED");
});

module.exports = () => { };
