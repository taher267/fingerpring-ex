const Deal = require("../models/Deal");
const DealTypes = require("../models/DealTypes");
const HolidayTypeDeal = require("../models/HolidayTypeDeal");
const LocationTypeDeal = require("../models/LocationTypeDeal");
const Banner = require("../models/Banner");
const currency = require("iso-country-currency");
const falgs = require("country-flags-svg");
// const symble = require("currency-symbol-map");
// const { getCountryForTimezone } = require("countries-and-timezones");
const User = require("../models/User");
const { isValidObjectId, Types } = require("mongoose");
// const moment = require("moment");
// const { getByCountryCode } = require("../helpers/countries");
// const sendErrorEmail = require("../utils/sendErrorEmail");
const domainRoute = require("../utils/domainRoute");
const generateCoupon = require("../helpers/generateCoupon");
const axios = require("axios");
// const replacer = require("../utils/replacer");
const findOutLocationDiscount = require("../helpers/menual-deal/findOutLocationDiscount");
const findOutHolidayDiscount = require("../helpers/menual-deal/findOutHolidayDiscount");
const StripeConnect = require("../models/StripeConnect");
const createCouponAndPromo = require("../helpers/strie-connect/createCouponAndPromo");
const separationUpdateVariation = require("../helpers/strie-connect/separationUpdateVariation");
const idAndPercentageMapping = require("../helpers/strie-connect/idAndPercentageMapping");
const {
  deactivatePromo,
  createPromoOrCouponAndPromo,
  deactivatePromoFollowingDealTypes,
} = require("../helpers/strie-connect/CRUDcouponAndPromo");
const { allCoupons, updatePaymentLinks } = require("./stripeConnectController");

// const countriesArrs = require('../helpers/countries');
// for (const { code, ...rest } of countriesArrs) {
//   countriesObjs[code] = rest;
// }

// const findOutLocationDiscount = async (
//   LocationDeals = [],
//   timeZone = "",
//   bannarData,
//   credit
// ) => {
//   const { locationBannerText, enabledStyle, closeIcon, styling } = bannarData;
//   const code = getCountryForTimezone(timeZone)?.id;
//   let result = {};
//   const locationTypeDealGroup = getByCountryCode[code]?.group;
//   let filtering = LocationDeals.filter(
//     (item) =>
//       item.locationTypeDealGroup === locationTypeDealGroup &&
//       item.voucher &&
//       item.percentage
//   )?.[0];

//   if (filtering?.voucher && filtering?.percentage) {
//     let { voucher, percentage } = filtering;
//     const ct = currency.getAllInfoByISO(code);
//     const flag = falgs.findFlagUrlByIso2Code(ct.iso);
//     const nation = ct.countryName;
//     // let countryInfo = {
//     //   countryCode: ct.iso,
//     //   currencyCode: ct.currency,
//     //   nation,
//     //   currencySymbol: symble(ct.currency),
//     //   flag,
//     // };
//     const message = replacer(locationBannerText, {
//       nation,
//       flag,
//       voucher,
//       percentage,
//     });
//     const poweredBy =
//       credit > 1
//         ? ""
//         : `<a class='parity-banner-logo' href='https://parityboss.com' target='_blank' style='position: absolute;right: 100px;top: 50%;transform: translate3d(0, -50%, 0);color: inherit;opacity: 0.7;font-size: 11px;'>Parityboss</a>`;
//     const closeBtn = closeIcon
//       ? `<button type='button' class='parity-banner-close-btn' aria-label='Close'><svg viewBox='0 0 24 24' focusable='false' aria-hidden='true'><path fill='currentColor' d='M.439,21.44a1.5,1.5,0,0,0,2.122,2.121L11.823,14.3a.25.25,0,0,1,.354,0l9.262,9.263a1.5,1.5,0,1,0,2.122-2.121L14.3,12.177a.25.25,0,0,1,0-.354l9.263-9.262A1.5,1.5,0,0,0,21.439.44L12.177,9.7a.25.25,0,0,1-.354,0L2.561.44A1.5,1.5,0,0,0,.439,2.561L9.7,11.823a.25.25,0,0,1,0,.354Z'></path></svg></button>`
//       : "";
//     const styled = {
//       bar: {
//         fontColor: "#F9F9F9",
//         highlightFontColor: "#DD5C64",
//         placement: "top",
//       },
//     };
//     if (enabledStyle) {
//       styled.bar = {
//         ...bar,
//         ...styling,
//         placement: styling.bannerPosition,
//       };
//     }

//     result = {
//       // voucher,
//       // percentage,
//       // ...countryInfo,
//       // parity-banner-inner
//       ...styled,
//       message: `<div class='parity-banner parity-banner-has-logo'><div class='parity-banner-inner'>${message}</div>
//        ${closeBtn}${poweredBy}</div>`,
//       location: true,
//     };
//   }
//   // console.log(result);
//   return result;
// };
async function dealQry(match = {}) {
  try {
    let resp = await Deal.aggregate([
      {
        $match: match,

        // { userId: Types.ObjectId('63bfd64a0779a2fc72fa964d')}
      },
      {
        $lookup: {
          from: "dealtypes",
          localField: "dealTypeIds.location",
          foreignField: "_id",
          as: "DealsL",
        },
      },
      // { $unwind: '$DealsL' },
      {
        $lookup: {
          from: "locationtypedeals",
          localField: "DealsL._id",
          foreignField: "dealTypeId",
          as: "LocationDeals",
        },
      },
      //
      {
        $lookup: {
          from: "dealtypes",
          localField: "dealTypeIds.holiday",
          foreignField: "_id",
          as: "DealsH",
        },
      },
      // { $unwind: '$DealsH' },
      {
        $lookup: {
          from: "holidaytypedeals",
          localField: "DealsH._id",
          foreignField: "dealTypeId",
          as: "HolidayDeals",
        },
      },
      {
        $lookup: {
          from: "banners",
          localField: "_id",
          foreignField: "dealId",
          as: "Banner",
        },
      },
      { $unwind: "$Banner" },
      {
        $project: {
          _id: 1,
          name: 1,
          url: 1,
          routes: 1,
          LocationDeals: 1,
          HolidayDeals: 1,
          Banner: {
            closeIcon: `$Banner.closeIcon`,
            enabledStyle: `$Banner.enabledStyle`,
            styling: `$Banner.styling`,
            locationBannerText: `$Banner.locationBannerText`,
            holidayBannerText: `$Banner.holidayBannerText`,
          },
        },
      },
    ]);
    return resp;
  } catch (e) {
    const err = new Error(e?.message || `Something Went Wrong!`);
    err.status = e?.status || 500;
    throw err;
  }
}

function checkOnlyLocationsAndHoliday(match = {}) {
  return Deal.aggregate([
    {
      $match: match,
      // { userId: Types.ObjectId('63bfd64a0779a2fc72fa964d')}
    },
    {
      $lookup: {
        from: "dealtypes",
        localField: "dealTypeIds.location",
        foreignField: "_id",
        as: "DealsL",
      },
    },
    {
      $lookup: {
        from: "locationtypedeals",
        localField: "DealsL._id",
        foreignField: "dealTypeId",
        as: "LocationDeals",
      },
    },
    {
      $lookup: {
        from: "dealtypes",
        localField: "dealTypeIds.holiday",
        foreignField: "_id",
        as: "DealsH",
      },
    },
    {
      $lookup: {
        from: "holidaytypedeals",
        localField: "DealsH._id",
        foreignField: "dealTypeId",
        as: "HolidayDeals",
      },
    },

    {
      $project: {
        _id: 1,
        name: 1,
        url: 1,
        routes: 1,
        products: 1,
        LocationDeals: 1,
        HolidayDeals: 1,
      },
    },
  ]);
}
// checkOnlyLocationsAndHoliday({ _id: Types.ObjectId('6471c4d94a0415249e848a40') }).then(d => console.log(d[0])).catch(console.error);

const dealDiscount = async (req, res) => {
  const { url: searchUrl, timeZone } = req.query;

  const { credit } = req.user;
  const pd_id = searchUrl?.split?.("pd_id=")?.[1];
  let isLocalhost =
    searchUrl?.includes("://localhost:") ||
    searchUrl?.includes("://127.0.0.1:");
  if (!isLocalhost && credit > 1) {
    const ipAddress = req?.headers?.["x-forwarded-for"];
    axios
      .get(`http://ip-api.com/json/${ipAddress}`)
      .then(({ data }) => {
        if (data?.timezone !== timeZone) return res.json({});
      })
      .catch((e) => {
        return res.json({});
      });
  }

  if (pd_id && !isValidObjectId(pd_id)) return res.sendStatus(400);

  if (pd_id) {
    const deal = await dealQry({ _id: Types.ObjectId(pd_id) });
    // console.log(deal);
    if (deal?.length) {
      let { LocationDeals, HolidayDeals, Banner: bannarData } = deal[0];

      let myOffer = {};
      if (HolidayDeals?.length) {
        let resp = await findOutHolidayDiscount(
          HolidayDeals,
          bannarData,
          credit
        );
        if (resp?.holiday) return res.json(resp);
      }
      if (LocationDeals?.length && !myOffer?.holiday && timeZone) {
        let resp = await findOutLocationDiscount(
          LocationDeals,
          timeZone,
          bannarData,
          credit
        );
        // console.log('LocationDeals', timeZone);
        return res.json(resp);
      }
      return res.sendStatus(203);
    }
    return res.json({ message: `Nothing found by pd_id` });
  } else if (!isLocalhost) {
    // It should be not

    let { url, route } = domainRoute(searchUrl);

    const deal = await dealQry({
      url: url.endsWith("/") ? url.slice(0, -1) : url,
      // url: 'https://test-parityboss.netlify.app',
    });
    // console.log(deal);
    if (deal?.length) {
      let { routes, LocationDeals, HolidayDeals, Banner: bannarData } = deal[0];
      let checkRoute = routes?.length
        ? routes.includes(`/${route}`) || routes.includes(route)
        : true;
      // console.log(checkRoute, 'checkRoute');
      let offerWithRoute = {};
      if (HolidayDeals?.length && checkRoute) {
        let resp = await findOutHolidayDiscount(
          HolidayDeals,
          bannarData,
          credit
        );
        if (resp?.holiday) return res.json(resp);
      }
      if (
        !offerWithRoute?.holiday &&
        LocationDeals?.length &&
        timeZone &&
        checkRoute
      ) {
        let resp = await findOutLocationDiscount(
          LocationDeals,
          timeZone,
          bannarData,
          credit
        );
        return res.json(resp);
      }
      return res.json({});
    }
    // await sendErrorEmail('abutaher267@gmail.com', searchUrl);
    return res.json({});
  } else {
    res.json({});
  }
};
// const day = "2023-01-13";
// const day = "2023-01-13T12:00:00Z";
// const date = moment(day).utc().startOf("day").add(12, "hours").utc();
// console.log(date);

const createDeal = async (req, res) => {
  let createdLocationDealsIds = [],
    createdHolidayDealsIds = [],
    createdDealType,
    createdNewOffer,
    DEAL_TYPE_IDS = [];
  try {
    const {
      location_deal,
      holiday_deal,
      holidays,
      locations,
      routes,
      url,
      name,
      description,
      locationTexts,
      holidayTexts,
      locationBannerText,
      holidayBannerText,
      styling,
      closeIcon,
      enabledStyle,
    } = req.body;

    const user = req.user;

    // console.log(holidays);
    if (!holidays?.length && !locations?.length) {
      return res.status(400).json({
        message: `Invalid params datas!`,
      });
    }
    let dealTypeIds = {};
    const doesExistUrl = await Deal.findOne({ url }).exec();
    if (doesExistUrl)
      return res.status(400).json({ message: `Deal already exists!` });
    if (location_deal && locations?.length) {
      const dealType = await DealTypes.create(locationTexts);
      const idOne = dealType.id;
      DEAL_TYPE_IDS.push(idOne);
      dealTypeIds.location = idOne;
      createdDealType = idOne;
      const locationDealData = [];
      for (const { locationTypeDealGroup, percentage, voucher } of locations) {
        if (percentage) {
          locationDealData.push({
            locationTypeDealGroup,
            dealTypeId: dealType.id,
            percentage: parseInt(percentage) || 0,
            voucher: percentage && !voucher ? generateCoupon() : voucher,
          });
        }
      }
      // console.log(locationDealData);
      const createdLocation = await LocationTypeDeal.insertMany(
        locationDealData
      );
      createdLocationDealsIds = createdLocation.map(
        (item) => item.id || item._id
      );
      // response.locations = {
      //   dealType: dealType?._doc || {},
      //   locationTypeDeal: createdLocation,
      // };
    }
    if (holiday_deal && holidays?.length) {
      const dealType = await DealTypes.create(holidayTexts);
      const ID = dealType?.id;
      DEAL_TYPE_IDS.push(ID);
      const holidayDealData = [];
      dealTypeIds.holiday = ID;

      // console.log(holidays, '');
      for (const {
        day,
        title,
        startBefore,
        endAfter,
        percentage,
        voucher,
      } of holidays) {
        if (percentage) {
          const date = `${day}T12:00:00Z`;
          // const date = moment(day).utc().startOf("day").add(12, "hours");
          console.log(percentage, "percentage H");
          holidayDealData.push({
            dealTypeId: dealType.id,
            date,
            title,
            startBefore: parseInt(startBefore) || 0,
            endAfter: parseInt(endAfter) || 0,
            percentage: parseInt(percentage) || 0,
            voucher: percentage && !voucher ? generateCoupon() : voucher,
          });
        }
      }
      const created = await HolidayTypeDeal.insertMany(holidayDealData);
      createdHolidayDealsIds = created.map((item) => item.id || item._id);
    }
    let lastSplashLess = url.endsWith("/") ? url.slice(0, -1) : url;
    const newDealData = {
      name,
      userId: user?._id,
      description,
      dealTypeIds,
      url: lastSplashLess,
      routes,
    };
    const newOffer = new Deal(newDealData);
    const saved = await newOffer.save();
    createdNewOffer = newOffer.id;

    const newBannerObj = {
      locationBannerText,
      holidayBannerText,
      styling,
      closeIcon,
      enabledStyle,
      dealId: createdNewOffer,
    };
    await Banner.create(newBannerObj);
    res.status(201).json({ success: true });
  } catch (e) {
    if (createdLocationDealsIds?.length) {
      await LocationTypeDeal.deleteMany({ _id: createdLocationDealsIds });
    }
    if (createdHolidayDealsIds?.length) {
      await HolidayTypeDeal.deleteMany({ _id: createdHolidayDealsIds });
    }
    // if (createdDealType) {
    //   await DealTypes.deleteOne({ _id: createdDealType });
    // }
    if (createdNewOffer) {
      await Deal.deleteOne({ _id: createdNewOffer });
      // console.log(createdNewOffer, "createdNewOffer");
    }
    if (DEAL_TYPE_IDS?.length) {
      const del = await DealTypes.deleteMany({
        _id: {
          $in: DEAL_TYPE_IDS,
        },
      });
    }
    const status = e?.status || 500;
    res.status(status).json({
      message: e?.message || `Something Went Wrong!`,
    });
  }
};
const createStripeDeal = async (req, res) => {
  let createdLocationDealsIds = [],
    createdHolidayDealsIds = [],
    createdDealType,
    createdNewOffer,
    DEAL_TYPE_IDS = [],
    newBannerId;
  try {
    const {
      location_deal,
      holiday_deal,
      holidays,
      locations,
      routes,
      url,
      name,
      description,
      locationTexts,
      holidayTexts,
      locationBannerText,
      holidayBannerText,
      styling,
      closeIcon,
      enabledStyle,
      productIds,
      connect: stripeAccount,
    } = req.body;

    const user = req.user;
    if (!holidays?.length && !locations?.length) {
      return res.status(400).json({
        message: `Invalid params datas!`,
      });
    }
    let dealTypeIds = {};
    const doesExistUrl = await Deal.findOne({ url }).exec();
    if (doesExistUrl)
      return res.status(400).json({ message: `Deal already exists!` });
    if (location_deal && locations?.length) {
      const dealType = await DealTypes.create(locationTexts);
      const idOne = dealType.id;
      DEAL_TYPE_IDS.push(idOne);
      dealTypeIds.location = idOne;
      createdDealType = idOne;
      const locationDealData = [];
      for (const { locationTypeDealGroup, percentage, voucher } of locations) {
        if (percentage && percentage !== "0") {
          locationDealData.push({
            locationTypeDealGroup,
            dealTypeId: dealType.id,
            percentage: parseInt(percentage) || 0,
            voucher:
              percentage && !voucher
                ? generateCoupon({ append: "PB", type: "stripe" })
                : voucher,
          });
        }
      }

      if (locationDealData?.length) {
        const createdLocation = await LocationTypeDeal.insertMany(
          locationDealData
        );
        createdLocationDealsIds = createdLocation;
      }
      // response.locations = {
      //   dealType: dealType?._doc || {},
      //   locationTypeDeal: createdLocation,
      // };
    }
    if (holiday_deal && holidays?.length) {
      const dealType = await DealTypes.create(holidayTexts);
      const ID = dealType?.id;
      DEAL_TYPE_IDS.push(ID);
      const holidayDealData = [];
      dealTypeIds.holiday = ID;

      // console.log(holidays, '');
      for (const {
        day,
        title,
        startBefore,
        endAfter,
        percentage,
        voucher,
      } of holidays) {
        if (percentage && percentage !== "0") {
          const date = `${day}T12:00:00Z`;
          // const date = moment(day).utc().startOf("day").add(12, "hours");
          holidayDealData.push({
            dealTypeId: dealType.id,
            date,
            title,
            startBefore: parseInt(startBefore) || 0,
            endAfter: parseInt(endAfter) || 0,
            percentage: parseInt(percentage) || 0,
            voucher:
              percentage && !voucher
                ? generateCoupon({ append: "PB", type: "stripe" })
                : voucher,
          });
        }
      }
      if (holidayDealData?.length) {
        const created = await HolidayTypeDeal.insertMany(holidayDealData);
        createdHolidayDealsIds = created;
      }
      // createdHolidayDealsIds = created.map((item) => item.id || item._id);
    }
    let lastSplashLess = url.endsWith("/") ? url.slice(0, -1) : url;
    const newDealData = {
      name,
      userId: user?._id,
      description,
      dealTypeIds,
      url: lastSplashLess,
      routes,
      stripeAccount,
      products: productIds,
    };
    const newOffer = new Deal(newDealData);
    const saved = await newOffer.save();
    createdNewOffer = newOffer.id;
    const newBannerObj = {
      locationBannerText,
      holidayBannerText,
      styling,
      closeIcon,
      enabledStyle,
      dealId: createdNewOffer,
    };
    const newBanner = await Banner.create(newBannerObj);
    newBannerId = newBanner.id;
    await StripeConnect.updateOne(
      { stripeAccount },
      {
        isUsed: true,
      }
    );
    res.status(201).json({ success: true });
    createCouponAndPromo({
      products: productIds,
      dealDetails: [...createdLocationDealsIds, ...createdHolidayDealsIds],
      stripeAccount,
    });
    // updatePaymentLinks(stripeAccount);
  } catch (e) {
    if (createdLocationDealsIds?.length) {
      await LocationTypeDeal.deleteMany({
        _id: createdLocationDealsIds.map(
          (item) => item.id || item._id || item._doc._id
        ),
      });
    }
    if (createdHolidayDealsIds?.length) {
      await HolidayTypeDeal.deleteMany({
        _id: createdHolidayDealsIds.map(
          (item) => item.id || item._id || item._doc._id
        ),
      });
    }
    // if (createdDealType) {
    //   await DealTypes.deleteOne({ _id: createdDealType });
    // }
    if (createdNewOffer) {
      await Deal.deleteOne({ _id: createdNewOffer });
      // console.log(createdNewOffer, "createdNewOffer");
    }
    if (DEAL_TYPE_IDS?.length) {
      const del = await DealTypes.deleteMany({
        _id: {
          $in: DEAL_TYPE_IDS,
        },
      });
      console.log(del);
    }
    if (newBannerId) await Banner.deleteOne({ _id: newBannerId });
    const status = e?.status || 500;
    res.status(status).json({
      message: e?.message || `Something Went Wrong!`,
    });
  }
};
const updateDeal = async (req, res) => {
  try {
    const { dealId } = req.params;
    const user = req.user;
    const {
      location_deal,
      holiday_deal,
      holidays,
      locations,
      routes,
      url,
      name,
      description,
      locationTexts,
      holidayTexts,
      dealTypeIds,
      closeIcon,
      enabledStyle,
      styling,
      locationBannerText,
      holidayBannerText,
    } = req.body;
    // return res.json({
    //   success: true,
    // });
    // const user = {
    //   leftCredit: 1000,
    //   _id: '63b9ca4ed27f8cd23df9b846',
    //   uid: 'FkL4IQair6eIgsCTjaAQHvHHvuM2',
    // };
    // if (user?.leftCredit < 1) {
    //   return res.status(400).json({
    //     message: `Insufficient credit`,
    //     success: false,
    //   });
    // }
    // console.log(dealTypeIds);
    let newDealTypesIdLocation = dealTypeIds?.location;
    let newDealTypesIdHoliday = dealTypeIds?.holiday;
    if (!holidays?.length && !locations?.length) {
      return res.status(400).json({
        message: `Invalid params datas!`,
      });
    }

    if (location_deal && locations?.length) {
      if (!newDealTypesIdLocation) {
        const dT = await DealTypes.create(locationTexts);
        newDealTypesIdLocation = dT?.id || dT?._i;
      }
      const locationDealData = [];
      for await (const {
        locationTypeDealGroup,
        percentage,
        voucher,
        _id,
      } of locations) {
        if (_id && isValidObjectId(_id)) {
          await LocationTypeDeal.findByIdAndUpdate(_id, {
            percentage: parseInt(percentage) || 0,
            voucher,
          });
        } else if (percentage) {
          locationDealData.push({
            locationTypeDealGroup,
            dealTypeId: newDealTypesIdLocation,
            percentage: parseInt(percentage) || 0,
            voucher: percentage && !voucher ? generateCoupon() : voucher,
          });
        }
      }
      if (locationDealData?.length) {
        await LocationTypeDeal.insertMany(locationDealData);
      }
    }

    // Holiday deal update
    if (holiday_deal && holidays?.length) {
      if (!newDealTypesIdHoliday) {
        const dT = await DealTypes.create(holidayTexts);

        console.log(dT, "new Holiday");
        newDealTypesIdHoliday = dT?.id || dT?._id;
      }
      const holidayDealData = [];
      for await (const {
        day,
        title,
        startBefore,
        endAfter,
        percentage,
        voucher,
        _id,
      } of holidays) {
        // const date = moment(day).utc().startOf("day").add(12, "hours");
        const date = `${day}T12:00:00Z`;

        const upHolidayData = {
          date,
          title,
          startBefore: parseInt(startBefore) || 0,
          endAfter: parseInt(endAfter) || 0,
          percentage: parseInt(percentage) || 0,
        };
        if (_id && isValidObjectId(_id)) {
          await HolidayTypeDeal.findByIdAndUpdate(_id, {
            ...upHolidayData,
            voucher,
          });
        } else if (percentage) {
          // const date = moment(day).utc().startOf("day").add(12, "hours");
          const date = `${day}T12:00:00Z`;
          holidayDealData.push({
            dealTypeId: newDealTypesIdHoliday,
            date,
            title,
            startBefore: parseInt(startBefore) || 0,
            endAfter: parseInt(endAfter) || 0,
            percentage: parseInt(percentage) || 0,
            voucher: percentage && !voucher ? generateCoupon() : voucher,
          });
        }
      }
      if (holidayDealData?.length) {
        await HolidayTypeDeal.insertMany(holidayDealData);
      }
    }
    let lastSplashLess = url.endsWith("/") ? url.slice(0, -1) : url;
    let checkingDealTypeIds = {};
    if (dealTypeIds?.location || newDealTypesIdLocation) {
      checkingDealTypeIds.location =
        dealTypeIds?.location || newDealTypesIdLocation;
    }
    if (dealTypeIds?.holiday || newDealTypesIdHoliday) {
      checkingDealTypeIds.holiday =
        dealTypeIds?.holiday || newDealTypesIdHoliday;
    }

    const updateDealData = {
      name,
      description,
      dealTypeIds: checkingDealTypeIds,
      url: lastSplashLess,
      routes,
    };
    // console.log(updateDealData, checkingDealTypeIds);
    await Deal.findByIdAndUpdate(dealId, updateDealData).select("_id");
    const upBanner = {
      closeIcon,
      enabledStyle,
      styling,
      locationBannerText,
      holidayBannerText,
    };
    await Banner.updateOne({ dealId }, upBanner);
    res.status(200).json({ success: true });
  } catch (e) {
    console.log(e);
    const status = e?.status || 500;
    res.status(status).json({
      message: e?.message || `Something Went Wrong!`,
    });
  }
};
/**
 * find actual update deals (every single holidayTypeDeal and locationTypeDeal );
 * find all new holidayTypeDeal and locationTypeDeal
 * check any coupon exist by percentage, if exist create new promoCode with this poupon else create coupon & create coupon
 * if update percentage, check does exist coupon following percentage if exist create new promoCode with this poupon else create coupon & create coupon
 *
 */

const updateStripeDeal = async (req, res) => {
  let newDealType;
  try {
    const { dealId } = req.params;
    const user = req.user;
    const {
      location_deal,
      holiday_deal,
      holidays,
      locations,
      routes,
      url,
      name,
      description,
      locationTexts,
      holidayTexts,
      dealTypeIds,
      closeIcon,
      enabledStyle,
      styling,
      locationBannerText,
      holidayBannerText,
      stripeAccount,
    } = req.body;
    if (!holidays?.length && !locations?.length) {
      return res.status(400).json({
        message: `Invalid params datas!`,
      });
    }
    const checked = await checkOnlyLocationsAndHoliday({
      _id: Types.ObjectId(dealId),
    });

    if (!checked?.length) {
      return res.status(400).json({
        message: `Something Went Wrong`,
      });
    }
    if (location_deal && locations?.length && !dealTypeIds?.location) {
      const created = await DealTypes.create(locationTexts);
      newDealType = created.id;
      dealTypeIds.location = created.id;
    }

    if (holiday_deal && holidays?.length && !dealTypeIds?.holiday) {
      const created = await DealTypes.create(holidayTexts);
      newDealType = created.id;
      dealTypeIds.holiday = created.id;
    }

    const { LocationDeals, HolidayDeals, products } = checked[0];
    const merged = { LocationDeals, HolidayDeals };
    const datas = separationUpdateVariation({
      merged,
      dealTypeIds,
      holidays,
      locations,
      merged,
    });

    let {
      newHolidays,
      updateHolidays,
      deleteHolidays,
      newLocations,
      updateLocations,
      deleteLocations,
      deletePromo,
      createCoupon,
    } = datas;

    // throw new Error("defkdjfkdjsafkdsajk");
    if (deleteHolidays?.length) {
      await HolidayTypeDeal.deleteMany({
        _id: {
          $in: deleteHolidays,
        },
      });
    }
    if (deleteLocations?.length) {
      await LocationTypeDeal.deleteMany({
        _id: {
          $in: deleteLocations,
        },
      });
    }

    if (updateLocations?.length) {
      for await (const { _id, percentage, voucher } of updateLocations) {
        if (!_id) continue;
        await LocationTypeDeal.findByIdAndUpdate(_id, {
          percentage,
          voucher,
        });
      }
    }
    if (updateHolidays?.length) {
      for await (const {
        _id,
        percentage,
        voucher,
        startBefore,
        endAfter,
      } of updateHolidays) {
        if (!_id) continue;
        await HolidayTypeDeal.findByIdAndUpdate(_id, {
          percentage,
          voucher,
          startBefore,
          endAfter,
        });
      }
    }
    if (newHolidays?.length) {
      const created = await HolidayTypeDeal.insertMany(newHolidays);
      createCoupon = [...createCoupon, ...created];
    }

    if (newLocations?.length) {
      const created = await LocationTypeDeal.insertMany(newLocations);
      createCoupon = [...createCoupon, ...created];
    }
    let lastSplashLess = url.endsWith("/") ? url.slice(0, -1) : url;
    const updateDealData = {
      name,
      description,
      dealTypeIds,
      url: lastSplashLess,
      routes,
    };
    // console.log(updateDealData, checkingDealTypeIds);
    await Deal.findByIdAndUpdate(dealId, updateDealData);
    const upBanner = {
      closeIcon,
      enabledStyle,
      styling,
      locationBannerText,
      holidayBannerText,
    };
    await Banner.updateOne({ dealId }, upBanner);
    if (deletePromo?.length) {
      deactivatePromo({ deactivates: deletePromo, stripeAccount });
    }
    // res.status(200).json({ success: true });

    if (createCoupon?.length) {
      let mapedPercentage = {},
        unMapped = [];
      // const all_coupons = await allCoupons(stripeAccount);
      for (const im of createCoupon) {
        const { couponId, percentage } = im;
        if (couponId) {
          unMapped.push(im);
        } else {
          // const inStripe = all_coupons[percentage];
          // if (inStripe) {
          //   unMapped.push({ ...im, couponId: inStripe.id });
          // } else

          if (mapedPercentage[percentage]) {
            mapedPercentage[percentage].push(im);
          } else {
            mapedPercentage[percentage] = [im];
          }
        }
      }

      const keyees = Object.keys(mapedPercentage);
      if (keyees?.length) {
        console.log(keyees?.length, "mapedPercentage?.length");
        console.log(mapedPercentage, "mapedPercentage?.length");
        createCouponAndPromo({
          filtered: mapedPercentage,
          products,
          stripeAccount,
        });
      }
      if (unMapped?.length) {
        console.log(unMapped?.length, "unMapped?.length");
        createPromoOrCouponAndPromo({
          createList: unMapped,
          stripeAccount,
          products,
        });
      }
    }
    res.status(200).json({ success: true });
  } catch (e) {
    if (newDealType) {
      await DealTypes.findByIdAndDelete(newDealType);
    }
    console.log(e);
    const status = e?.status || 500;
    res.status(status).json({
      message: e?.message || `Something Went Wrong!`,
    });
  }
};

const updateStripeDealExtra = async (req, res) => {
  try {
    const { dealId } = req.params;
    const user = req.user;
    const {
      location_deal,
      holiday_deal,
      holidays,
      locations,
      routes,
      url,
      name,
      description,
      locationTexts,
      holidayTexts,
      dealTypeIds,
      closeIcon,
      enabledStyle,
      styling,
      locationBannerText,
      holidayBannerText,
    } = req.body;
    // console.log(locations);
    console.log(JSON.stringify({ locations, holidays }));
    let newHolidays = [],
      updateHolidays = [],
      deleteHolidays = [],
      newLocations = [],
      updateLocations = [],
      deleteLocations = [];

    if (holiday_deal && holidays?.length) {
      for (const holi of holidays) {
        const { _id, startBefore, endAfter, percentage } = holi;
        if (!_id) newHolidays.push(holi);
        else if (!startBefore && !endAfter && !percentage)
          deleteHolidays.push(holi);
        else updateHolidays.push(holi);
      }
    }

    if (location_deal && locations?.length) {
      for (const holi of locations) {
        const { _id, percentage } = holi;
        if (!_id) newLocations.push(holi);
        else if (!percentage) deleteLocations.push(holi);
        else updateLocations.push(holi);
      }
    }
    // console.log(location_deal, holiday_deal);
    // console.log(locations, holidays);
    // return res.status(400).json({
    //   success: true,
    // });

    let newDealTypesIdLocation = dealTypeIds?.location;
    let newDealTypesIdHoliday = dealTypeIds?.holiday;
    if (!holidays?.length && !locations?.length) {
      return res.status(400).json({
        message: `Invalid params datas!`,
      });
    }

    if (location_deal && locations?.length) {
      if (!newDealTypesIdLocation) {
        const dT = await DealTypes.create(locationTexts);
        newDealTypesIdLocation = dT?.id || dT?._i;
      }
      const locationDealData = [];
      for await (const {
        locationTypeDealGroup,
        percentage,
        voucher,
        _id,
      } of locations) {
        if (_id && isValidObjectId(_id)) {
          await LocationTypeDeal.findByIdAndUpdate(_id, {
            percentage: parseInt(percentage) || 0,
            voucher,
          });
        } else if (percentage) {
          locationDealData.push({
            locationTypeDealGroup,
            dealTypeId: newDealTypesIdLocation,
            percentage: parseInt(percentage) || 0,
            voucher: percentage && !voucher ? generateCoupon() : voucher,
          });
        }
      }
      if (locationDealData?.length) {
        await LocationTypeDeal.insertMany(locationDealData);
      }
    }

    // Holiday deal update
    if (holiday_deal && holidays?.length) {
      if (!newDealTypesIdHoliday) {
        const dT = await DealTypes.create(holidayTexts);

        console.log(dT, "new Holiday");
        newDealTypesIdHoliday = dT?.id || dT?._id;
      }
      const holidayDealData = [];
      for await (const {
        day,
        title,
        startBefore,
        endAfter,
        percentage,
        voucher,
        _id,
      } of holidays) {
        // const date = moment(day).utc().startOf("day").add(12, "hours");
        const date = `${day}T12:00:00Z`;

        const upHolidayData = {
          date,
          title,
          startBefore: parseInt(startBefore) || 0,
          endAfter: parseInt(endAfter) || 0,
          percentage: parseInt(percentage) || 0,
        };
        if (_id && isValidObjectId(_id)) {
          await HolidayTypeDeal.findByIdAndUpdate(_id, {
            ...upHolidayData,
            voucher,
          });
        } else if (percentage) {
          // const date = moment(day).utc().startOf("day").add(12, "hours");
          const date = `${day}T12:00:00Z`;
          holidayDealData.push({
            dealTypeId: newDealTypesIdHoliday,
            date,
            title,
            startBefore: parseInt(startBefore) || 0,
            endAfter: parseInt(endAfter) || 0,
            percentage: parseInt(percentage) || 0,
            voucher: percentage && !voucher ? generateCoupon() : voucher,
          });
        }
      }
      if (holidayDealData?.length) {
        await HolidayTypeDeal.insertMany(holidayDealData);
      }
    }
    let lastSplashLess = url.endsWith("/") ? url.slice(0, -1) : url;
    let checkingDealTypeIds = {};
    if (dealTypeIds?.location || newDealTypesIdLocation) {
      checkingDealTypeIds.location =
        dealTypeIds?.location || newDealTypesIdLocation;
    }
    if (dealTypeIds?.holiday || newDealTypesIdHoliday) {
      checkingDealTypeIds.holiday =
        dealTypeIds?.holiday || newDealTypesIdHoliday;
    }

    const updateDealData = {
      name,
      description,
      dealTypeIds: checkingDealTypeIds,
      url: lastSplashLess,
      routes,
    };
    // console.log(updateDealData, checkingDealTypeIds);
    await Deal.findByIdAndUpdate(dealId, updateDealData).select("_id");
    const upBanner = {
      closeIcon,
      enabledStyle,
      styling,
      locationBannerText,
      holidayBannerText,
    };
    await Banner.updateOne(
      { dealId },
      {
        closeIcon,
        enabledStyle,
        styling,
        locationBannerText,
        holidayBannerText,
      }
    );
    res.status(200).json({ success: true });
  } catch (e) {
    console.log(e);
    const status = e?.status || 500;
    res.status(status).json({
      message: e?.message || `Something Went Wrong!`,
    });
  }
};
const singleUserDeals = async (req, res) => {
  try {
    const { uid } = req.params;
    const { uid: UID, _id } = req.user;

    // const UID = 'FkL4IQair6eIgsCTjaAQHvHHvuM2';
    // console.log(userRest);
    if (uid !== UID) {
      return res.status(400).json({
        message: `Invalid user`,
      });
    }
    const deals = await Deal.find({ userId: _id }).exec();
    res.json(deals);
  } catch (e) {
    console.log(e);
    const status = e?.status || 500;
    res.status(status).json({
      message: e?.message || `Something Went Wrong!`,
    });
  }
};

const singleDeal = async (req, res) => {
  try {
    const { _id } = req.params;

    if (!isValidObjectId(_id)) {
      return res.status(400).json({
        message: `Invalid user`,
      });
    }

    const deal = await Deal.aggregate([
      { $match: { _id: Types.ObjectId(_id) } },
      {
        $lookup: {
          from: "dealtypes",
          localField: "dealTypeIds.location",
          foreignField: "_id",
          as: "DealTypeL",
        },
      },
      // { $unwind: '$DealTypeL' },
      {
        $lookup: {
          from: "locationtypedeals",
          localField: "DealTypeL._id",
          foreignField: "dealTypeId",
          as: "DealLocation",
        },
      },
      {
        $lookup: {
          from: "dealtypes",
          localField: "dealTypeIds.holiday",
          foreignField: "_id",
          as: "DealTypeH",
        },
      },
      // { $unwind: '$DealTypeH' },
      {
        $lookup: {
          from: "holidaytypedeals",
          localField: "DealTypeH._id",
          foreignField: "dealTypeId",
          as: "DealHoliday",
        },
      },
      {
        $lookup: {
          from: "banners",
          localField: "_id",
          foreignField: "dealId",
          as: "banner",
        },
      },
      { $unwind: "$banner" },
      {
        $project: {
          name: 1,
          routes: 1,
          stripeAccount: 1,
          url: 1,
          userId: 1,
          _id: 1,
          DealHoliday: 1,
          DealLocation: 1,
          DealTypeH: 1,
          DealTypeL: 1,
          banner: 1,
          dealTypeIds: 1,
        },
      },
    ]);

    res.json(deal?.[0]);
  } catch (e) {
    console.log(e);
    const status = e?.status || 500;
    res.status(status).json({
      message: e?.message || `Something Went Wrong!`,
    });
  }
};

const deleteDeal = async (req, res) => {
  try {
    const { dealId } = req.params;
    const { uid, _id } = req.user;

    if (dealId === "undefined") {
      return res.status(400).json({
        message: `Invalid delete id`,
      });
    }
    const deal = await Deal.findOne({ _id: dealId }).exec();

    if (!Object.keys(deal?.dealTypeIds || {}).length) {
      return res.status(400).json({
        success: false,
        message: `Something Went Wrong!`,
      });
    }
    const deleteDealTypeIds = [];
    let { location, holiday } = deal.dealTypeIds;
    let dealTypeIds = [];
    if (location) {
      const delLocation = await LocationTypeDeal.deleteMany({
        dealTypeId: location,
      }).exec();
      dealTypeIds.push();
      await DealTypes.findByIdAndDelete(location);
      // console.log(delLocation, '=====location-===');
      deleteDealTypeIds.push(location);
    }

    if (holiday) {
      const delholidays = await HolidayTypeDeal.deleteMany({
        dealTypeId: holiday,
      }).exec();
      await DealTypes.findByIdAndDelete(holiday);
      // console.log(delholidays, '=====holidays-===');
      deleteDealTypeIds.push(holiday);
    }
    await Banner.deleteOne({ dealId });
    //update user credit
    // await User.updateOne({ _id }, { $inc: { leftCredit: 1 } }).exec();
    // deal.url = "https://facebook.com";
    const stripeAccount = deal._doc.stripeAccount;
    if (stripeAccount) {
      await StripeConnect.updateOne(
        { stripeAccount },
        {
          isUsed: false,
        }
      );
    }
    await deal?.save?.();
    await deal.remove();

    res.json({
      success: true,
    });
    if (deleteDealTypeIds?.length && stripeAccount) {
      deactivatePromoFollowingDealTypes({ deleteDealTypeIds, stripeAccount });
    }
  } catch (e) {
    console.log(e);
    const status = e?.status || 500;
    res.status(status).json({
      message: e?.message || `Something Went Wrong!`,
    });
  }
};
const dev = async (req, res) => {
  const { pd_id, url, timeZone } = req.query;
  // const pd_id = searchUrl?.split?.('pd_id=')?.[1];

  if (process.env.NODE_ENV !== "development") return res.sendStatus(404);
  let isErr = false;
  if ((!url && !pd_id) || !timeZone) isErr = true;
  else if (pd_id && !isValidObjectId(pd_id)) isErr = true;
  else if (!url) isErr = true;
  if (isErr)
    return res.status(400).json({
      message: `url or pd_id or timeZone missing`,
    });

  if (pd_id) {
    const deal = await dealQry({ _id: Types.ObjectId(pd_id) });
    // console.log(deal);
    if (deal?.length) {
      let { LocationDeals, HolidayDeals } = deal[0];

      let myOffer = {};
      if (HolidayDeals?.length) {
        let resp = await findOutHolidayDiscount(HolidayDeals);
        if (resp?.holiday) return res.json(resp);
      }
      if (LocationDeals?.length && !myOffer?.holiday && timeZone) {
        let resp = await findOutLocationDiscount(LocationDeals, timeZone);
        // console.log('LocationDeals', timeZone);
        return res.json(resp);
      }
      return res.sendStatus(203);
    }
    return res.json({ message: `Nothing found by pd_id` });
  } else if (url) {
    // It should be not

    const deal = await dealQry({
      url,
    });
    // console.log(deal);
    if (deal?.length) {
      let { LocationDeals, HolidayDeals } = deal[0];

      let offerWithRoute = {};
      if (HolidayDeals?.length) {
        let resp = await findOutHolidayDiscount(HolidayDeals);
        if (resp?.holiday) return res.json(resp);
      }
      if (!offerWithRoute?.holiday && LocationDeals?.length && timeZone) {
        let resp = await findOutLocationDiscount(LocationDeals, timeZone);
        return res.json(resp);
      }
      return res.json({ message: `nothing found` });
    }
    // await sendErrorEmail('abutaher267@gmail.com', searchUrl);
    return res.json({ message: `nothing found` });
  } else {
    res.json({ message: `nothing found` });
  }
};
const devfull = async (req, res) => {
  const { pd_id, url, timeZone } = req.query;
  // const pd_id = searchUrl?.split?.('pd_id=')?.[1];

  if (process.env.NODE_ENV !== "development") return res.sendStatus(404);

  let isErr = false;
  if ((!url && !pd_id) || !timeZone) isErr = true;
  else if (pd_id && !isValidObjectId(pd_id)) isErr = true;
  else if (!url) isErr = true;
  if (isErr)
    return res.status(400).json({
      message: `url or pd_id or timeZone missing`,
    });

  if (pd_id) {
    const deal = await dealQry({ _id: Types.ObjectId(pd_id) });
    // console.log(deal);
    if (deal?.length) {
      let { LocationDeals, HolidayDeals, Banner: bannarData } = deal[0];

      let myOffer = {};
      if (HolidayDeals?.length) {
        let resp = await findOutHolidayDiscount(HolidayDeals, bannarData);

        if (resp?.holiday) return res.json(resp);
      }
      if (LocationDeals?.length && !myOffer?.holiday && timeZone) {
        let resp = await findOutLocationDiscount(
          LocationDeals,
          timeZone,
          bannarData
        );
        // console.log('LocationDeals', timeZone);

        return res.json(resp);
      }
      return res.sendStatus(203);
    }
    return res.json({ message: `Nothing found by pd_id` });
  } else if (url) {
    // It should be not

    const deal = await dealQry({
      url: url.endsWith("/") ? url.slice(0, -1) : url,
    });

    if (deal?.length) {
      let { LocationDeals, HolidayDeals, Banner: bannarData } = deal[0];

      let offerWithRoute = {};
      if (HolidayDeals?.length) {
        let resp = await findOutHolidayDiscount(HolidayDeals, bannarData);
        // console.log(resp);
        if (resp?.holiday) return res.json(resp);
      }
      if (!offerWithRoute?.holiday && LocationDeals?.length && timeZone) {
        let resp = await findOutLocationDiscount(
          LocationDeals,
          timeZone,
          bannarData
        );
        return res.json(resp);
      }
      return res.json({ message: `nothing found` });
    }
    // await sendErrorEmail('abutaher267@gmail.com', searchUrl);
    return res.json({ message: `nothing found` });
  } else {
    res.json({ message: `nothing found` });
  }
};
module.exports = {
  deleteDeal,
  createDeal,
  dealDiscount,
  singleUserDeals,
  singleDeal,
  updateDeal,
  updateStripeDeal,
  dev,
  devfull,
  createStripeDeal,
};

/**
 *  const deal = await Deal.findOne({ _id })
      // .populate({
      //   path: 'dealTypeIds.location',
      //   model: 'DealTypes',
      //    populate: { path: '_id', model: 'LocationTypeDeal' },
      // })
      .populate('dealTypeIds.location')
      .populate('dealTypeIds.holiday');

    if (deal) {
      singleDealDetail = { ...deal?._doc };
      let locationId = singleDealDetail?.dealTypeIds?.location?._id;
      let holidayId = singleDealDetail?.dealTypeIds?.holiday?._id;
      if (locationId) {
        singleDealDetail.locations = await LocationTypeDeal.find({
          dealTypeId: locationId,
        }).exec();
      } else {
        singleDealDetail.locations = false;
      }
      if (holidayId) {
        singleDealDetail.holidays = await HolidayTypeDeal.find({
          dealTypeId: holidayId,
        }).exec();
      } else {
        singleDealDetail.holidays = false;
      }
    }
 */
