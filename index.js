const argv = require("minimist")(process.argv.slice(2));

const serviceURL = argv.serviceURL;
const servicePort = argv.servicePort;
const packageTermination = Buffer.from("\x0D\x0A");

const net = require("node:net");
const crypto = require("node:crypto");
const { makeServiceRequest } = require("./src/http");

const server = net.createServer();

server.on("connection", handleConnection);

server.listen(servicePort, function () {
  console.log('server listening to %j', server.address())
})

function handleConnection (conn) {
  const connectionID = crypto.randomUUID()
  let buffer = Buffer.alloc(0)

  const remoteAddress = conn.remoteAddress + ':' + conn.remotePort
  console.log('new client connection from %s', remoteAddress)
  conn.on('data', onConnData)
  conn.once('close', onConnClose)
  conn.on('error', onConnError)

  function onConnData (data) {
    buffer = Buffer.concat([buffer, data])

    let bufferIndex = buffer.indexOf(packageTermination)
    while (bufferIndex > -1) {
      const pkg = buffer.subarray(0, bufferIndex + packageTermination.length)
      buffer = buffer.subarray(bufferIndex + packageTermination.length)
      bufferIndex = buffer.indexOf(packageTermination)

      console.log(pkg)
      makeServiceRequest(connectionID,serviceURL, pkg).then(
        function (data) {
          console.log(Buffer.concat([data]))

          conn.write(data)
        }
      )
    }
  }

  function onConnClose () {
    console.log('connection from %s closed', remoteAddress)
  }

  function onConnError (err) {
    console.log('Connection %s error: %s', remoteAddress, err.message)
  }
}
