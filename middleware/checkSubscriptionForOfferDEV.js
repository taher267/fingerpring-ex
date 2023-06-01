const { isValidObjectId, Types } = require("mongoose");
const Deal = require("../models/Deal");
const domainRoute = require("../utils/domainRoute");
const moment = require("moment");
const { ALLOW_TRAIL } = require("../config");

module.exports = async (req, res, next) => {
  try {
    const { url: searchUrl, timeZone, pd_id: pd_id2 } = req.query;

    const pd_id = searchUrl?.split?.("pd_id=")?.[1];
    const origin = req.headers.origin;

    const match = {};
    if ((!searchUrl && !pd_id) || (pd_id && !isValidObjectId(pd_id))) {
      return res.sendStatus(304);
    }
    let isRoute, url;
    if (pd_id) {
      match._id = Types.ObjectId(pd_id);
    } else {
      let { route, url: url2 } = domainRoute(searchUrl);
      isRoute = route;
      url = url2;
      match.url = url2;
    }
    // console.log(req.query, "req.qurey");
    console.log(match, "match");
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
      if (ALLOW_TRAIL === "true" && !credit) credit = 1;
      if (!expire && ALLOW_TRAIL === "true") {
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
