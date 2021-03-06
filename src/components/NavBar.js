import "../styles/NavBar.css";

const NavBar = ({ uploadPhoto, onPictureClick, createCanvas, resetAll }) => {
  return (
    <div className="navbar">
      <button onClick={createCanvas}>Resize</button>
      <button onClick={onPictureClick}>Image</button>
      <button onClick={resetAll}>Clear</button>
      <label className="upload">
        <input type="file" onChange={uploadPhoto} />
        Upload
      </label>
    </div>
  );
};

export default NavBar;
