module.exports = (input, { nation, flag, voucher, percentage, holiday }) => {
    return input
        .replace(/{nation_flag}/g, `<img height='12.5' width='20'  src='${flag}'/>`)
        .replace(/{nation}/g, nation)
        .replace(/{voucher_code}/g, voucher)
        .replace(/{holiday}/g, holiday)
        .replace(/{discount_rate}/g, percentage);
};
