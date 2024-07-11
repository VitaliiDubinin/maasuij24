import React, { useState, useRef, useEffect } from "react";
import { useGetEntity } from '../../../lib/hooks/useGetEntity';
import { useGetRoutes } from '../../../lib/hooks/useGetRoutes';
import useCreateEntity from '../../../lib/hooks/useCreateEntity';
import useDeleteEntity from '../../../lib/hooks/useDeleteEntity';
import useCreateLink from '../../../lib/hooks/useCreateLink';
import { fetchAndUpdateEntities } from '../../../lib/hooks/fetchAndUpdateEntities';
import MapComponent from "../../../components/mapbox/MapComponent";
import Sidebar from "../../../components/mapbox/SideBar";
import InfoBox from "../../../components/mapbox/InfoBox";
import { useQueryClient } from '@tanstack/react-query';
import { useCreateLinkPath } from '../../../lib/hooks/useCreateLinkPath';
import { handleDrawCreate } from '../../../lib/hooks/handleDrawCreate';
import { useDispatch, useSelector } from 'react-redux';
import { selectPoint, clearSelection } from '../../../mapSlice';

const TestMap = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { data: spointsData, isLoading, error, refetch } = useGetEntity();
  const { data: routesData, isLoading: isLoadingRoutes, error: routesError } = useGetRoutes();
  const createEntity = useCreateEntity();
  const deleteEntity = useDeleteEntity();
  const createLink = useCreateLink();
  const createLinkPath = useCreateLinkPath();

  const [lng, setLng] = useState(27.618);
  const [lat, setLat] = useState(42.6995);
  const [zoom, setZoom] = useState(12.8);
  const selectedPoints = useSelector(state => state.map.selectedPoints);
  const clonedPoint = useSelector(state => state.map.clonedPoint);
  const [isLinkCreating, setIsLinkCreating] = useState(false);

  const map = useRef(null);
  const draw = useRef(null);

  useEffect(() => {
    if (!isLoading && spointsData) {
      if (map.current && map.current.getSource('points')) {
        map.current.getSource('points').setData(spointsData);
      }
    }
  }, [isLoading, spointsData]);

  useEffect(() => {
    if (selectedPoints.length === 2 && !isLinkCreating) {
      setIsLinkCreating(true);
      createLink.mutate(selectedPoints, {
        onSuccess: async (l) => {
          const linkid = l.stored.id;
          setIsLinkCreating(false);
          const lineCoordinates = selectedPoints.map(point => point.coordinates);

          createRoute(lineCoordinates, linkid);
          dispatch(clearSelection());
        },
        onError: (error) => {
          console.error("Link creation failed", error);
          setIsLinkCreating(false);
          dispatch(clearSelection());
        }
      });
    }
  }, [selectedPoints, isLinkCreating, createLink, dispatch]);



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
    handleDrawCreate(e, spointsData, createEntity, queryClient, map, draw);
  };

  const onDrawDelete = (e) => {
    const deletedPointIds = e.features.map(feature => feature.id);
    deletedPointIds.forEach(id => {
      deleteEntity.mutate(id, {
        onSuccess: async () => {
          refetch();
        }
      });
    });
  };

  const updatePoints = (updatedData) => {
    if (!draw.current) return;
    const data = draw.current.getAll();
    const finalData = updatedData || {
      ...spointsData,
      features: [
        ...spointsData.features.filter(f => f.properties.id.startsWith('point')),
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

    dispatch(selectPoint({ point: { id: pointId, coordinates } }));


    if (clonedPoint && clonedPoint.properties.id === pointId) {
      // Deselect the point if it's already selected
      dispatch(clearSelection());
    } else {
      // Select the point and set it as the cloned point
      map.current.getSource('cloned-points').setData({
        type: 'FeatureCollection',
        features: [newClonedPoint]
      });
      dispatch(selectPoint({ point: { id: pointId, coordinates } }));
    }


    console.log("after dispatcher")
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

  // useEffect(() => {
  //   if (!map.current) return;
  
  //   if (clonedPoint) {
  //     map.current.getSource('cloned-points').setData({
  //       type: 'FeatureCollection',
  //       features: [clonedPoint]
  //     });
  //   } else {
  //     map.current.getSource('cloned-points').setData({
  //       type: 'FeatureCollection',
  //       features: []
  //     });
  //   }
  // }, [clonedPoint]);

  const deleteSelectedPoints = () => {
    selectedPoints.forEach(point => {
      deleteEntity.mutate(point.id);
    });
    dispatch(clearSelection());
  };

  const createRoute = (coords, linkid) => {
    const profile = 'driving';
    const newCoords = coords.map(coord => `${coord[0]},${coord[1]}`).join(';');
    const radius = coords.map(() => 25);
    getMatch(newCoords, radius, profile, linkid);
  };

  const getMatch = async (coordinates, radius, profile, linkid) => {
    const radiuses = radius.join(';');
    const query = await fetch(
      `https://api.mapbox.com/matching/v5/mapbox/${profile}/${coordinates}?geometries=geojson&radiuses=${radiuses}&steps=true&access_token=${process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}`,
      { method: 'GET' }
    );
    const response = await query.json();
    if (response.code !== 'Ok') {
      alert(
        `${response.code} - ${response.message}.\n\nFor more information: https://docs.mapbox.com/api/navigation/map-matching/#map-matching-api-errors`
      );
      return;
    }
    const matchedCoords = response.matchings[0].geometry;
    draw.current.add({
      type: 'Feature',
      geometry: matchedCoords,
      properties: {}
    });
    await saveRouteToDatabase(matchedCoords, linkid);
  };

  const saveRouteToDatabase = async (route, linkid) => {
    const routeData = {
      number: null,
      linkId: linkid,
      stored: {
        id: null,
        creator: 10,
        active: false
      },
      linkPoints: route.coordinates.slice(1, -1).map((coord, index) => ({
        number: index + 1,
        stored: {
          id: null,
          creator: 138,
          active: null
        },
        coordinates: {
          x: coord[0],
          y: coord[1]
        }
      }))
    };

    createLinkPath.mutate(routeData);
  };

  if (isLoading || isLoadingRoutes) {
    return <div>Loading...</div>;
  }

  if (error || routesError) {
    return <div>Error loading points data: {error.message}</div>;
  }

  return (
    <div>
      <Sidebar lng={lng} lat={lat} zoom={zoom} />
      <InfoBox
        deleteSelectedPoints={deleteSelectedPoints}
        selectedPoints={selectedPoints}
      />
      <MapComponent
        lng={lng}
        lat={lat}
        zoom={zoom}
        onMove={onMove}
        pointsData={spointsData}
        onDrawCreate={onDrawCreate}
        onDrawDelete={onDrawDelete}
        onPointClick={onPointClick}
        updatePoints={updatePoints}
        mapRef={map}
        drawRef={draw}
        clonedPoint={clonedPoint}
        handleClonedPointUpdate={() => {}}
        routesData={routesData}
      />
    </div>
  );
};

export default TestMap;
