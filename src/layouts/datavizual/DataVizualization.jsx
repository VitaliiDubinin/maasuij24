import React from 'react';
import { Box, Typography } from '@mui/material';
import './datavizual.css';

const DataVisualization = ({ data }) => {
  const max = Math.max(...data);

  return (
    <div>
      <Box display="flex" alignItems="center">
        <div className="line-container">
          {data.map((value, index) => (
            <div key={index} className="dot">
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: 'blue', // Change the color as needed
                  borderRadius: '50%',
                  opacity: value / max, // Adjust dot opacity based on data value
                }}
              />
              <Typography variant="caption" className="label">
                {value}
              </Typography>
            </div>
          ))}
        </div>
      </Box>
    </div>
  );
};

export default DataVisualization;
