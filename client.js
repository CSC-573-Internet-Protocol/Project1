import http from "http";

const fetchFile = async (filePath) => {
  const options = {
    hostname: "localhost",
    port: 3002,
    path: filePath,
    method: "GET",
  };
  // console.log(options);
  const start = new Date().getTime();
  const request = http.request(options, (res) => {
    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      if (res.statusCode === 200) {
        //end here
        const end = new Date().getTime();
        console.log(
          `File ${options.path} received successfully ${
            data.length / 1024
          } kB took ${end - start} milliseconds`
        );
      } else {
        console.log(res.statusCode, res.statusMessage);
      }
    });
  });

  request.on("error", (error) => {
    console.log(`Request failed ${error}`);
  });

  request.end();
};

const configureations = [
  { path: "/A_10kB", iterations: 1000 },
  { path: "/A_100kB", iterations: 100 },
  { path: "/A_1MB", iterations: 10 },
  { path: "/A_10MB", iterations: 1 },
];

for (const item of configureations) {
  for (let i = 0; i < item.iterations; i++) {
    //start here
    await fetchFile(item.path);
  }
}
