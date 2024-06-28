import React, { useState, useRef, useEffect } from "react";
import { useGetEntity } from '../../../lib/hooks/useGetEntity';
import { useGetLinks } from '../../../lib/hooks/useGetLinks';
import useCreateEntity from '../../../lib/hooks/useCreateEntity';
import useUpdateEntity from '../../../lib/hooks/useUpdateEntity';
import useDeleteEntity from '../../../lib/hooks/useDeleteEntity';
import { fetchAndUpdateEntities } from '../../../lib/hooks/fetchAndUpdateEntities';
import MapComponent from "../../../components/mapbox/MapComponent";
import PointsComponent from "../../../components/mapbox/PointsComponent";
import LinksComponent from "../../../components/mapbox/LinksComponent";
import LinesComponent from "../../../components/mapbox/LinesComponent";
import Sidebar from "../../../components/mapbox/SideBar";
import InfoBox from "../../../components/mapbox/InfoBox";
import { useQueryClient } from '@tanstack/react-query';

const TestMap = () => {
  const queryClient = useQueryClient();
  const { data: pointsData, isLoading, error } = useGetEntity();
  const { data: linksData, isLoading: isLoadingLinks, error: errorLinks } = useGetLinks();
  const createEntity = useCreateEntity();
  const updateEntity = useUpdateEntity();
  const deleteEntity = useDeleteEntity();

  const [lng, setLng] = useState(27.6);
  const [lat, setLat] = useState(42.6);
  const [zoom, setZoom] = useState(9);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [linesData, setLinesData] = useState({
    type: 'FeatureCollection',
    features: []
  });
  const [selectedLineId, setSelectedLineId] = useState(null);
  const [clonedPoint, setClonedPoint] = useState(null); // State for cloned point
  const [initialLinksData] = useState({
    type: 'FeatureCollection',
    features: []
  });

  const map = useRef(null);
  const draw = useRef(null);

  useEffect(() => {
    if (!isLoading && pointsData) {
      if (map.current && map.current.getSource('points')) {
        map.current.getSource('points').setData(pointsData);
      }
    }
  }, [isLoading, pointsData]);

  // useEffect(() => {
  //   if (!isLoading && linksData) {
  //     if (map.current && map.current.getSource('links')) {
  //       map.current.getSource('links').setData(linksData);
  //     }
  //   }
  // }, [isLoading, linksData]);

  const onMove = () => {
    if (map.current) {
      const newLng = map.current.getCenter().lng.toFixed(4);
      const newLat = map.current.getCenter().lat.toFixed(4);
      const newZoom = map.current.getZoom().toFixed(2);
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

      createEntity.mutate(newSPoint, {
        onSuccess: async () => {
          const updatedPointsData = await fetchAndUpdateEntities(queryClient);
          updatePoints(updatedPointsData);
        }
      });
    } else {
      draw.current.delete(newPoint.id);
    }
  };

  const onDrawDelete = (e) => {
    const deletedPointIds = e.features.map(feature => feature.id);
    deletedPointIds.forEach(id => {
      deleteEntity.mutate(id, {
        onSuccess: async () => {
          const updatedPointsData = await fetchAndUpdateEntities(queryClient);
          updatePoints(updatedPointsData);
        }
      });
    });
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
            name: f.properties.name || "Unnamed Point",
            creator: f.properties.creator || 138
          }
        }))
      ]
    };
    if (map.current && map.current.getSource('points')) {
      map.current.getSource('points').setData(finalData);
    }
  };

  const onPointClick = (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const pointId = e.features[0].properties.id;
    const pointName = e.features[0].properties.name;
    const pointCreator = e.features[0].properties.creator;

    if (clonedPoint) {
      map.current.getSource('cloned-points').setData({
        type: 'FeatureCollection',
        features: []
      });
      setClonedPoint(null);
    }

    const newClonedPoint = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: coordinates
      },
      properties: {
        id: pointId,
        name: pointName,
        creator: pointCreator
      }
    };

    map.current.getSource('cloned-points').setData({
      type: 'FeatureCollection',
      features: [newClonedPoint]
    });

    setClonedPoint(newClonedPoint);

    setSelectedPoints((prevSelectedPoints) => {
      if (prevSelectedPoints.length === 0) {
        return [{ id: pointId, coordinates }];
      } else if (prevSelectedPoints.length === 1 && prevSelectedPoints[0].id !== pointId) {
        return [...prevSelectedPoints, { id: pointId, coordinates }];
      } else {
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

  const handleClonedPointUpdate = (newClonedPoint) => {
    setClonedPoint(newClonedPoint);
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
        linksData={linksData || initialLinksData} // Use initial empty links data until the actual data is available
        onDrawCreate={onDrawCreate}
        onDrawDelete={onDrawDelete}
        onPointClick={onPointClick}
        onLineClick={onLineClick}
        updatePoints={updatePoints}
        mapRef={map}
        drawRef={draw}
        clonedPoint={clonedPoint}
        handleClonedPointUpdate={handleClonedPointUpdate}
      />
      <PointsComponent mapRef={map} drawRef={draw} updatePoints={updatePoints} />
      <LinksComponent mapRef={map} linksData={linksData} />
      <LinesComponent selectedPoints={selectedPoints} setLinesData={setLinesData} mapRef={map} />
    </div>
  );
};

export default TestMap;
