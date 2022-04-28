export const toTwoDData = (args) => {
  const { imgdata, w, h } = args;
  //array[height][width];

  const twoDData = [];

  for (let y = 0; y < h; y += 1) {
    const row = [];
    for (let x = 0; x < w; x += 1) {
      let r = imgdata[y * w * 4 + x * 4];
      let g = imgdata[y * w * 4 + x * 4 + 1];
      let b = imgdata[y * w * 4 + x * 4 + 2];
      let a = imgdata[y * w * 4 + x * 4 + 3];

      row.push(r);
      row.push(g);
      row.push(b);
      row.push(a);
    }
    twoDData.push(row);
  }
  return twoDData;
};

export const findFirstSeam = (args) => {
  const { twoDData } = args;
  const initialEnergyMap = createEnergyMap(twoDData);

  const totalEnergyMap = calculateTotalEnergy(initialEnergyMap);

  const lowestSeam = findLowestSeam(totalEnergyMap);

  return { lowestSeam, totalEnergyMap, initialEnergyMap };
};

export const findNextSeam = (energyMap) => {
  const totalEnergyMap = calculateTotalEnergy(energyMap);

  const lowestSeam = findLowestSeam(totalEnergyMap);

  let nextEnergyMap = totalEnergyMap;
  let nextLowestSeam = lowestSeam;

  return { nextLowestSeam, nextEnergyMap, energyMap };
};

const createEnergyMap = (data) => {
  const energyMap = [];
  for (let y = 0; y < data.length; y += 1) {
    let row = [];
    for (let x = 0; x < data[0].length; x += 4) {
      let energy = 0;
      try {
        let deltaX =
          Math.pow(data[y][x - 4] - data[y][x + 4], 2) +
          Math.pow(data[y][x - 3] - data[y][x + 5], 2) +
          Math.pow(data[y][x - 2] - data[y][x + 6], 2) +
          Math.pow(data[y][x - 1] - data[y][x + 7], 2);

        let deltaY =
          Math.pow(data[y - 1][x] - data[y + 1][x], 2) +
          Math.pow(data[y - 1][x + 1] - data[y + 1][x + 1], 2) +
          Math.pow(data[y - 1][x + 2] - data[y + 1][x + 2], 2) +
          Math.pow(data[y - 1][x + 3] - data[y + 1][x + 3], 2);

        energy = deltaX + deltaY;
      } catch {}

      if (isNaN(energy)) {
        energy = Infinity;
      }
      row.push(energy);
    }
    energyMap.push(row);
  }
  return energyMap;
};

const calculateTotalEnergy = (energyMap) => {
  const newMap = energyMap;
  for (let y = newMap.length - 2; y >= 0; y -= 1) {
    for (let x = 0; x < newMap[0].length; x += 1) {
      if (x === 0) {
        newMap[y][x] =
          newMap[y][x] + Math.min(newMap[y + 1][x], newMap[y + 1][x + 1]);
      } else if (x === newMap[0].length - 1) {
        newMap[y][x] =
          newMap[y][x] + Math.min(newMap[y + 1][x], newMap[y + 1][x - 1]);
      } else {
        newMap[y][x] =
          newMap[y][x] +
          Math.min(
            newMap[y + 1][x - 1],
            newMap[y + 1][x],
            newMap[y + 1][x + 1]
          );
      }
    }
  }
  return newMap;
};

const findLowestSeam = (totalEnergyMap) => {
  let min = Infinity;
  let minIndex = 0;

  const xIndices = [];

  for (let x = 0; x < totalEnergyMap[0].length; x += 1) {
    if (totalEnergyMap[0][x] < min) {
      min = totalEnergyMap[0][x];
      minIndex = x;
    }
  }

  xIndices.push(minIndex);

  let y = 1;
  while (y < totalEnergyMap.length) {
    let minimumValue = Math.min(
      totalEnergyMap[y][minIndex],
      totalEnergyMap[y][minIndex + 1],
      totalEnergyMap[y][minIndex - 1]
    );
    let nextIndex =
      totalEnergyMap[y][minIndex] === minimumValue
        ? minIndex
        : totalEnergyMap[y][minIndex + 1] === minimumValue
        ? minIndex + 1
        : minIndex - 1;
    xIndices.push(nextIndex);
    minIndex = nextIndex;
    y += 1;
  }
  return xIndices;
};

export const drawSeam = (args) => {
  const { lowestSeam, data, w } = args;

  for (let y = 0; y < lowestSeam.length; y += 1) {
    data[y * w * 4 + lowestSeam[y] * 4] = 255;
    data[y * w * 4 + lowestSeam[y] * 4 + 1] = 0;
    data[y * w * 4 + lowestSeam[y] * 4 + 2] = 0;
    data[y * w * 4 + lowestSeam[y] * 4 + 3] = 255;
  }
  return data;
};

export const removeSeam = (args) => {
  const { twoDData, lowestSeam, totalEnergyMap } = args;
  let dataWithRemovedSeam = [];
  for (let y = 0; y < lowestSeam.length; y += 1) {
    //totalEnergyMap[y].splice([lowestSeam[y]], 1);
    //totalEnergyMap[y].push(Infinity);

    twoDData[y].splice(lowestSeam[y] * 4, 4);

    let max = 255;
    let min = 0;
    twoDData[y].push(Math.floor(Math.random() * (max - min + 1) + min));
    twoDData[y].push(Math.floor(Math.random() * (max - min + 1) + min));
    twoDData[y].push(Math.floor(Math.random() * (max - min + 1) + min));
    twoDData[y].push(0);
    dataWithRemovedSeam.push(...twoDData[y]);
  }
  const nextenergy = totalEnergyMap;
  const nexttwoD = twoDData;

  return { dataWithRemovedSeam, nextenergy, nexttwoD };
};
