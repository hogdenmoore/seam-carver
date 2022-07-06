import "../styles/SeamCarver.css";
import { useState, useEffect, useRef } from "react";
import NavBar from "./NavBar";
import ToSize from "./ToSize";
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
  const defaultHeightScale = 70;

  const [initialImg, setInitialImg] = useState(null);
  const [imageSize, setImageSize] = useState("imgLarge");
  const [canvasStaging, setCanvasStaging] = useState(false);
  const [toWidthScale, setToWidthScale] = useState(defaultWidthScale);
  const [toHeightScale, setToHeightScale] = useState(defaultHeightScale);
  const [currentHeight, setCurrentHeight] = useState(null);
  const [currentWidth, setCurrentWidth] = useState(null);
  const [isMoving, setIsMoving] = useState(1);
  const [tutorial, setTutorial] = useState(false);

  const imgRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    function updateSize() {
      if (imgRef.current !== null) {
        setCanvasStaging(false);
        setCurrentHeight(imgRef.current.height);
        setCurrentWidth(imgRef.current.width);
      }
    }
    window.addEventListener("resize", updateSize);
    return () => {
      window.removeEventListener("resize", updateSize);
      setCanvasStaging(true);
    };
  });
  useEffect(() => {
    async function setSize() {
      await wait(100);
      setCurrentHeight(imgRef.current.height);
      setCurrentWidth(imgRef.current.width);
    }
    if (imgRef.current != undefined) {
      setSize();
    }
  }, [initialImg]);

  const onPictureClick = async () => {
    if (isMoving === 1) {
      setInitialImg(initialImage);
      setCanvasStaging(true);
    }
  };

  const resize = async () => {
    if (isMoving === 2 || isMoving === 3) {
      return;
    }
    setIsMoving(2);
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
    let removed = 1;
    while (toWidth > 0) {
      let { nextLowestSeam, nexttwoD, dataWithRemovedSeam, energyMapToReturn } =
        await onVerticalIteration(energyMap, lowestSeam, twoDData, imgdata);
      lowestSeam = nextLowestSeam;
      twoDData = nexttwoD;
      imgdata = dataWithRemovedSeam;
      energyMap = energyMapToReturn;
      toWidth -= 1;
      setCurrentWidth(w - removed);
      removed += 1;
    }

    let newWidth = Math.floor((toWidthScale * w) / 100);

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
    removed = 1;
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
      setCurrentHeight(h - removed);
      removed += 1;
    }
    setIsMoving(3);
  };

  const resetStates = () => {
    if (isMoving === 3 || isMoving === 1) {
      setInitialImg(null);
      setImageSize("imgLarge");
      setCanvasStaging(false);
      setCurrentHeight(null);
      setCurrentWidth(null);
      setIsMoving(1);
    }
  };
  const uploadFile = (event) => {
    if (isMoving === 3 || isMoving === 1) {
      setInitialImg(URL.createObjectURL(event.target.files[0]));
    }
  };
  const navbar = (
    <NavBar
      resetAll={resetStates}
      createCanvas={resize}
      onPictureClick={onPictureClick}
      uploadPhoto={uploadFile}
    ></NavBar>
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

  const onChangeHeight = (event) => {
    if (event.target.value >= 100) {
      setToHeightScale(100);
    } else if (event.target.value <= 0) {
      setToHeightScale(0);
    } else {
      setToHeightScale(event.target.value);
    }
  };

  const onChangeWidth = (event) => {
    if (event.target.value >= 100) {
      setToWidthScale(100);
    } else if (event.target.value <= 0) {
      setToWidthScale(0);
    } else {
      setToWidthScale(event.target.value);
    }
  };

  const increaseHeightScale = (event) => {
    if (toHeightScale >= 100) {
      setToHeightScale(100);
    } else {
      setToHeightScale(toHeightScale + 1);
    }
  };
  const decreaseHeightScale = (event) => {
    if (toHeightScale <= 0) {
      setToHeightScale(0);
    } else {
      setToHeightScale(toHeightScale - 1);
    }
  };
  const increaseWidthScale = (event) => {
    if (toWidthScale >= 100) {
      setToHeightScale(100);
    } else {
      setToWidthScale(toWidthScale + 1);
    }
  };
  const decreaseWidthScale = (event) => {
    if (toWidthScale <= 0) {
      setToHeightScale(0);
    } else {
      setToWidthScale(toWidthScale - 1);
    }
  };

  const resizeButtons = (
    <div>
      <ToSize
        increaseHeight={increaseHeightScale}
        decreaseHeight={decreaseHeightScale}
        increaseWidth={increaseWidthScale}
        decreaseWidth={decreaseWidthScale}
        heightVal={toHeightScale}
        widthVal={toWidthScale}
        onChangeHeight={onChangeHeight}
        onChangeWidth={onChangeWidth}
      ></ToSize>
    </div>
  );

  const currentSizes =
    currentWidth == null ? (
      <div className="sizes">
        Current Width: 0 (px)
        <br />
        Current Height: 0 (px)
      </div>
    ) : (
      <div className="sizes">
        Current Width: {currentWidth} (px)
        <br />
        Current Height: {currentHeight} (px)
      </div>
    );

  return (
    <div className="main">
      {navbar}
      <div className="stage">
        {currentSizes}
        {resizeButtons}
        {originalImage}
        {workingCanvas}
      </div>
    </div>
  );
};

export default SeamCarver;
