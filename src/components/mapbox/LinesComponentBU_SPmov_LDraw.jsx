import { useEffect } from "react";

const LinesComponent = ({ selectedPoints, setLinesData, mapRef }) => {
  useEffect(() => {
    if (selectedPoints.length === 2) {
      drawLineBetweenPoints(selectedPoints);
    }
  }, [selectedPoints]);

  const drawLineBetweenPoints = (points) => {
    const coordinates = points.map(point => point.coordinates);
    const lineId = `line-${Date.now()}`;
    const angle = calculateAngle(coordinates[0], coordinates[1]);
    const lineGeoJSON = {
      'type': 'FeatureCollection',
      'features': [
        {
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
            'coordinates': coordinates
          },
          'properties': {
            'id': lineId, // Assign a unique ID to each line
            'angle': angle // Add angle property
          }
        }
      ]
    };

    console.log(`Drawing line between points: ${JSON.stringify(coordinates)}`);

    // Add the new line to the linesData state
    setLinesData((prevLinesData) => {
      const updatedLines = {
        ...prevLinesData,
        features: [...prevLinesData.features, ...lineGeoJSON.features]
      };
      if (mapRef.current && mapRef.current.getSource('lines')) {
        mapRef.current.getSource('lines').setData(updatedLines);
      }
      return updatedLines;
    });
  };

  const calculateAngle = (start, end) => {
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return angle;
  };

  return null; // This component does not render anything directly
};

export default LinesComponent;
