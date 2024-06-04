import React from "react";

const InfoBox = ({ deleteSelectedLine, deleteSelectedPoints, selectedLineId, selectedPoints }) => {
  return (
    <div className="info-box">
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