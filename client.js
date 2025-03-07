import http from "http";
import { getStats } from "./statistics.js";

const fetchFile = async (fileData) => {
  const { path, transmissions } = fileData;
  return new Promise((resolve, reject) => {
    const start = process.hrtime.bigint();
    const request = http.request(
      {
        hostname: "localhost",
        port: 3002,
        path: path,
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
            fileData.totalAppLayerBits = data.length;
            const duration = Number(end - start) / 1e6;
            transmissions.push(duration);
            resolve();
          } else {
            console.log(res.statusCode, res.statusMessage);
            reject(new Error(`Failed to fetch ${path}`));
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

const fetchFiles = async (fileData) => {
  const { iterations } = fileData;
  for (let i = 0; i < iterations; i++) {
    await fetchFile(fileData);
  }
};

const apiCalls = async () => {
  for (const item of configureations) {
    await fetchFiles(item);
  }
};

const configureations = [
  {
    path: "/A_10kB",
    iterations: 1000,
    transmissions: [],
    totalAppLayerBits: 0,
  },
  {
    path: "/A_100kB",
    iterations: 100,
    transmissions: [],
    totalAppLayerBits: 0,
  },
  { path: "/A_1MB", iterations: 10, transmissions: [], totalAppLayerBits: 0 },
  { path: "/A_10MB", iterations: 1, transmissions: [], totalAppLayerBits: 0 },
];

await apiCalls();
getStats(configureations);
console.log(configureations);
