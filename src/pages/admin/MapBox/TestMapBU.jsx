import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

//mapboxgl.accessToken = "pk.eyJ1Ijoia2FuZXJ2YSIsImEiOiJjbHNjNnpza3Uwa2FrMmlvNWNpYTN5bzBiIn0.wCkSebd9BeT4zpV2a_ygAg";
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const initialPointsGeoJSON = {
  'type': 'FeatureCollection',
  'features': [
    {
      'type': 'Feature',
      'geometry': {
        'type': 'Point',
        'coordinates': [27.63, 42.64]
      },
      'properties': {
        'id': 'point1',
        'name': 'Point 1'
      }
    },
    {
      'type': 'Feature',
      'geometry': {
        'type': 'Point',
        'coordinates': [27.553, 42.59]
      },
      'properties': {
        'id': 'point2',
        'name': 'Point 2'
      }
    },
    {
      'type': 'Feature',
      'geometry': {
        'type': 'Point',
        'coordinates': [27.453, 42.54]
      },
      'properties': {
        'id': 'point3',
        'name': 'Point 3'
      }
    }
  ]
};

export default function TestMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const draw = useRef(null);
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

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom
    });

    map.current.loadImage('/airport-15.png', function(error, image) {
      if (error) throw error;
      map.current.addImage('airport-15', image);
  });

    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        point: true,
        trash: true
      }
    });
    map.current.addControl(draw.current);

    map.current.on('load', () => {
      map.current.addSource('points', {
        type: 'geojson',
        data: pointsData
      });
      map.current.addLayer({
        id: 'points',
        type: 'circle',
        source: 'points',
        paint: {
          'circle-radius': 10,
          'circle-color': '#F84C4C' // red color
        }
      });

      map.current.addSource('lines', {
        type: 'geojson',
        data: linesData
      });
      map.current.addLayer({
        id: 'lines',
        type: 'line',
        source: 'lines',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': 'hsl(0, 0%, 13%)',
          'line-width': ['interpolate', ['linear'], ['zoom'], 2, 1, 10, 2],
          'line-dasharray': [0, 3],
        }
      });

      map.current.addLayer({
        id: 'directions',
        type: 'symbol',
        source: 'lines',
        layout: {
          'symbol-placement': 'line',
          'symbol-spacing': 50,
          'icon-image': 'airport-15', // Use a built-in icon that looks like an arrow
          'icon-size': 1.2,
          'icon-offset': [0, -1],
          'icon-rotate': 90,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true
        }
      });

      // Add click event handler for points
      map.current.on('click', 'points', (e) => {
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
      });

      // Add click event handler for lines
      map.current.on('click', 'lines', (e) => {
        const lineId = e.features[0].properties.id;
        console.log(`Clicked line: ${lineId}`);
        setSelectedLineId(lineId);
      });

      map.current.on('mouseenter', 'points', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'points', () => {
        map.current.getCanvas().style.cursor = '';
      });

      map.current.on('mouseenter', 'lines', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'lines', () => {
        map.current.getCanvas().style.cursor = '';
      });
    });

    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });

    map.current.on('draw.create', (e) => {
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
    });
    map.current.on('draw.delete', updatePoints);
    map.current.on('draw.update', updatePoints);

    // Make points draggable
    map.current.on('mousedown', 'points', (e) => {
      const pointId = e.features[0].properties.id;
      setDraggedPointId(pointId);
      map.current.getCanvas().style.cursor = 'grabbing';
      map.current.on('mousemove', onDrag);
      map.current.once('mouseup', onDrop);
    });

    const onDrag = (e) => {
      if (!draggedPointId) return;

      const newCoords = [e.lngLat.lng, e.lngLat.lat];
      const updatedFeatures = pointsData.features.map((feature) => {
        if (feature.properties.id === draggedPointId) {
          feature.geometry.coordinates = newCoords;
        }
        return feature;
      });

      const updatedData = {
        ...pointsData,
        features: updatedFeatures
      };

      setPointsData(updatedData);
      map.current.getSource('points').setData(updatedData);
    };

    const onDrop = () => {
      setDraggedPointId(null);
      map.current.getCanvas().style.cursor = '';
      map.current.off('mousemove', onDrag);
      updatePoints();
    };

  }, [draggedPointId, pointsData, linesData]);

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
      if (map.current.getSource('lines')) {
        map.current.getSource('lines').setData(updatedLines);
      }
      return updatedLines;
    });
  };

  const deleteSelectedLine = () => {
    if (selectedLineId) {
      setLinesData((prevLinesData) => {
        const updatedLines = {
          ...prevLinesData,
          features: prevLinesData.features.filter(line => line.properties.id !== selectedLineId)
        };
        if (map.current.getSource('lines')) {
          map.current.getSource('lines').setData(updatedLines);
        }
        return updatedLines;
      });
      setSelectedLineId(null);
    }
  };

  const calculateAngle = (start, end) => {
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return angle;
  };

  return (
    <div>
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>

      <div className="info-box">
        <p>
          Click on two points to draw a line between them. Use the draw tools to add or delete points.
        </p>
        <p>
          Click on a line to select it. <button onClick={deleteSelectedLine} disabled={!selectedLineId}>Delete Selected Line</button>
        </p>
        <div id="directions"></div>
      </div>

      <div ref={mapContainer} className="map-container" style={{ width: '80%', height: '600px' }} />
    </div>
  );
}
