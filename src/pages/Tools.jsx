import React from 'react';
import DataVisualization from '../layouts/datavizual/DataVizualization';

const Tools = () => {
  //const data = [3, 5, 2, 8, 4];
  const data = ['start', 'point1', 'point2', 'checkpoint', 'finish'];

  return (
    <div className="App">
      <h1>Data Visualization</h1>
      <DataVisualization data={data} />
    </div>
  );
};

export default Tools;
