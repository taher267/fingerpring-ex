const { randomInt, randomBytes, randomUUID } = require("crypto");

const generateCoupon = ({ prepend = "", byte = 3, append = "", type = "" }) => {
  let six = randomBytes(byte).toString("hex").toUpperCase();
  let spl = six.slice(0, randomInt(1, 5));
  let resp = "";
  if (type === "stripe") {
    const isUpper = Math.round(Math.random());
    let gen = randomUUID().split("-")[0];
    gen = isUpper ? gen.toUpperCase() : gen;
    resp = append + gen + prepend;
  } else {
    resp = six?.replace?.(spl, `${spl}-`);
  }
  return resp;
};

function DoesExist() {
  let count = 0,
    existCount = 0;

  let arr = [];
  while (count <= 100000) {
    const coupon = generateCoupon({ append: "PB", type: "stripe" });
    if (arr.includes(coupon)) {
      console.log(
        arr.indexOf(coupon),
        "==========================================",
        coupon
      );
      existCount++;
    } else {
      // console.log(coupon)
      if (count === 100000 - 1) {
        console.log("end before", existCount);
      }
    }
    arr.push(coupon);
    count++;
  }
}
// DoesExist();
module.exports = generateCoupon;
