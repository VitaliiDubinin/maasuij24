import React from "react";

const InfoBox = ({ deleteSelectedLine, deleteSelectedPoints, selectedLineId, selectedPoints }) => {
  return (
    <div className="info-box">

<p>
      Click on two points, one by one, to draw a line between them. Use the draw tools to add points.
    </p>
    <p>
      Click on a line or point to select it and delete then. 
    </p>



      {selectedLineId && (
        <button onClick={deleteSelectedLine}>Delete Selected Line</button>
      )}
      {selectedPoints.length > 0 && (
        <button onClick={deleteSelectedPoints}>Delete Selected Points</button>
      )}
    </div>
  );
};

export default InfoBox;