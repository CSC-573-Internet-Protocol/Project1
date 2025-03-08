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
        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          if (res.statusCode === 200) {
            const end = process.hrtime.bigint();
            fileData.totalAppLayerBits = data.length;
            const duration = Number(end - start) / 1e6;
            const throughputInKbps = fileData.size / duration;
            transmissions.push(throughputInKbps);
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
    totalAppLayerBits: 0,
    size: 10,
  },
  {
    path: "/B_100kB",
    iterations: 100,
    transmissions: [],
    totalAppLayerBits: 0,
    size: 100,
  },
  {
    path: "/B_1MB",
    iterations: 10,
    transmissions: [],
    totalAppLayerBits: 0,
    size: 1000,
  },
  {
    path: "/B_10MB",
    iterations: 1,
    transmissions: [],
    totalAppLayerBits: 0,
    size: 10000,
  },
];

await apiCalls();
getStats(configureations);

console.log(
  "Filename ---- mean thgroughput ---- STD deviation ---- totalApplication layer bits"
);
for (const item of configureations) {
  console.log(
    item.path +
      "----" +
      item.mean +
      "----" +
      item.stddev +
      "----" +
      item.totalAppLayerBits
  );
}
