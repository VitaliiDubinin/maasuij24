import React, { useState, useRef, useEffect } from "react";
import { useGetEntity } from '../../../lib/hooks/useGetEntity';
import useCreateEntity from '../../../lib/hooks/useCreateEntity';
import useUpdateEntity from '../../../lib/hooks/useUpdateEntity';
import useDeleteEntity from '../../../lib/hooks/useDeleteEntity';
import MapComponent from "../../../components/mapbox/MapComponent";
import PointsComponent from "../../../components/mapbox/PointsComponent";
import LinesComponent from "../../../components/mapbox/LinksComponent";
import Sidebar from "../../../components/mapbox/SideBar";
import InfoBox from "../../../components/mapbox/InfoBox";

const TestMap = () => {
  const { data: pointsData, isLoading, error } = useGetEntity();
  const createEntity = useCreateEntity();
  const updateEntity = useUpdateEntity();
  const deleteEntity = useDeleteEntity();

  const [lng, setLng] = useState(27.6);
  const [lat, setLat] = useState(42.6);
  const [zoom, setZoom] = useState(9);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [draggedPointId, setDraggedPointId] = useState(null);
  const [linesData, setLinesData] = useState({
    type: 'FeatureCollection',
    features: []
  });
  const [selectedLineId, setSelectedLineId] = useState(null);
  const map = useRef(null);
  const draw = useRef(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (!isLoading && pointsData) {
      console.log("Setting map source data with pointsData");
      if (map.current && map.current.getSource('points')) {
        map.current.getSource('points').setData(pointsData);
      }
    }
  }, [isLoading, pointsData]);

  const onMove = () => {
    if (map.current) {
      const newLng = map.current.getCenter().lng.toFixed(4);
      const newLat = map.current.getCenter().lat.toFixed(4);
      const newZoom = map.current.getZoom().toFixed(2);

      console.log(`Map moved: newLng=${newLng}, newLat=${newLat}, newZoom=${newZoom}`);

      setLng(newLng);
      setLat(newLat);
      setZoom(newZoom);
    }
  };

  const onDrawCreate = (e) => {
    const newPoint = e.features[0];
    const pointName = prompt("Enter a name for the new point:", "New Point");

    if (pointName) {
      const newSPoint = {
        persistent: {
          id: null,
          name: pointName,
          description: null,
          creator: 133,
          locales: [],
          active: null
        },
        number: 868,
        point: {
          x: newPoint.geometry.coordinates[0],
          y: newPoint.geometry.coordinates[1]
        }
      };

      console.log("Creating new point:", newSPoint);

      createEntity.mutate(newSPoint, {
        onSuccess: () => {
          console.log("Point created successfully, updating points.");
          updatePoints();
        }
      });
    } else {
      draw.current.delete(newPoint.id);
    }
  };

  const onDrawDelete = () => {
    console.log("Deleting point, updating points.");
    updatePoints();
  };

  const onDrawUpdate = (e) => {
    const updatedPoint = e.features[0];
    const pointId = updatedPoint.id;
    const updatedCoordinates = updatedPoint.geometry.coordinates;

    const updatedEntity = {
      persistent: {
        id: pointId,
        name: updatedPoint.properties.name,
        description: updatedPoint.properties.description,
        creator: updatedPoint.properties.creator,
        locales: updatedPoint.properties.locales,
        active: updatedPoint.properties.active
      },
      number: updatedPoint.properties.number,
      point: {
        x: updatedCoordinates[0],
        y: updatedCoordinates[1]
      }
    };

    console.log("Updating point:", updatedEntity);

    if (!isUpdatingRef.current) {
      isUpdatingRef.current = true;
      console.log("Calling updateEntity.mutate");
      updateEntity.mutate(updatedEntity, {
        onSuccess: () => {
          console.log("Point updated successfully, updating points.");
          updatePoints();
          isUpdatingRef.current = false;
        },
        onError: (error) => {
          console.error("Error updating point:", error);
          isUpdatingRef.current = false;
        }
      });
    }
  };

  const updatePoints = (updatedData) => {
    if (!draw.current) return;
    const data = draw.current.getAll();
    const finalData = updatedData || {
      ...pointsData,
      features: [
        ...pointsData.features.filter(f => f.properties.id.startsWith('point')),
        ...data.features.map(f => ({
          ...f,
          properties: {
            ...f.properties,
            id: f.id,
            name: f.properties.name || "Unnamed Point"
          }
        }))
      ]
    };
    console.log('Updated points:', finalData);
    const lastItem = finalData.features[finalData.features.length - 1];
    if (lastItem && lastItem.geometry && lastItem.geometry.coordinates) {
      console.log('Coordinates of the last item:', lastItem.geometry.coordinates);
    }
    if (map.current && map.current.getSource('points')) {
      map.current.getSource('points').setData(finalData);
    }
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

    if (map.current) {
      const isSelected = map.current.getFeatureState({
        source: 'points',
        id: pointId
      }).selected;

      map.current.setFeatureState(
        { source: 'points', id: pointId },
        { selected: !isSelected }
      );
    }
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

  const deleteSelectedPoints = () => {
    selectedPoints.forEach(point => {
      deleteEntity.mutate(point.id);
    });
    setSelectedPoints([]);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading points data: {error.message}</div>;
  }

  return (
    <div>
      <Sidebar lng={lng} lat={lat} zoom={zoom} />
      <InfoBox
        deleteSelectedLine={deleteSelectedLine}
        deleteSelectedPoints={deleteSelectedPoints}
        selectedLineId={selectedLineId}
        selectedPoints={selectedPoints}
      />
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
