const { Types, isValidObjectId } = require("mongoose");
const LTPLan = require("../models/LifetimePlan");
const Plan = require("../models/Plan");
const Subscription = require("../models/Subscription");
const { hash, genSalt, compare } = require("bcrypt");
const { randomUUID } = require("crypto");
const txtHipeAdd = require("../utils/txtHipeAdd");
const sendErrorEmail = require("../utils/sendErrorEmail");
const moment = require("moment");

const codeMaker = async (id) => {
    const uuid = randomUUID();
    id = id.toString();
    const str = `${uuid}_${txtHipeAdd(id)}`;
    const data = { code: await hash(str, await genSalt(10)), str };
    if (await compare(data.str, data.code)) {
        return data;
    }
    return {};
};
module.exports = {
    createLifetimePlan: async (req, res) => {
        try {
            const { planId, generateNoOfCode } = req.joiBody;
            const doesExistPlan = await Plan.findById(planId);
            if (!doesExistPlan) {
                return res.status(400).json({
                    message: `Plan doesn't exist planId: ${planId}!`,
                });
            }
            const newCodes = [];
            const codes = [];
            for await (let single of Array(generateNoOfCode)) {
                const _id = Types.ObjectId();
                const { code, str } = await codeMaker(_id);
                if ((!code, !str)) continue;
                codes.push(str);
                const newPlan = {
                    _id,
                    planId,
                    code,
                };
                newCodes.push(newPlan);
            }
            const saved = await LTPLan.insertMany(newCodes);
            res.json({
                codes,
                // saved,
            });
        } catch (e) {
            const status = e.status || 500;
            const message = e.message || `Something Went Wrong!`;
        }
    },
    lifetimeSubscription: async (req, res) => {
        try {
            const { name, email, _id: userId } = req.user;
            const { origin } = req.headers;
            const { code } = req.body;
            const _id = code?.split("_")?.[1]?.replace?.(/-/g, "");
            if (!_id || !isValidObjectId(_id)) {
                return res.status(400).json({
                    message: `Invalid code!`,
                });
            }

            const doesExistCode = await LTPLan.findById(_id)
                .populate("planId")
                .select("code isExpired planId");
            if (!doesExistCode ||
                doesExistCode.isExpired === 1 ||
                !(await compare(code, doesExistCode.code)) ||
                !doesExistCode?.planId?._id
            ) {
                return res.status(400).json({
                    message: `Invalid code!`,
                });
            }
            const {
                _id: lifetimeId,
                planId: { _id: planId, visitors, credit, price },
            } = doesExistCode;
            const subsObj = {
                type: "lifetime",
                userId,
                planId,
                lifetimeId,
                credit,
                price,
                expire: moment().add(100, "years").valueOf(),
                visitors,
            };
            await Subscription.create(subsObj);
            doesExistCode.isExpired = 1;
            await doesExistCode.save();
            res.json(subsObj);
        } catch (e) {
            const status = e.status || 500;
            const message = e.message || `Something Went Wrong!`;
            res.status(status).json({ message });
        }
    },

    LifetimePlan: async (req, res) => {
        try {
        } catch (e) {
            const status = e.status || 500;
            const message = e.message || `Something Went Wrong!`;
        }
    },
};
