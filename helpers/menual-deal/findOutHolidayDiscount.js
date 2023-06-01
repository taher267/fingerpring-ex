const moment = require("moment");
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

module.exports = async (HolidayDeals = [], bannarData, credit) => {
    const { holidayBannerText, enabledStyle, closeIcon, styling } = bannarData;
    let result = {};
    for (const holi of HolidayDeals) {
        let { date, startBefore, endAfter } = holi;
        if (date && holi?.percentage) {
            startBefore = moment(date)
                .add(-(startBefore || 0), "days")
                .startOf("day");

            endAfter = moment(date)
                .add(endAfter || 0, "days")
                .endOf("day");
            const now = Date.now();
            if (startBefore?.valueOf?.() < now && endAfter?.valueOf?.() > now) {
                const message = replacer(holidayBannerText, {
                    holiday: holi.title,
                    voucher: holi.voucher,
                    percentage: holi?.percentage,
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
                    holiday: true,
                    ...styled,
                    message: `<div class='parity-banner parity-banner-has-logo'><div class='parity-banner-inner'>${message}</div>
            ${closeBtn}${poweredBy}</div>`,
                };
                break;
            }
        }
    }
    return result;
};
