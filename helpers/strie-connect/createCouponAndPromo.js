const HolidayTypeDeal = require("../../models/HolidayTypeDeal");
const LocationTypeDeal = require("../../models/LocationTypeDeal");
const stripe = require("../../utils/stripe");

const groupByPercentage = (data) =>
    data.reduce((a, c) => {
        const { percentage } = c;
        if (a[percentage]) a[percentage].push(c);
        else a[percentage] = [c];
        return a;
    }, {});

module.exports = async ({
    products = [],
    dealDetails = [],
    stripeAccount,
    filtered,
}) => {
    try {
        // console.log(dealDetails);
        const filteredData = filtered ? filtered : groupByPercentage(dealDetails);
        // console.log(filteredData);
        for await (let k of Object.keys(filteredData)) {
            if (0.01 > k) continue;
            const item = filteredData[k];
            const newC = {
                name: `${item[0].voucher}${k}`,
                duration: "forever",
                percent_off: Number(k),
                metadata: {
                    _id: item?.[0]?.id,
                    dealTypeId: item[0]?.dealTypeId?.toString?.(),
                },
            };
            if (products?.length) {
                newC.applies_to = { products };
            }

            const createdCoupon = await stripe.coupons.create(newC, {
                stripeAccount,
            });
            // promoCode validation (/\A[a-zA-Z0-9]+\z/

            for await (const singleItem of item) {
                try {
                    const { voucher, _id, dealTypeId, locationTypeDealGroup } =
                        singleItem;
                    const metadata = { _id, dealTypeId: dealTypeId?.toString?.() };
                    const savedPromo = await stripe.promotionCodes.create(
                        {
                            coupon: createdCoupon.id,
                            code: voucher,
                            metadata: JSON.parse(JSON.stringify(metadata)),
                        },
                        {
                            stripeAccount,
                        }
                    );
                    const update = { couponId: createdCoupon.id, promoId: savedPromo.id };
                    if (locationTypeDealGroup === undefined) {
                        await HolidayTypeDeal.updateOne({ _id }, update);
                    } else {
                        await LocationTypeDeal.updateOne({ _id }, update);
                    }
                } catch (e2) {
                    console.log(e2.message, "createCouponAndPromo");
                    if (e2.message?.includes("No such coupon:")) {
                        const { voucher, _id, dealTypeId, locationTypeDealGroup } =
                            singleItem;
                        //  for invalid or doesn't exist coupon start
                        const newD = {
                            name: `${voucher}${percentage}`,
                            duration: "forever",
                            percent_off: Number(percentage),
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
                    } else if (e2.message?.includes("An active promotion code with")) {
                        if (coupon) {
                            const { _id, dealTypeId, locationTypeDealGroup } = singleItem;
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
                }
            }
        }
        return true;
    } catch (e) {
        console.log(e.message, "createCouponAndPromo");
    }
};
