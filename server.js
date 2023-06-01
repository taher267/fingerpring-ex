const express = require("express");
const cors = require("cors");
const Fingerprint = require("express-fingerprint");
const app = express();
// const fingerp = Fingerprint({
//   parameters: [
//     // Defaults
//     Fingerprint.useragent,
//     Fingerprint.acceptHeaders,
//     Fingerprint.geoip,

//     // Additional parameters
//     function (next) {
//       // ...do something...
//       next(null, {
//         param1: "value1",
//       });
//     },
//     function (next) {
//       // ...do something...
//       next(null, {
//         param2: "value2",
//       });
//     },
//   ],
// });

const middlwares = [
  cors(),
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
