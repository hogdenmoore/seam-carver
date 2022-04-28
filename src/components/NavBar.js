import "../styles/NavBar.css";

const NavBar = ({ onPictureClick, createCanvas }) => {
  return (
    <div className="navbar">
      <button onClick={createCanvas}>Resize</button>
      <button>Upload</button>
      <button>Download</button>
      <button onClick={onPictureClick}>Pictures</button>
    </div>
  );
};

export default NavBar;
