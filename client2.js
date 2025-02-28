import http2 from "http2";
import { getStats } from "./statistics.js";

let client = http2.connect("http://localhost:3002", { keepAlive: true });

const fetchFile = async (filePath, transmissions) => {
  return new Promise((resolve, reject) => {
    if (client.closed) {
      client = http2.connect("http://localhost:3002", { keepAlive: true });
    }

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
      resolve();
    });

    req.on("error", (error) => {
      console.error(`Request failed: ${error}`);
      reject(error);
    });

    req.end();
  });
};

const fetchFiles = async ({ path, iterations, transmissions }) => {
  for (let i = 0; i < iterations; i++) {
    try {
      await fetchFile(path, transmissions);
    } catch (error) {
      console.error(`Error fetching ${path} (iteration ${i}):`, error);
    }
  }
};

const apiCalls = async () => {
  for (const item of configurations) {
    await fetchFiles(item);
  }

  // Close the client only after all requests are done
  client.close();
};

const configurations = [
  { path: "/A_10kB", iterations: 1000, transmissions: [] },
  { path: "/A_100kB", iterations: 100, transmissions: [] },
  { path: "/A_1MB", iterations: 10, transmissions: [] },
  { path: "/A_10MB", iterations: 1, transmissions: [] },
];

await apiCalls();
getStats(configurations);
console.log(configurations);
