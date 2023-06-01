const { isValidObjectId, Types } = require("mongoose");
const Deal = require("../models/Deal");
const domainRoute = require("../utils/domainRoute");
const moment = require("moment");
const { ALLOW_TRAIL } = require("../config");
const uid = `645cb11c386c6aaba297edd4`;
const url = `https://panzabi.com`;
// const url = `https://drk2.dcms.site`;

const call = () =>
  Deal.aggregate([
    {
      $match: { url },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "subscriptions",
        localField: "userId",
        foreignField: "userId",
        as: "subs",
      },
    },
    // { $unwind: '$subs' },
    {
      $project: {
        routes: 1,
        dealTypeIds: 1,
        type: "$subs.type",
        credit: "$subs.credit",
        visitors: "$subs.visitors",
        expire: "$subs.expire",
        email: "$user.email",
        createdAt: "$user.createdAt",
      },
    },
  ])
    .then((d) => {
      const [
        { credit: dbCredit, expire: dbExpire, visitors: dbVisitors, createdAt },
      ] = d;
      let credit = 0,
        visitors = 0;
      const expire = dbExpire?.length
        ? dbExpire?.sort((a, b) => b - a)?.[0]
        : ALLOW_TRAIL
          ? moment(createdAt).add(7, "days")
          : moment(createdAt).add(-1, "day");
      for (const idx in dbExpire || []) {
        const ex = dbExpire[idx];
        if (ex > Date.now()) {
          credit += dbCredit[idx] || 0;
          visitors += dbVisitors[idx] || 0;
        }
      }
      console.log(credit, visitors, expire);
    })
    .catch((e) => {
      console.log(e);
    });

// call();
// Deal.findOne({ userId: uid }).then(console.log).catch(console.error);
module.exports = async (req, res, next) => {
  try {
    let origin = req.headers.origin;
    const NODE_ENV = process.env.NODE_ENV;
    if (NODE_ENV === "development") {
      // origin = "https://drk2.dcms.site";
    }

    const { url: searchUrl, timeZone, pd_id: pd_id2 } = req.query;
    if (NODE_ENV !== "development") {
      if (!origin || !timeZone) {
        return res.json({});
      }
    }

    const pd_id = searchUrl?.split?.("pd_id=")?.[1];

    const match = {};
    let isLocalhost =
      origin?.includes("://localhost:") || origin?.includes("://127.0.0.1:");

    if ((!pd_id && isLocalhost) || (pd_id && !isValidObjectId(pd_id))) {
      return res.sendStatus(304);
    }
    let isRoute, url;
    if (pd_id) {
      match._id = Types.ObjectId(pd_id);
    } else if (!isLocalhost) {
      let { route, url: url2 } = domainRoute(searchUrl);
      isRoute = route;
      url = origin;
      match.url = origin;
      console.log("url2", url2);
    }
    // console.log(req.query, "req.qurey");
    const deal = await Deal.aggregate([
      {
        $match: match,
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "subscriptions",
          localField: "userId",
          foreignField: "userId",
          as: "subs",
        },
      },
      // { $unwind: '$subs' },

      {
        $project: {
          routes: 1,
          dealTypeIds: 1,
          type: "$subs.type",
          credit: "$subs.credit",
          expire: "$subs.expire",
          email: "$user.email",
          createdAt: "$user.createdAt",
        },
      },
    ]);
    const data = deal[0];
    if (data) {
      let { expire, type, credit, createdAt, routes, ...rest } = data;
      let checkRoute = routes?.length
        ? routes.includes(`/${isRoute}`) || routes.includes(isRoute)
        : true;
      if (!checkRoute) {
        return res.sendStatus(200);
      }
      type = type?.length ? type[0] : "";
      credit = credit?.length ? credit[0] : 0;
      expire = expire?.expire?.[0];
      if (ALLOW_TRAIL === true && !credit) credit = 1;
      if (!expire && ALLOW_TRAIL === true) {
        expire = moment(createdAt).add(7, "days")?.utc?.();
      }
      if (!expire || moment().valueOf() > moment(expire).valueOf()) {
        console.log(`account expiry end`);
        return res.sendStatus(200);
      }

      let obj = {
        url,
        type,
        credit,
        expire,
        routes,
        createdAt,
        ...rest,
      };
      req.user = obj;
      return next();
      // if(isLocalhost){}
    } else {
      res.sendStatus(200);
    }
  } catch (e) {
    let status = e?.status || 500;
    return res.status(status).json({
      success: false,
      errors: {
        common: e?.message || `Something Went Wrong`,
      },
    });
  }
};
