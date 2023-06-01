const axios = require("axios");
const HolidayTypeDeal = require("../../models/HolidayTypeDeal");
const LocationTypeDeal = require("../../models/LocationTypeDeal");
const stripe = require("../../utils/stripe");
const generateCoupon = require("../generateCoupon");

const createPromoOrCouponAndPromo = async ({
    products = [],
    stripeAccount,
    createList,
}) => {
    try {
        for await (const item of createList) {
            let {
                couponId: coupon,
                voucher,
                percentage,
                locationTypeDealGroup,
                _id,
                dealTypeId,
            } = item;
            if (!coupon) {
                const newD = {
                    name: `${voucher}${percentage}`,
                    duration: "forever",
                    percent_off: Number(percentage),
                    metadata: { _id, dealTypeId: dealTypeId?.toString?.() },
                };
                if (products?.length) {
                    newD.applies_to = { products };
                }

                const createdCoupon = await stripe.coupons.create(newD, {
                    stripeAccount,
                });
                coupon = createdCoupon.id;
            }
            if (coupon) {
                try {
                    // Create promocode start
                    const metadata = { _id, dealTypeId };
                    const savedPromo = await stripe.promotionCodes.create(
                        {
                            coupon,
                            code: voucher,
                            metadata: JSON.parse(JSON.stringify(metadata)),
                        },
                        {
                            stripeAccount,
                        }
                    );
                    const update = { couponId: coupon, promoId: savedPromo.id };
                    if (locationTypeDealGroup === undefined && _id) {
                        await HolidayTypeDeal.updateOne({ _id }, update);
                    } else if (_id) {
                        await LocationTypeDeal.updateOne({ _id }, update);
                    }
                    // Crate promocode End
                } catch (e2) {
                    if (e2.message?.includes("No such coupon:")) {
                        //  for invalid or doesn't exist coupon start
                        const newD = {
                            name: `${voucher}${percentage}`,
                            duration: "forever",
                            percent_off: Number(percentage),
                            metadata: { _id, dealTypeId: dealTypeId?.toString?.() },
                        };
                        if (products?.length) {
                            newD.applies_to = { products };
                        }

                        const CC = await stripe.coupons.create(newD, {
                            stripeAccount,
                        });
                        const newCoupon = CC.id;
                        if (newCoupon) {
                            const metadata = { _id, dealTypeId: dealTypeId?.toString?.() };
                            const code = generateCoupon({ append: "PB", type: "stripe" });
                            const savedPromo2 = await stripe.promotionCodes.create(
                                {
                                    coupon: newCoupon,
                                    code,
                                    metadata: JSON.parse(JSON.stringify(metadata)),
                                },
                                {
                                    stripeAccount,
                                }
                            );
                            const update = { couponId: newCoupon, promoId: savedPromo2.id };
                            if (locationTypeDealGroup === undefined && _id) {
                                await HolidayTypeDeal.updateOne(
                                    { _id },
                                    { ...update, coupon: code }
                                );
                            } else if (_id) {
                                await LocationTypeDeal.updateOne(
                                    { _id },
                                    { ...update, coupon: code }
                                );
                            }
                        }
                    } else if (e2?.message?.includes("An active promotion code with")) {
                        if (coupon) {
                            const metadata = { _id, dealTypeId: dealTypeId?.toString?.() };
                            const code = generateCoupon({ append: "PB", type: "stripe" });
                            const savedPromo3 = await stripe.promotionCodes.create(
                                {
                                    coupon,
                                    code,
                                    metadata: JSON.parse(JSON.stringify(metadata)),
                                },
                                {
                                    stripeAccount,
                                }
                            );
                            const update = { couponId: coupon, promoId: savedPromo3.id };
                            if (locationTypeDealGroup === undefined && _id) {
                                await HolidayTypeDeal.updateOne(
                                    { _id },
                                    { ...update, coupon: code }
                                );
                            } else if (_id) {
                                await LocationTypeDeal.updateOne(
                                    { _id },
                                    { ...update, coupon: code }
                                );
                            }
                        }
                    }
                    //  for invalid or doesn't exist coupon End
                }
            } else {
                console.log("no coupon CRUDCoupon");
            }
        }
        return true;
    } catch (e) {
        // if (e.message?.includes("No such coupon:")) {
        // }
        console.log(e.message);
    }
};
const deactivatePromo = async ({ stripeAccount, deactivates = [] }) => {
    try {
        for await (const { promoId } of deactivates) {
            if (promoId) {
                await stripe.promotionCodes.update(
                    promoId,
                    {
                        active: false,
                        metadata: {},
                    },
                    {
                        stripeAccount,
                    }
                );
            }
        }
    } catch (e) {
        console.log(e.message);
    }
};

const deactivatePromoFollowingDealTypes = async ({
    stripeAccount,
    deleteDealTypeIds = [],
}) => {
    try {
        if (!stripeAccount) {
            return `No stripe account id`;
        }
        if (!deleteDealTypeIds?.length) return;
        const proms = await stripe.promotionCodes.list({
            stripeAccount,
        });
        // console.log(proms.data?.length);
        for await (const item of proms?.data || []) {
            if (
                item.metadata?.dealTypeId &&
                deleteDealTypeIds?.includes(item.metadata.dealTypeId) &&
                item.active
            ) {
                const updated = await stripe.promotionCodes.update(
                    item.id,
                    {
                        active: false,
                        metadata: {},
                    },
                    {
                        stripeAccount,
                    }
                );
                console.log(updated);
            }
        }
    } catch (e) {
        console.log(e.message);
    }
};
module.exports = {
    createPromoOrCouponAndPromo,
    deactivatePromo,
    deactivatePromoFollowingDealTypes,
};
