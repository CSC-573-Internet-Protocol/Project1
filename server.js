import http from "http";
import fs from "fs";
import path from "path";
const __dirname = path.resolve();

const PORT = 3002;
const server = http.createServer((req, res) => {
  if (req.method !== "GET") {
    res.writeHead(404, { "Content-Type": "text/plain" });
    return res.end("Method not Supported");
  }
  const filePath = path.join(__dirname, "Data files", req.url.substring(1));
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.log(err);
      res.writeHead(500, { "Content-Type": "text/plain" });
      return res.end("Internal server error");
    }
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end(data);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Listening to the server on port ${PORT}`);
});
