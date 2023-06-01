const generateCoupon = require("../generateCoupon");
const idAndPercentageMapping = require("./idAndPercentageMapping");

module.exports = (update) => {
    let newHolidays = [],
        updateHolidays = [],
        deleteHolidays = [],
        newLocations = [],
        updateLocations = [],
        deleteLocations = [],
        deletePromo = [],
        updatePromo = [],
        createCoupon = [];
    const { dealTypeIds, holidays, locations, merged } = update;
    const { HP, LP, HiD, LiD } = idAndPercentageMapping(merged); // data
    const mergeID = { ...HiD, ...LiD };
    const mergeP = { ...HP, ...LP };
    const { holiday, location } = dealTypeIds;
    for (const loc of locations || []) {
        const { _id, percentage, locationTypeDealGroup, promoId } = loc;
        if (!percentage) {
            if (promoId) deletePromo(promoId);
            deleteLocations.push(promoId);
            continue;
        }
        if (percentage == 0) {
            continue;
        }
        const newObj = {
            locationTypeDealGroup,
            dealTypeId: location,
            percentage: parseInt(percentage),
            voucher: generateCoupon({ append: "PB", type: "stripe" }),
        };
        if (_id) {
            const obj = mergeID?.[_id];
            if (obj) {
                const voucher = generateCoupon({ append: "PB", type: "stripe" });
                // console.log(obj.percentage == percentage);
                if (obj.percentage == percentage) {
                    //nothing to be updated
                } else if (mergeP?.[percentage]) {
                    // console.log(mergeP?.[percentage]);
                    const couponId = mergeP?.[percentage].couponId;
                    const objec = { _id, ...newObj, couponId };
                    updateLocations.push(objec); /////////////////////////////////////
                    // here only create promotion code following coupon
                    createCoupon.push(objec);
                } else {
                    const { couponId, promoId, ...rest } = loc;
                    const updateD = { ...rest, ...newObj, voucher };
                    createCoupon.push(updateD);
                    if (promoId) deletePromo(promoId);
                    updateLocations.push(updateD);

                    // updateLocations.push();/////////////////////////////////////
                }
            }
        } else {
            const isExistPercengage = mergeP[percentage];
            const objData = { ...newObj };
            if (isExistPercengage) {
                objData.couponId = isExistPercengage.couponId;
            }
            newLocations.push(objData);
            // createCoupon.push(objData);
        }
    }
    //Holiday type
    for (const holi of holidays || []) {
        const { _id, percentage, startBefore, endAfter, promoId, day, title } =
            holi;
        if (!percentage) {
            if (promoId) deletePromo(promoId);
            deleteHolidays.push(promoId);
            continue;
        }
        if (percentage == 0) {
            continue;
        }
        const date = `${day}T12:00:00Z`;
        const newObj = {
            title,
            day: date,
            dealTypeId: holiday,
            startBefore: startBefore ? parseInt(startBefore) : 0,
            endAfter: endAfter ? parseInt(endAfter) : 0,
            percentage: parseInt(percentage),
            voucher: generateCoupon({ append: "PB", type: "stripe" }),
        };
        if (_id) {
            const obj = mergeID?.[_id];

            if (obj) {
                const voucher = generateCoupon({ append: "PB", type: "stripe" });
                if (obj.percentage == percentage) {
                    //nothing to be updated
                } else if (mergeP?.[percentage]) {

                    const couponId = mergeP?.[percentage].couponId;
                    const objec = { _id, ...newObj, couponId };
                    updateHolidays.push(objec);
                    // here only create promotion code following coupon
                    createCoupon.push(objec);
                } else {
                    const { couponId, promoId, ...rest } = holi;
                    const up = { ...rest, ...newObj, voucher };
                    createCoupon.push(up);
                    if (promoId) deletePromo(promoId);
                    updateHolidays.push(up);
                }
            }
        } else {
            const isExistPercengage = mergeP[percentage];
            const objData = { ...newObj };
            if (isExistPercengage) {
                objData.couponId = isExistPercengage.couponId;
            }
            newHolidays.push(objData);
            // createCoupon.push(objData);
        }
    }

    // create coupon =newHolidays+updateHolidays+newLocations+updateLocations
    return {
        newHolidays,
        updateHolidays,
        deleteHolidays,
        newLocations,
        updateLocations,
        deleteLocations,
        // createPromo,
        deletePromo,
        updatePromo,
        createCoupon,
    };
};
