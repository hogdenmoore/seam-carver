import "../styles/WorkingCanvas.css";

const WorkingCanvas = (props) => {
  return <div className="imageContainer">{props.children}</div>;
};

export default WorkingCanvas;
