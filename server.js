// ALL REQUIRES STARTS
const path = require("path");
require("dotenv").config();
// require("dotenv").config({ path: path.resolve(__dirname, "dev/.env") });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fileUpload = require("express-fileupload");
[];
const { ALLOW_TRAIL } = require("./config");
// const axios = require("axios");
// const { createPayment } = require("./controllers/stripeController");
// CREATING APP
const app = express();
app.use(cors());
// app.set('trust proxy', true);

// let whitelist = [
//   "https://dev-parityboss-server.vercel.app",
//   "https://paritybox-server.vercel.app",
// ];
// const devOrigins = ["http://localhost:3000", "http://localhost:5173"];
// app.use(
//   cors({
//     origin: function (origin, callback, ...rest) {
//       console.log(rest);
//       if (process.env.NODE_ENV === "development") {
//         whitelist = whitelist.concat(devOrigins);
//       }
//       if (whitelist.indexOf(origin) !== -1) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },

//   })
// );
// {
//     origin: '*',
//   }
// DECLARING PORT
const PORT = process.env.PORT || 5000;

// MONGODB URI
const mongoDBURI = process.env.MONGODB_STR;
// const mongoDBURI = process.env.MONGODB_STR_DEV;

// if (process.env.NODE_ENV === 'development') {
//   app.use(require('morgan')('dev'));
// }
/**
 * @route baseurl/api/v1/webhook/stripe
 * @route dev https://dev-parityboss-server.vercel.app/api/v1/webhook/stripe
 */
app.use(
  "/api/v1/webhook/stripe",
  express.raw({ type: "application/json" }),
  require("./controllers/stripeController").stripeWebHook
);
// MIDDLEWARES
const middlwares = [
  express.urlencoded({ extended: true }),
  express.json({ limit: "10mb" }),
  fileUpload(),
];

if (process.env.NODE_ENV === "development") {
  app.use(require("morgan")("dev"));
}

app.use(middlwares);

app.use("/api/v1", require("./routes"));
// ROOT API
// app.get("/ip-address", async (req, res) => {
//   try {
//     const ip = require("ip");
//     res.json({
//       ip: ip.address(),
//       "x-forwarded-for": req?.header?.["x-forwarded-for"],
//       ipAddress: req?.headers?.["x-forwarded-for"],
//     });
//   } catch (e) {
//     res.json(e?.response?.data);
//   }
// });

// app.get("/ip-details", async (req, res) => {
//   try {
//     const ip = req?.headers?.["x-forwarded-for"];
//     const { data } = await axios(`http://ip-api.com/json/${ip}`);
//     res.json({
//       data,
//     });
//     axios;
//   } catch (e) {
//     res.json(e?.response?.data);
//   }
// });

app.get("/", async (req, res) => {
  try {
    const str = mongoDBURI?.replace?.("mongodb+srv://", "")?.split?.("/")?.[1];
    res.send({
      mail: process.env.ALLOW_PAYMENT_MAIL,
      trail: ALLOW_TRAIL,
      runningOn: process.env.NODE_ENV,
      str,
    });
  } catch (e) {
    res.send({ e: e });
  }
});

app.use((err, _, res, __) => {
  const status = err?.status || 500;
  const message = err?.message || `Server error occered!`;
  return res.status(status).json({ message });
});
mongoose
  .connect(mongoDBURI, { useNewUrlParser: true })
  .then(() => {
    // createPayment("64605628a6b4c4b7f4a7acfe");
    if (process.env.NODE_ENV === "development") {
      app.listen(PORT, () => {
        console.log(`DEV SERVER IS RUNNING ON PORT: ${PORT} ❤️`);
        console.log("DB CONNECTED");
      });
    } else {
      app.listen();
      require("./cron")();
    }
  })
  .catch((err) => {
    console.log(`SERVER ERROR: ${err}`);
  });

module.exports = () => { };
