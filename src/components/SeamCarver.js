import "../styles/SeamCarver.css";
import { useState, useEffect, useRef } from "react";
import NavBar from "./NavBar";
import WorkingImage from "./WorkingImage";
import WorkingCanvas from "./WorkingCanvas";
import initialImage from "../balloons.jpg";
import {
  findFirstVerticalSeam,
  findNextVerticalSeam,
  findFirstHorizontalSeam,
  findNextHorizontalSeam,
  drawHorizontalSeam,
  toTwoDData,
  drawVerticalSeam,
  removeVerticalSeam,
  removeHorizontalSeam,
} from "../utils/resizingAlgorithms";
import { wait } from "../utils/wait";

const SeamCarver = () => {
  const defaultWidthScale = 50;
  const defaultHeightScale = 50;

  const [initialImg, setInitialImg] = useState(null);
  const [imageSize, setImageSize] = useState("imgLarge");
  const [canvasStaging, setCanvasStaging] = useState(false);
  const [toWidthScale, setToWidthScale] = useState(defaultWidthScale);
  const [toHeightScale, setToHeightScale] = useState(defaultHeightScale);

  const imgRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    function updateSize() {
      setCanvasStaging(false);
    }
    window.addEventListener("resize", updateSize);
    return () => {
      window.removeEventListener("resize", updateSize);
      setCanvasStaging(true);
    };
  });

  const onPictureClick = async () => {
    setInitialImg(initialImage);
    setCanvasStaging(true);
  };

  const resize = async () => {
    setInitialImg(null);
    const srcImg = imgRef.current;
    if (!srcImg) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const w = srcImg.width;
    const h = srcImg.height;

    canvas.width = w;
    canvas.height = h;

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }
    context.drawImage(srcImg, 0, 0, w, h);

    const newDataimg = context.getImageData(0, 0, w, h);
    let imgdata = newDataimg.data;

    let twoDData = toTwoDData({ imgdata, w, h });

    let { lowestSeam, energyMap } = findFirstVerticalSeam({ twoDData });

    const onVerticalIteration = async (
      energyMap,
      lowestSeam,
      twoDData,
      data
    ) => {
      let dataWithSeam = drawVerticalSeam({ lowestSeam, data, w, h });
      let seamImage = new ImageData(new Uint8ClampedArray(dataWithSeam), w, h);
      context.putImageData(seamImage, 0, 0, 0, 0, w, h);

      let { dataWithRemovedSeam, nexttwoD, nextEnergyMap } = removeVerticalSeam(
        {
          lowestSeam,
          twoDData,
          energyMap,
          w,
        }
      );

      await wait(1);

      let dataWithRemovedSeamImage = new ImageData(
        new Uint8ClampedArray(dataWithRemovedSeam),
        w,
        h
      );

      context.putImageData(dataWithRemovedSeamImage, 0, 0, 0, 0, w, h);
      twoDData = nexttwoD;
      let { nextLowestSeam, energyMapToReturn } =
        findNextVerticalSeam(nextEnergyMap);

      return {
        nextLowestSeam,
        energyMapToReturn,
        nexttwoD,
        dataWithRemovedSeam,
      };
    };
    let toWidth = w - Math.floor((toWidthScale * w) / 100);

    while (toWidth > 0) {
      let { nextLowestSeam, nexttwoD, dataWithRemovedSeam, energyMapToReturn } =
        await onVerticalIteration(energyMap, lowestSeam, twoDData, imgdata);
      lowestSeam = nextLowestSeam;
      twoDData = nexttwoD;
      imgdata = dataWithRemovedSeam;
      energyMap = energyMapToReturn;
      toWidth -= 1;
    }

    let newWidth = Math.floor((toWidthScale * w) / 100);

    //
    //
    //
    //

    let twoDDataH = toTwoDData({ imgdata, w, h });

    let { lowestSeamH, energyMapH } = findFirstHorizontalSeam({ twoDDataH });

    const onHorizontalIteration = async (
      energyMap,
      lowestSeam,
      twoDData,
      data
    ) => {
      let dataWithSeam = drawHorizontalSeam({ lowestSeam, data, w, newWidth });

      let seamImage = new ImageData(new Uint8ClampedArray(dataWithSeam), w, h);
      context.putImageData(seamImage, 0, 0, 0, 0, w, h);

      let { dataWithRemovedSeam, nexttwoD, nextEnergyMap } =
        removeHorizontalSeam({
          lowestSeam,
          twoDData,
          energyMap,
          h,
        });

      await wait(1);

      let dataWithRemovedSeamImage = new ImageData(
        new Uint8ClampedArray(dataWithRemovedSeam),
        w,
        h
      );

      context.putImageData(dataWithRemovedSeamImage, 0, 0, 0, 0, w, h);
      twoDData = nexttwoD;

      let { nextLowestSeam, energyMapToReturn } =
        findNextHorizontalSeam(nextEnergyMap);

      return {
        nextLowestSeam,
        energyMapToReturn,
        nexttwoD,
        dataWithRemovedSeam,
      };
    };

    let toHeight = h - Math.floor((toHeightScale * h) / 100);

    while (toHeight > 0) {
      let { nextLowestSeam, nexttwoD, dataWithRemovedSeam, energyMapToReturn } =
        await onHorizontalIteration(
          energyMapH,
          lowestSeamH,
          twoDDataH,
          imgdata
        );
      lowestSeamH = nextLowestSeam;
      twoDDataH = nexttwoD;
      imgdata = dataWithRemovedSeam;
      energyMapH = energyMapToReturn;
      toHeight -= 1;
    }
  };

  const onFinish = () => {};

  const navbar = (
    <NavBar createCanvas={resize} onPictureClick={onPictureClick}></NavBar>
  );

  const originalImage = initialImg ? (
    <WorkingImage>
      <img className={imageSize} ref={imgRef} src={initialImg} />
    </WorkingImage>
  ) : null;

  const workingCanvas = canvasStaging ? (
    <WorkingCanvas>
      <canvas className="canvas" ref={canvasRef}></canvas>
      {/* <button onClick={helper}></button> */}
    </WorkingCanvas>
  ) : null;

  return (
    <div className="main">
      {navbar}
      <div className="stage">
        {originalImage}
        {workingCanvas}
      </div>
    </div>
  );
};

export default SeamCarver;
