module.exports = (data = [], selects = []) => {
  const newData = [];
  for (const single of data) {
    const selecting = {};
    for (const sel of selects) {
      selecting[sel] = single[sel];
    }
    newData.push(selecting);
  }
  return newData;
};
