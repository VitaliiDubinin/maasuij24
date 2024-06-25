import { useEffect } from "react";

const LinksComponent = ({ mapRef, linksData }) => {
  useEffect(() => {
    if (mapRef.current && linksData) {
      if (mapRef.current.getSource('links')) {
        mapRef.current.getSource('links').setData(linksData);
      }
    }
  }, [mapRef, linksData]);

  return null;
};

export default LinksComponent;
