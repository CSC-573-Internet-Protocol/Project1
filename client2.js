import http2 from "http2";

const fetchFile = async (filePath) => {
  const client = http2.connect("http://localhost:3002");

  const req = client.request({ ":path": filePath });

  let data = "";
  const start = new Date().getTime();

  req.on("data", (chunk) => {
    data += chunk;
  });

  req.on("end", () => {
    const end = new Date().getTime();
    console.log(
      `File ${filePath} received successfully ${data.length / 1024} kB took ${
        end - start
      } milliseconds`
    );
    client.close();
  });

  req.on("error", (error) => {
    console.log(`Request failed ${error}`);
  });

  req.end();
};

const configureations = [
  { path: "/A_10kB", iterations: 1000 },
  { path: "/A_100kB", iterations: 100 },
  { path: "/A_1MB", iterations: 10 },
  { path: "/A_10MB", iterations: 1 },
];

(async () => {
  for (const item of configureations) {
    for (let i = 0; i < item.iterations; i++) {
      await fetchFile(item.path);
    }
  }
})();
