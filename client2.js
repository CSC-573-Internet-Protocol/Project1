import http2 from "http2";
import { getStats } from "./statistics.js";

let client = http2.connect("http://localhost:3002", { keepAlive: true });

const fetchFile = async (fileData) => {
  const { path, transmissions } = fileData;
  return new Promise((resolve, reject) => {
    if (client.closed) {
      client = http2.connect("http://localhost:3002", { keepAlive: true });
    }

    const req = client.request({ ":path": path });
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
      fileData.totalAppLayerbits = data.length;
      resolve();
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
  for (const item of configurations) {
    await fetchFiles(item);
  }
  client.close();
};

const configurations = [
  {
    path: "/A_10kB",
    iterations: 1000,
    transmissions: [],
    totalAppLayerbits: 0,
  },
  {
    path: "/A_100kB",
    iterations: 100,
    transmissions: [],
    totalAppLayerbits: 0,
  },
  { path: "/A_1MB", iterations: 10, transmissions: [], totalAppLayerbits: 0 },
  { path: "/A_10MB", iterations: 1, transmissions: [], totalAppLayerbits: 0 },
];

await apiCalls();
getStats(configurations);
console.log(configurations);
