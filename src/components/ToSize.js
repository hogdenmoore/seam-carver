import "../styles/ToSize.css";

const ToSize = (props) => {
  let {
    increaseHeight,
    decreaseHeight,
    increaseWidth,
    decreaseWidth,
    heightVal,
    widthVal,
    onChangeHeight,
    onChangeWidth,
  } = props;

  return (
    <div>
      <button className="upButton" onClick={increaseHeight}>
        <i className="fa fa-angle-up fa-3x"></i>
      </button>
      <div className="changeWidth">
        <input
          type="number"
          min="0"
          max="100"
          value={widthVal}
          onChange={onChangeWidth}
        ></input>
        %
      </div>
      <button className="downButton" onClick={decreaseHeight}>
        <i className="fa fa-angle-down fa-3x"></i>
      </button>

      <button className="leftButton" onClick={decreaseWidth}>
        <i className="fa fa-angle-left fa-3x"></i>
      </button>
      <div className="changeHeight">
        <input
          type="number"
          min="0"
          max="100"
          value={heightVal}
          onChange={onChangeHeight}
        ></input>
        %
      </div>
      <button className="rightButton" onClick={increaseWidth}>
        <i className="fa fa-angle-right fa-3x"></i>
      </button>
    </div>
  );
};

export default ToSize;
