import WebTorrent from "webtorrent";
import path from "path";

// Configuration
const dataFilesDirectory = "Data files"; // Relative or absolute path to the Data files directory
const files = {
  A_10kB: { size: "10kB", repetitions: 333 },
  A_100kB: { size: "100kB", repetitions: 33 },
  A_1MB: { size: "1MB", repetitions: 3 },
  A_10MB: { size: "10MB", repetitions: 1 },
};

async function runBitTorrentExperiment(fileName, repetitions) {
  const filePath = path.join(dataFilesDirectory, fileName); // Updated file path
  console.log(`Starting experiment: ${fileName}, ${repetitions} repetitions`);

  for (let i = 0; i < repetitions; i++) {
    console.log(`  Repetition ${i + 1} of ${repetitions}`);

    try {
      const client = new WebTorrent();

      // Seed the file on the initial peer
      const torrent = client.seed(
        filePath,
        { path: dataFilesDirectory },
        (torrent) => {
          // Updated seed path
          console.log(`Torrent seeded: ${torrent.magnetURI}`);

          // Download the file on the other peers (simulated in this single process)
          const downloadPromises = [];
          for (let j = 0; j < 3; j++) {
            // Simulate 3 peers
            downloadPromises.push(
              new Promise((resolve, reject) => {
                client.add(
                  torrent.magnetURI,
                  { path: dataFilesDirectory },
                  (downloadTorrent) => {
                    // Updated download path
                    downloadTorrent.on("done", () => {
                      console.log(`    Peer ${j + 1} downloaded ${fileName}`);
                      resolve();
                    });
                    downloadTorrent.on("error", (err) => {
                      console.error(`Peer ${j + 1} download error:`, err);
                      reject(err);
                    });
                  }
                );
              })
            );
          }

          Promise.all(downloadPromises)
            .then(() => {
              console.log(`    Transfer completed.`);
              client.destroy(() => {
                console.log("Client destroyed, next repetition");
              });
            })
            .catch((err) => {
              console.error("Download failure", err);
              client.destroy();
            });
        }
      );

      //wait for torrent seed to finish before continuing. This is a hacky way to prevent the program from continuing before the seed is ready.
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (error) {
      console.error(`    Transfer failed: ${error}`);
    }
  }

  console.log(`Experiment completed: ${fileName}, ${repetitions} repetitions`);
}

async function runExperiments() {
  for (const fileName in files) {
    const { repetitions } = files[fileName];
    await runBitTorrentExperiment(fileName, repetitions);
  }
  console.log("All experiments completed.");
}

runExperiments();
