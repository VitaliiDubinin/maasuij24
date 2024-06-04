import React from 'react';

const Sidebar = ({ lng, lat, zoom }) => (
  <div className="sidebar">
    Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
  </div>
);

export default Sidebar;
