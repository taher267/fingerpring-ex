const arrToObj = require('../utils/arrToObj');
const clonning = require('../utils/clonning');
const toLocalTime = require('../utils/toLocalTime');

/**
 *
 * @param {array} events
 * @param {string} userTWID
 * @param {array} dmSentIDs
 * @returns object
 */
module.exports = (
  events,
  userTWID,
  // campaignStart,
  dmSentIDs
) => {
  if (
    !events?.length ||
    !userTWID ||
    // !campaignStart ||
    !dmSentIDs?.length
  )
    return;

  // const startDate = toLocalTime(campaignStart);
  const ObjIDS = {};
  const IDs = dmSentIDs?.length ? arrToObj(dmSentIDs) : {};
  for (const item of clonning(events.flat())) {
    const {
      message_create: { sender_id },
      created_timestamp,
    } = item;
    if (
      !ObjIDS[sender_id] &&
      // startDate < created_timestamp &&
      IDs[sender_id] === '' &&
      sender_id !== userTWID
    ) {
      ObjIDS[sender_id] = created_timestamp;
    }
  }
  return { replied: Object.keys(ObjIDS).length };
};
