import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.js';
import markerIcon from '../../../node_modules/leaflet/dist/images/marker-icon.png';
import DataVisualization from '../../layouts/datavizual/DataVizualization.jsx';

L.Marker.prototype.options.icon = L.icon({
  iconUrl: markerIcon,
  iconSize: [25, 41], // Set the width and height of the icon in pixels
  iconAnchor: [12, 41], // Set the anchor point of the icon (adjust as needed)
});

function MapComponent() {
  const mapRef = useRef(null);
  const [data, setData] = useState([]);
  //const data = ['start', 'point1', 'point2', 'checkpoint', 'finish'];
  //let data = [];
  //let routeData;

  useEffect(() => {
    function initmap() {
      if (!mapRef.current) {
        const map = L.map('youmap', {
          center: [42.57, 27.523],
          zoom: 13,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(
          map
        );

        const control = L.Routing.control({
          waypoints: [
            L.latLng(42.54, 27.453), // START YOU MARKER LOCATION
            L.latLng(42.659, 27.736), // END YOU MARKER LOCATION
          ],

          geocoder: L.Control.Geocoder.nominatim(),
          routeWhileDragging: true,
          reverseWaypoints: true,
          showAlternatives: true,

          altLineOptions: {
            styles: [
              { color: 'black', opacity: 0.15, weight: 14 },
              { color: 'white', opacity: 0.8, weight: 6 },
              { color: 'blue', opacity: 0.5, weight: 2 },
            ],
          },
          //show: false,
          // routeLine: false,
          // }).addTo(map);
        });

        control.addTo(map);

        const instructionsPanel = document.querySelector(
          '.leaflet-routing-container'
          //'.leaflet-routing-alternatives-container'
        );
        if (instructionsPanel) {
          instructionsPanel.style.display = 'none';
        }

        control.on('routeselected', (e) => {
          const routeData = e.route; // This contains the route data
          console.log('routeData', routeData.inputWaypoints);

          // data = { ...data, pointname: routeData.name };
          // console.log('data', data);

          // routeData.inputWaypoints.forEach((waypoint, index) => {
          //   data[`point${index + 1}`] = waypoint;
          // });

          // const numberOfWaypoints = routeData.inputWaypoints.length;
          // for (let i = 1; i <= numberOfWaypoints; i++) {
          //   data[`point${i}`] = null;
          // }

          const numberOfWaypoints = routeData.inputWaypoints.length;
          const newData = Array.from(
            { length: numberOfWaypoints },
            (_, index) => `point${index + 1}`
          );
          setData(newData);
          console.log('data', data);
        });

        //data = { ...data, pointname: routeData.name };
        //L.Routing.errorControl(control).addTo(map);

        mapRef.current = map; // Store the map instance in the ref
      }
    }

    initmap();
  }, []);

  return (
    <div>
      <div id="youmap" style={{ height: '500px' }}></div>
      <DataVisualization data={data} />
    </div>
  );
}

export default MapComponent;
