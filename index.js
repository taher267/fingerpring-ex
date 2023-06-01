const express = require("express");
const Fingerprint = require("express-fingerprint");
const cors = require("cors");

const app = express();
const finger = Fingerprint({
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
const middlewires = [
    cors(),
    finger,
    express.urlencoded({ extended: true }),
    express.json(),
];

app.use(middlewires);

app.get("*", function (req, res, next) {
    // Fingerprint object
    // console.log(req.fingerprint);
    res.json(req.fingerprint);
});
const PORT = 5000;
app.listen(PORT, () => console.log(`Alhamdu lillah, server is starting`));
