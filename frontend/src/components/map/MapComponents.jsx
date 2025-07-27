import { useRef, useEffect } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import { DefaultIcon } from './MapUtils';

export const DraggableMarker = ({ position, setPosition }) => {
  const markerRef = useRef(null);
  const map = useMap();

  const eventHandlers = {
    dragend: () => {
      const marker = markerRef.current;
      if (marker) {
        setPosition(marker.getLatLng());
        map.flyTo(marker.getLatLng(), map.getZoom());
      }
    }
  };

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      icon={DefaultIcon}
      ref={markerRef}
    >
      <Popup>Drag me or tap on map</Popup>
    </Marker>
  );
};

export const MapHandler = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, map.getZoom(), {
      duration: 1,
      easeLinearity: 0.25
    });
  }, [position, map]);

  return null;
};