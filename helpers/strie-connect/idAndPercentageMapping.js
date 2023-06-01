module.exports = (data) => {
    const LP = {},
        HP = {},
        LiD = {},
        HiD = {};
    for (const item of data?.LocationDeals || []) {
        const { percentage, _id } = item;
        LP[percentage] = item;
        LiD[_id] = item;
    }

    for (const item of data?.HolidayDeals || []) {
        const { percentage, _id } = item;
        HP[percentage] = item;
        HiD[_id] = item;
    }

    const resp = {
        LP,
        HP,
        LiD,
        HiD,
    };
    // if (Object.keys(LP).length) resp.LP = LP;
    // if (Object.keys(HP).length) resp.HP = HP;
    // if (Object.keys(LiD).length) resp.LiD = LiD;
    // if (Object.keys(HiD).length) resp.HiD = HiD;

    return resp;
};
