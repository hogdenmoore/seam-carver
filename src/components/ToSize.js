import "../styles/ToSize.css";

const ToSize = (props) => {
  let { heightVal, widthVal, onChangeHeight, onChangeWidth } = props;
  return (
    <div>
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
    </div>
  );
};

export default ToSize;
