const currency = require("iso-country-currency");
const falgs = require("country-flags-svg");
const { getCountryForTimezone } = require("countries-and-timezones");
const { getByCountryCode } = require("../countries");
const replacer = require("../../utils/replacer");

const bar = {
    backgroundColor: "rgb(57, 169, 165)", // 3182CE
    backgroundTransparency: "0",
    fontColor: "#F9F9F9",
    highlightFontColor: "#DD5C64",
    placement: "top",
    borderRadius: "0",
    addCloseIcon: true,
    unStyled: true,
    container: null,
    fontSize: "1rem",
};
module.exports = async (
    LocationDeals = [],
    timeZone = "",
    bannarData,
    credit
) => {
    const { locationBannerText, enabledStyle, closeIcon, styling } = bannarData;
    const code = getCountryForTimezone(timeZone)?.id;
    let result = {};
    const locationTypeDealGroup = getByCountryCode[code]?.group;
    let filtering = LocationDeals.filter(
        (item) =>
            item.locationTypeDealGroup === locationTypeDealGroup &&
            item.voucher &&
            item.percentage
    )?.[0];

    if (filtering?.voucher && filtering?.percentage) {
        let { voucher, percentage } = filtering;
        const ct = currency.getAllInfoByISO(code);
        const flag = falgs.findFlagUrlByIso2Code(ct.iso);
        const nation = ct.countryName;
        // let countryInfo = {
        //   countryCode: ct.iso,
        //   currencyCode: ct.currency,
        //   nation,
        //   currencySymbol: symble(ct.currency),
        //   flag,
        // };
        const message = replacer(locationBannerText, {
            nation,
            flag,
            voucher,
            percentage,
        });
        const poweredBy =
            credit > 1
                ? ""
                : `<a class='parity-banner-logo' href='https://parityboss.com' target='_blank' style='position: absolute;right: 100px;top: 50%;transform: translate3d(0, -50%, 0);color: inherit;opacity: 0.7;font-size: 11px;'>Parityboss</a>`;
        const closeBtn = closeIcon
            ? `<button type='button' class='parity-banner-close-btn' aria-label='Close'><svg viewBox='0 0 24 24' focusable='false' aria-hidden='true'><path fill='currentColor' d='M.439,21.44a1.5,1.5,0,0,0,2.122,2.121L11.823,14.3a.25.25,0,0,1,.354,0l9.262,9.263a1.5,1.5,0,1,0,2.122-2.121L14.3,12.177a.25.25,0,0,1,0-.354l9.263-9.262A1.5,1.5,0,0,0,21.439.44L12.177,9.7a.25.25,0,0,1-.354,0L2.561.44A1.5,1.5,0,0,0,.439,2.561L9.7,11.823a.25.25,0,0,1,0,.354Z'></path></svg></button>`
            : "";
        const styled = {
            bar: {
                fontColor: "#F9F9F9",
                highlightFontColor: "#DD5C64",
                placement: "top",
            },
        };
        if (enabledStyle) {
            styled.bar = {
                ...bar,
                ...styling,
                placement: styling.bannerPosition,
            };
        }

        result = {
            // voucher,
            // percentage,
            // ...countryInfo,
            // parity-banner-inner
            ...styled,
            message: `<div class='parity-banner parity-banner-has-logo'><div class='parity-banner-inner'>${message}</div>
         ${closeBtn}${poweredBy}</div>`,
            location: true,
        };
    }
    // console.log(result);
    return result;
};
