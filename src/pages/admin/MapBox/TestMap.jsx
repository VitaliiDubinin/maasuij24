import React, { useState, useRef } from "react";
import MapComponent from "../../../components/mapbox/MapComponent";
import PointsComponent from "../../../components/mapbox/PointsComponent";
import LinesComponent from "../../../components/mapbox/LinesComponent";
import Sidebar from "../../../components/mapbox/SideBar";
import InfoBox from "../../../components/mapbox/InfoBox";
import initialPointsGeoJSON from "../../../components/mapbox/initialPointsGeoJSON";

const TestMap = () => {
  const [lng, setLng] = useState(27.6);
  const [lat, setLat] = useState(42.6);
  const [zoom, setZoom] = useState(9);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [pointsData, setPointsData] = useState(initialPointsGeoJSON);
  const [draggedPointId, setDraggedPointId] = useState(null);
  const [linesData, setLinesData] = useState({
    'type': 'FeatureCollection',
    'features': []
  });
  const [selectedLineId, setSelectedLineId] = useState(null);
  const map = useRef(null);
  const draw = useRef(null);

  const onMove = () => {
    if (map.current) {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    }
  };

  const onDrawCreate = (e) => {
    const newPoint = e.features[0];
    const pointName = prompt("Enter a name for the new point:", "New Point");

    if (pointName) {
      newPoint.properties = newPoint.properties || {};
      newPoint.properties.name = pointName;
      newPoint.properties.id = newPoint.id; // Ensure each new point has an ID
      updatePoints();
    } else {
      draw.current.delete(newPoint.id);
    }
  };

  const onDrawDelete = () => {
    updatePoints();
  };

  const onDrawUpdate = () => {
    updatePoints();
  };

  const updatePoints = () => {
    const data = draw.current.getAll();
    const updatedData = {
      ...pointsData,
      features: [...pointsData.features.filter(f => f.properties.id.startsWith('point')), ...data.features.map(f => ({
        ...f,
        properties: {
          ...f.properties,
          id: f.id // Ensure each new point has an ID
        }
      }))]
    };
    setPointsData(updatedData);
    console.log('Updated points:', updatedData);
    map.current.getSource('points').setData(updatedData);
  };

  const onPointClick = (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const pointId = e.features[0].properties.id;
    const pointName = e.features[0].properties.name;

    console.log(`Clicked point: ${pointId} (${pointName}) at ${coordinates}`);

    setSelectedPoints((prevSelectedPoints) => {
      if (prevSelectedPoints.length === 0) {
        console.log("First point chosen");
        return [{ id: pointId, coordinates }];
      } else if (prevSelectedPoints.length === 1 && prevSelectedPoints[0].id !== pointId) {
        console.log("Second point chosen");
        return [...prevSelectedPoints, { id: pointId, coordinates }];
      } else {
        console.log("New line start point chosen");
        return [{ id: pointId, coordinates }];
      }
    });
  };

  const onLineClick = (e) => {
    const lineId = e.features[0].properties.id;
    console.log(`Clicked line: ${lineId}`);
    setSelectedLineId(lineId);
  };

  const deleteSelectedLine = () => {
    if (selectedLineId) {
      setLinesData((prevLinesData) => {
        const updatedLines = {
          ...prevLinesData,
          features: prevLinesData.features.filter(line => line.properties.id !== selectedLineId)
        };
        if (map.current && map.current.getSource('lines')) {
          map.current.getSource('lines').setData(updatedLines);
        }
        return updatedLines;
      });
      setSelectedLineId(null);
    }
  };

  return (
    <div>
      <Sidebar lng={lng} lat={lat} zoom={zoom} />
      <InfoBox deleteSelectedLine={deleteSelectedLine} selectedLineId={selectedLineId} />
      <MapComponent
        lng={lng}
        lat={lat}
        zoom={zoom}
        onMove={onMove}
        pointsData={pointsData}
        linesData={linesData}
        onDrawCreate={onDrawCreate}
        onDrawDelete={onDrawDelete}
        onDrawUpdate={onDrawUpdate}
        onPointClick={onPointClick}
        onLineClick={onLineClick}
        draggedPointId={draggedPointId}
        setDraggedPointId={setDraggedPointId}
        updatePoints={updatePoints}
        mapRef={map}
        drawRef={draw}
      />
      <PointsComponent mapRef={map} drawRef={draw} updatePoints={updatePoints} />
      <LinesComponent selectedPoints={selectedPoints} setLinesData={setLinesData} mapRef={map} />
    </div>
  );
};

export default TestMap;
