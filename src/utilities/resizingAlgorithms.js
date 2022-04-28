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
  const energyMap = createEnergyMap(twoDData);

  const totalEnergyMap = calculateTotalEnergy(energyMap);

  const lowestSeam = findLowestSeam(totalEnergyMap);

  return { lowestSeam, energyMap };
};

export const findNextSeam = (energyMap) => {
  const totalEnergyMap = calculateTotalEnergy(energyMap);

  const lowestSeam = findLowestSeam(totalEnergyMap);

  let energyMapToReturn = totalEnergyMap;
  let nextLowestSeam = lowestSeam;

  return { nextLowestSeam, energyMapToReturn };
};

const createEnergyMap = (data) => {
  const energyMap = [];
  let count = 0;
  for (let y = 0; y < data.length; y += 1) {
    let row = [];
    for (let x = 0; x < data[0].length; x += 4) {
      let energy = 0;
      if (x == 0 || x == data[0].length - 4 || y == 0 || y == data.length - 1) {
        energy = 100000;
      } else {
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
      }
      if (y == data.length - 1) {
        row.push([energy, energy]);
      } else {
        row.push([energy, 0]);
      }
    }
    energyMap.push(row);
  }

  return energyMap;
};

const calculateTotalEnergy = (energyMap) => {
  let newMap = energyMap;

  for (let y = newMap.length - 2; y >= 0; y -= 1) {
    for (let x = 0; x < newMap[0].length; x += 1) {
      if (x === 0) {
        newMap[y][x][1] =
          newMap[y][x][0] +
          Math.min(newMap[y + 1][x][1], newMap[y + 1][x + 1][1]);
      } else if (x === newMap[1].length - 1) {
        newMap[y][x][1] =
          newMap[y][x][0] +
          Math.min(newMap[y + 1][x][1], newMap[y + 1][x - 1][1]);
      } else {
        newMap[y][x][1] =
          newMap[y][x][0] +
          Math.min(
            newMap[y + 1][x - 1][1],
            newMap[y + 1][x][1],
            newMap[y + 1][x + 1][1]
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
    if (totalEnergyMap[0][x][1] < min) {
      min = totalEnergyMap[0][x][1];
      minIndex = x;
    }
  }
  xIndices.push(minIndex);
  let y = 1;

  while (y < totalEnergyMap.length) {
    let minimumValue = Math.min(
      totalEnergyMap[y][minIndex][1],
      totalEnergyMap[y][minIndex + 1][1],
      totalEnergyMap[y][minIndex - 1][1]
    );

    let nextIndex =
      totalEnergyMap[y][minIndex][1] === minimumValue
        ? minIndex
        : totalEnergyMap[y][minIndex + 1][1] === minimumValue
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
  const { twoDData, lowestSeam, energyMap, w } = args;
  console.log(w);

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

  const nexttwoD = twoDData;

  let nextEnergyMap = recalculateEnergyMap({
    nexttwoD,
    energyMap,
    lowestSeam,
    w,
  });

  return { dataWithRemovedSeam, nexttwoD, nextEnergyMap };
};

export const recalculateEnergyMap = (args) => {
  const { energyMap, lowestSeam, w, nexttwoD: data } = args;

  const dimensions = [energyMap.length, energyMap[0].length];

  const dimensions2 = [data.length, data[0].length];

  for (let y = 0; y < lowestSeam.length; y++) {
    for (let x = lowestSeam[y]; x < w - 1; x++) {
      energyMap[y][x] = energyMap[y][x + 1];
    }

    let x = lowestSeam[y];

    let energy = 0;
    if (y == 0 || y == lowestSeam.length - 1) {
      energy = 100000;
    } else {
      let deltaX =
        Math.pow(data[y][x * 4 - 4] - data[y][x * 4 + 4], 2) +
        Math.pow(data[y][x * 4 - 3] - data[y][x * 4 + 5], 2) +
        Math.pow(data[y][x * 4 - 2] - data[y][x * 4 + 6], 2) +
        Math.pow(data[y][x * 4 - 1] - data[y][x * 4 + 7], 2);

      let deltaY =
        Math.pow(data[y - 1][x * 4] - data[y + 1][x * 4], 2) +
        Math.pow(data[y - 1][x * 4 + 1] - data[y + 1][x * 4 + 1], 2) +
        Math.pow(data[y - 1][x * 4 + 2] - data[y + 1][x * 4 + 2], 2) +
        Math.pow(data[y - 1][x * 4 + 3] - data[y + 1][x * 4 + 3], 2);

      energy = deltaX + deltaY;
    }
    energyMap[y][x] = [energy, 0];
  }

  return energyMap;
};
