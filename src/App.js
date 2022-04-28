import "./styles/App.css";
import SeamCarver from "./components/SeamCarver";

const App = () => {
  return (
    <div className="App">
      <div className="header">
        Seam Carver<i className="fa fa-scissors" aria-hidden="true"></i>
      </div>
      <SeamCarver />
    </div>
  );
};

export default App;
