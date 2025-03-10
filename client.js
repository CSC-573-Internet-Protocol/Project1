import http from "http";
import { getStats } from "./statistics.js";

const fetchFile = async (fileData) => {
  const { path, transmissions } = fileData;
  return new Promise((resolve, reject) => {
    const start = process.hrtime.bigint();
    const request = http.request(
      {
        hostname: "192.168.1.118",
        port: 3002,
        path: path,
        method: "GET",
      },
      (res) => {
        let data = "";
        let headersSize = 0;

        for (const [key, value] of Object.entries(res.headers)) {
          headersSize += Buffer.byteLength(key) + Buffer.byteLength(value);
        }

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          if (res.statusCode === 200) {
            const end = process.hrtime.bigint();
            fileData.totalAppLayerBytes = headersSize + Buffer.byteLength(data);
            const duration = Number(end - start) / 1e6;
            transmissions.push(fileData.size / duration);
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
    path: "/B_10kB",
    iterations: 1000,
    transmissions: [],
    totalAppLayerBytes: 0,
    size: 10,
  },
  {
    path: "/B_100kB",
    iterations: 100,
    transmissions: [],
    totalAppLayerBytes: 0,
    size: 100,
  },
  {
    path: "/B_1MB",
    iterations: 10,
    transmissions: [],
    totalAppLayerBytes: 0,
    size: 1000,
  },
  {
    path: "/B_10MB",
    iterations: 1,
    transmissions: [],
    totalAppLayerBytes: 0,
    size: 10000,
  },
];

await apiCalls();
getStats(configureations);

console.log(
  "Filename ---- mean throughput ---- STD deviation ---- totalApplication layer bytes"
);
for (const item of configureations) {
  console.log(
    item.path +
      "----" +
      item.mean +
      "----" +
      item.stddev +
      "----" +
      item.totalAppLayerBytes
  );
}
