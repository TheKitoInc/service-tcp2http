// http.js

module.exports.makeServiceRequest = async function (
  connectionID,
  serviceURL,
  requestText
) {
  return await fetch(serviceURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "X-Connection-Id": connectionID,
    },
    body: requestText,
  })
    .then((response) => response.arrayBuffer())
    .then((responseArrayBuffer) => {
      return Buffer.from(responseArrayBuffer);
    });
};
