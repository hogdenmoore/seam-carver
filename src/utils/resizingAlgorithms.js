//vertical stuff

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

export const findFirstVerticalSeam = (args) => {
  const { twoDData } = args;
  const energyMap = createEnergyMap(twoDData);

  const totalEnergyMap = calculateTotalEnergyV(energyMap);

  const lowestSeam = findLowestVerticalSeam(totalEnergyMap);

  return { lowestSeam, energyMap };
};

export const findNextVerticalSeam = (energyMap) => {
  const totalEnergyMap = calculateTotalEnergyV(energyMap);

  const lowestSeam = findLowestVerticalSeam(totalEnergyMap);

  let energyMapToReturn = totalEnergyMap;
  let nextLowestSeam = lowestSeam;

  return { nextLowestSeam, energyMapToReturn };
};

const createEnergyMap = (data) => {
  const energyMap = [];

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

const calculateTotalEnergyV = (energyMap) => {
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

const findLowestVerticalSeam = (totalEnergyMap) => {
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
    if (minIndex === 0) {
      minIndex += 1;
    }
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
    if (minIndex === 0) {
      minIndex += 1;
    }
    xIndices.push(nextIndex);
    minIndex = nextIndex;
    y += 1;
  }

  return xIndices;
};

export const drawVerticalSeam = (args) => {
  const { lowestSeam, data, w } = args;

  for (let y = 0; y < lowestSeam.length; y += 1) {
    data[y * w * 4 + lowestSeam[y] * 4] = 255;
    data[y * w * 4 + lowestSeam[y] * 4 + 1] = 0;
    data[y * w * 4 + lowestSeam[y] * 4 + 2] = 0;
    data[y * w * 4 + lowestSeam[y] * 4 + 3] = 255;
  }
  return data;
};

export const removeVerticalSeam = (args) => {
  const { twoDData, lowestSeam, energyMap, w } = args;

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

  for (let y = 0; y < lowestSeam.length; y += 1) {
    for (let x = lowestSeam[y]; x < w - 1; x += 1) {
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
    energyMap[y][x] = [energy, energy];
  }
  return energyMap;
};

//Horizontal Stuff

export const findFirstHorizontalSeam = (args) => {
  const { twoDDataH: twoDData } = args;

  const energyMap = createEnergyMapH(twoDData);

  const totalEnergyMap = calculateTotalEnergyH(energyMap);

  const lowestSeam = findLowestHorizontalSeam(totalEnergyMap);

  let lowestSeamH = lowestSeam;
  let energyMapH = energyMap;

  return { lowestSeamH, energyMapH };
};

export const findNextHorizontalSeam = (energyMap) => {
  const one = 1;
  const totalEnergyMap = calculateTotalEnergyH(energyMap, 1);

  const lowestSeam = findLowestHorizontalSeam(totalEnergyMap);
  let energyMapToReturn = totalEnergyMap;
  let nextLowestSeam = lowestSeam;

  return { nextLowestSeam, energyMapToReturn };
};

export const calculateTotalEnergyH = (energyMap, one) => {
  let newMap = energyMap;

  for (let x = newMap[0].length - 2; x >= 0; x -= 1) {
    for (let y = 0; y < newMap.length; y += 1) {
      if (y === 0) {
        newMap[y][x][1] =
          newMap[y][x][0] +
          Math.min(newMap[y + 1][x + 1][1], newMap[y][x + 1][1]);
      } else if (y === newMap.length - 1) {
        newMap[y][x][1] =
          newMap[y][x][0] +
          Math.min(newMap[y - 1][x + 1][1], newMap[y][x + 1][1]);
      } else {
        newMap[y][x][1] =
          newMap[y][x][0] +
          Math.min(
            newMap[y - 1][x + 1][1],
            newMap[y][x + 1][1],
            newMap[y + 1][x + 1][1]
          );
      }
    }
  }

  return newMap;
};

export const findLowestHorizontalSeam = (totalEnergyMap) => {
  let min = Infinity;
  let minIndex = 0;

  const yIndices = [];

  for (let y = 0; y < totalEnergyMap.length; y += 1) {
    if (totalEnergyMap[y][0][1] < min) {
      min = totalEnergyMap[y][0][1];
      minIndex = y;
    }
  }
  if (minIndex === 0) {
    minIndex += 1;
  }
  yIndices.push(minIndex);
  let x = 1;

  while (x < totalEnergyMap[0].length) {
    if (minIndex === 0) {
      minIndex += 1;
    }

    let minimumValue = Math.min(
      totalEnergyMap[minIndex][x][1],
      totalEnergyMap[minIndex + 1][x][1],
      totalEnergyMap[minIndex - 1][x][1]
    );

    let nextIndex =
      totalEnergyMap[minIndex][x][1] === minimumValue
        ? minIndex
        : totalEnergyMap[minIndex + 1][x][1] === minimumValue
        ? minIndex + 1
        : minIndex - 1;
    if (minIndex === 0) {
      minIndex += 1;
    }
    yIndices.push(nextIndex);
    minIndex = nextIndex;
    x += 1;
  }
  return yIndices;
};

export const drawHorizontalSeam = (args) => {
  const { lowestSeam, data, newWidth, w } = args;

  for (let x = 0; x < newWidth; x += 1) {
    data[lowestSeam[x] * w * 4 + x * 4] = 255;
    data[lowestSeam[x] * w * 4 + x * 4 + 1] = 0;
    data[lowestSeam[x] * w * 4 + x * 4 + 2] = 0;
    data[lowestSeam[x] * w * 4 + x * 4 + 3] = 255;
  }
  return data;
};

export const removeHorizontalSeam = (args) => {
  const { lowestSeam, twoDData, energyMap, h } = args;

  for (let x = 0; x < lowestSeam.length; x += 1) {
    for (let y = lowestSeam[x]; y < twoDData.length; y += 1) {
      if (y === twoDData.length - 1) {
        let max = 255;
        let min = 0;
        twoDData[y][x * 4] = Math.floor(Math.random() * (max - min + 1) + min);
        twoDData[y][x * 4 + 1] = Math.floor(
          Math.random() * (max - min + 1) + min
        );
        twoDData[y][x * 4 + 2] = Math.floor(
          Math.random() * (max - min + 1) + min
        );
        twoDData[y][x * 4 + 3] = 0;
      } else {
        twoDData[y][x * 4] = twoDData[y + 1][x * 4];
        twoDData[y][x * 4 + 1] = twoDData[y + 1][x * 4 + 1];
        twoDData[y][x * 4 + 2] = twoDData[y + 1][x * 4 + 2];
        twoDData[y][x * 4 + 3] = twoDData[y + 1][x * 4 + 3];
      }
    }
  }
  let dataWithRemovedSeam = [];
  for (let y = 0; y < twoDData.length; y += 1) {
    dataWithRemovedSeam.push(...twoDData[y]);
  }
  const nexttwoD = twoDData;

  let nextEnergyMap = recalculateEnergyMapH({
    nexttwoD,
    energyMap,
    lowestSeam,
    h,
  });

  return { nextEnergyMap, dataWithRemovedSeam, nexttwoD };
};

export const recalculateEnergyMapH = (args) => {
  let { nexttwoD: data, energyMap, lowestSeam, h } = args;

  for (let x = 0; x < lowestSeam.length; x += 1) {
    for (let y = lowestSeam[x]; y < h - 1; y += 1) {
      energyMap[y][x] = energyMap[y + 1][x];
    }
  }
  for (let x = 0; x < lowestSeam.length; x += 1) {
    let y = lowestSeam[x];

    let energy = 0;
    if (x == 0 || x == lowestSeam.length - 1) {
      energy = 100000;
    } else {
      let deltaX =
        Math.pow(data[y][x * 4 - 4] - data[y][x * 4 + 4], 2) +
        Math.pow(data[y][x * 4 - 3] - data[y][x * 4 + 5], 2) +
        Math.pow(data[y][x * 4 - 2] - data[y][x * 4 + 6], 2) +
        Math.pow(data[y][x * 4 - 1] - data[y][x * 4 + 7], 2);
      let deltaY = 0;
      if (y != 0) {
        deltaY =
          Math.pow(data[y - 1][x * 4] - data[y + 1][x * 4], 2) +
          Math.pow(data[y - 1][x * 4 + 1] - data[y + 1][x * 4 + 1], 2) +
          Math.pow(data[y - 1][x * 4 + 2] - data[y + 1][x * 4 + 2], 2) +
          Math.pow(data[y - 1][x * 4 + 3] - data[y + 1][x * 4 + 3], 2);
      }
      energy = deltaX + deltaY;
    }
    energyMap[y][x] = [energy, energy];
  }
  return energyMap;
};

export const createEnergyMapH = (data) => {
  const energyMap = [];
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
      if (x === data[0].length - 4) {
        row.push([energy, energy]);
      } else {
        row.push([energy, 0]);
      }
    }
    energyMap.push(row);
  }
  return energyMap;
};
