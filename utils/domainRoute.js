module.exports = (str = "") => {
  let url = str.split("?")[0];
  let http = "";
  if (url.includes("http")) {
    url = url?.split("//");
    http = `${url[0]}//`;
    url = url[1];
  }
  url = url.replace?.("/", "^")?.split?.("^");
  let route = `${url[1]}`;
  url = http + url?.[0];
  if (url && url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  return { url, route };
};
