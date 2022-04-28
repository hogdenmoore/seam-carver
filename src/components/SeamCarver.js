import "../styles/SeamCarver.css";
import { useState, useEffect, useRef } from "react";
import NavBar from "./NavBar";
import WorkingImage from "./WorkingImage";
import WorkingCanvas from "./WorkingCanvas";
import initialImage from "../balloons.jpg";
import {
  findFirstSeam,
  findNextSeam,
  toTwoDData,
  drawSeam,
  removeSeam,
} from "../utilities/resizingAlgorithms";
import { wait } from "../utilities/wait";

const SeamCarver = () => {
  const defaultWidthScale = 50;
  const defaultHeightScale = 70;

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
    console.log(w, h);

    canvas.width = w;
    canvas.height = h;

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }
    context.drawImage(srcImg, 0, 0, w, h);

    const newDataimg = context.getImageData(0, 0, w, h);
    let imgdata = newDataimg.data;

    const toWidth = Math.floor((toWidthScale * w) / 100);
    const toHeight = Math.floor((toHeightScale * h) / 100);

    let twoDData = toTwoDData({ imgdata, w, h });

    let { lowestSeam, totalEnergyMap } = findFirstSeam({ twoDData });

    const onIteration = async (lowestSeam, totalEnergyMap, twoDData, data) => {
      let dataWithSeam = await drawSeam({ lowestSeam, data, w, h });
      let seamImage = new ImageData(new Uint8ClampedArray(dataWithSeam), w, h);
      context.putImageData(seamImage, 0, 0, 0, 0, w, h);

      let { dataWithRemovedSeam, nextenergy, nexttwoD } = removeSeam({
        lowestSeam,
        totalEnergyMap,
        twoDData,
      });

      await wait(1);

      let dataWithRemovedSeamImage = new ImageData(
        new Uint8ClampedArray(dataWithRemovedSeam),
        w,
        h
      );

      context.putImageData(dataWithRemovedSeamImage, 0, 0, 0, 0, w, h);
      twoDData = nexttwoD;
      let { lowestSeam: nextLowestSeam, totalEnergyMap: nextEnergyMap } =
        findFirstSeam({ twoDData });

      return { nextLowestSeam, nextEnergyMap, nexttwoD, dataWithRemovedSeam };
    };
    let s = 5;

    while (s > 0) {
      let { nextLowestSeam, nextEnergyMap, nexttwoD, dataWithRemovedSeam } =
        await onIteration(lowestSeam, totalEnergyMap, twoDData, imgdata);
      lowestSeam = nextLowestSeam;
      totalEnergyMap = nextEnergyMap;
      twoDData = nexttwoD;
      imgdata = dataWithRemovedSeam;
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
