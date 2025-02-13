//calculate average
export const getStats = (config) => {
  //   console.log(configureations);
  for (let i = 0; i < config.length; i++) {
    const { stdDev, mean } = getDeviationAndMean(config[i].transmissions);
    config[i]["mean"] = mean;
    config[i]["stddev"] = stdDev;
  }
};

//calculate standard deviation
const getDeviationAndMean = (data) => {
  const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
  const variance =
    data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
    data.length;
  const stdDev = Math.sqrt(variance);
  return { stdDev, mean };
};
