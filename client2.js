import http2 from "http2";
import { getStats } from "./statistics.js";

let client = http2.connect("http://192.168.1.118:3002", { keepAlive: true });

const fetchFile = async (fileData) => {
  const { path, transmissions } = fileData;
  return new Promise((resolve, reject) => {
    if (client.closed) {
      client = http2.connect("http://192.168.1.118:3002", { keepAlive: true });
    }

    const req = client.request({ ":path": path });
    let data = "";
    const start = process.hrtime.bigint();
    req.setEncoding("utf8");

    req.on("response", (headers) => {
      let headersSize = 0;
      for (const [key, value] of Object.entries(headers)) {
        headersSize +=
          Buffer.byteLength(String(key)) + Buffer.byteLength(String(value));
      }

      req.on("data", (chunk) => {
        data += chunk;
      });

      req.on("end", () => {
        const end = process.hrtime.bigint();
        const totalAppLayerData = headersSize + Buffer.byteLength(data);
        fileData.totalAppLayerBytes = totalAppLayerData;
        const duration = Number(end - start) / 1e6;
        const throughputInKbps = (fileData.size * 8) / duration;
        transmissions.push(throughputInKbps);
        resolve();
      });
    });

    req.on("error", (error) => {
      console.error(`Request failed: ${error}`);
      reject(error);
    });

    req.end();
  });
};

const fetchFiles = async (fileData) => {
  const { path, iterations } = fileData;
  for (let i = 0; i < iterations; i++) {
    try {
      await fetchFile(fileData);
    } catch (error) {
      console.error(`Error fetching ${path} (iteration ${i}):`, error);
    }
  }
};

const apiCalls = async () => {
  for (const item of configureations) {
    await fetchFiles(item);
  }
  client.close();
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
