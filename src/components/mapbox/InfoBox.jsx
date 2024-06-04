import React from 'react';

const InfoBox = ({ deleteSelectedLine, selectedLineId }) => (
  <div className="info-box">
    <p>
      Click on two points to draw a line between them. Use the draw tools to add or delete points.
    </p>
    <p>
      Click on a line to select it. <button onClick={deleteSelectedLine} disabled={!selectedLineId}>Delete Selected Line</button>
    </p>
    <div id="directions"></div>
  </div>
);

export default InfoBox;
