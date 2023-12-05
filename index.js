

const net = require("net");
const crypto = require("crypto");

const server = net.createServer();

server.on("connection", handleConnection);

server.listen(servicePort, function () {
  console.log("server listening to %j", server.address());
});

function handleConnection(conn) {
  var connectionID = crypto.randomUUID();
  var buffer = Buffer.alloc(0);

  var remoteAddress = conn.remoteAddress + ":" + conn.remotePort;
  console.log("new client connection from %s", remoteAddress);
  conn.on("data", onConnData);
  conn.once("close", onConnClose);
  conn.on("error", onConnError);

  function onConnData(data) {
    buffer = Buffer.concat([buffer, data]);

    var bufferIndex = buffer.indexOf(packageTermination);
    while(bufferIndex>-1)
    {
      var pkg = buffer.subarray(0,bufferIndex + packageTermination.length);
      buffer = buffer.subarray(bufferIndex + packageTermination.length);
      bufferIndex = buffer.indexOf(packageTermination);

    console.log(pkg);
      makeServiceRequest(connectionID, pkg).then(
        function (data) {
    console.log(Buffer.concat([data]));

          conn.write(data);
        }
      );

    }
  }

  function onConnClose() {
    console.log("connection from %s closed", remoteAddress);
  }

  function onConnError(err) {
    console.log("Connection %s error: %s", remoteAddress, err.message);
  }
}

async function makeServiceRequest(connectionID, requestText) {
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
      return  Buffer.from(responseArrayBuffer);
    });
}
