import http from "http";
import { getStats } from "./statistics.js";

const fetchFile = async (filePath, transmissions) => {
  return new Promise((resolve, reject) => {
    const start = process.hrtime.bigint();
    const request = http.request(
      {
        hostname: "localhost",
        port: 3002,
        path: filePath,
        method: "GET",
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          if (res.statusCode === 200) {
            const end = process.hrtime.bigint();
            const duration = Number(end - start) / 1e6;
            transmissions.push(duration);
            resolve();
          } else {
            console.log(res.statusCode, res.statusMessage);
            reject(new Error(`Failed to fetch ${filePath}`));
          }
        });
      }
    );

    request.on("error", (error) => {
      console.log(`Request failed ${error}`);
      reject(error);
    });

    request.end();
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
