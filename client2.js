import http2 from "http2";
import { getStats } from "./statistics.js";

const fetchFile = async (filePath, transmissions) => {
  return new Promise((resolve, reject) => {
    const client = http2.connect("http://localhost:3002");
    const req = client.request({ ":path": filePath });

    let data = "";
    const start = process.hrtime.bigint();
    req.setEncoding("utf8");

    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1e6;
      transmissions.push(duration);
      client.close();
      resolve();
    });

    req.on("error", (error) => {
      console.log(`Request failed: ${error}`);
      client.close();
      reject(error);
    });

    req.end();
  });
};

const fetchFiles = async ({ path, iterations, transmissions }) => {
  for (let i = 0; i < iterations; i++) {
    await fetchFile(path, transmissions);
  }
};

const apiCalls = async () => {
  for (const item of configureations) {
    await fetchFiles(item);
  }
};

const configureations = [
  { path: "/A_10kB", iterations: 1000, transmissions: [] },
  { path: "/A_100kB", iterations: 100, transmissions: [] },
  { path: "/A_1MB", iterations: 10, transmissions: [] },
  { path: "/A_10MB", iterations: 1, transmissions: [] },
];

await apiCalls();
getStats(configureations);
console.log(configureations);
