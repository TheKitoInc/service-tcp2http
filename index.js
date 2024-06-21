const argv = require("minimist")(process.argv.slice(2));

const serviceURL = argv.serviceURL;
const servicePort = argv.servicePort;
const packageTermination = Buffer.from("\x0D\x0A");

const crypto = require("node:crypto");
const { makeServiceRequest } = require("./src/client/http");
const { createTCPServer } = require("./src/server/tcp");

createTCPServer(servicePort, function (err, connectionContext) {
  if (err) {
    console.log(err);
  } else {
    connectionContext.connectionID =
      connectionContext.connectionID || crypto.randomUUID();

    buffer = connectionContext.bufferInput;

    let bufferIndex = buffer.indexOf(packageTermination);
    while (bufferIndex > -1) {
      const pkg = buffer.subarray(0, bufferIndex + packageTermination.length);
      buffer = buffer.subarray(bufferIndex + packageTermination.length);
      bufferIndex = buffer.indexOf(packageTermination);

      console.log(pkg);
      makeServiceRequest(connectionContext.connectionID, serviceURL, pkg).then(
        function (data) {
          console.log(Buffer.concat([data]));

          conn.write(data);
        }
      );
    }
  }
});
