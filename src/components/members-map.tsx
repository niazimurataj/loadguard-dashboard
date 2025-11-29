// app/components/members-map.tsx
"use client";

import React from "react";
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  Polyline,
} from "@react-google-maps/api";

type Marker = {
  name: string;
  position: {
    lat: number;
    lng: number;
  };
};

type Route = {
  from: string;
  to: string;
};

type MembersMapProps = {
  markers: Marker[];
  routes: Route[];
};

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 20.0,
  lng: -40.0,
};

const mapOptions: google.maps.MapOptions = {
  styles: [
    { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
    {
      featureType: "administrative.land_parcel",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#bdbdbd" }],
    },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#757575" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#e5e5e5" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9e9e9e" }],
    },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    {
      featureType: "road.arterial",
      elementType: "labels.text.fill",
      stylers: [{ color: "#757575" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#dadada" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#616161" }],
    },
    {
      featureType: "road.local",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9e9e9e" }],
    },
    {
      featureType: "transit.line",
      elementType: "geometry",
      stylers: [{ color: "#e5e5e5" }],
    },
    {
      featureType: "transit.station",
      elementType: "geometry",
      stylers: [{ color: "#eeeeee" }],
    },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9e9e9e" }],
    },
  ],
  disableDefaultUI: true,
  zoomControl: true,
};

export default  function MembersMap({ markers, routes }: MembersMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? "",
  });

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center text-sm">
        Error loading map.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center text-sm">
        Loading map...
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-xl border bg-muted">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={2}
        options={mapOptions}
      >
        {markers.map((marker) => (
          <MarkerF
            key={marker.name}
            position={marker.position}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#B91C1C",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#ffffff",
            }}
          />
        ))}
        {routes.map((route, i) => {
          const fromMarker = markers.find((m) => m.name === route.from);
          const toMarker = markers.find((m) => m.name === route.to);
          if (!fromMarker || !toMarker) return null;
          return (
            <Polyline
              key={`line-${i}`}
              path={[fromMarker.position, toMarker.position]}
              options={{
                strokeColor: "#B91C1C",
                strokeOpacity: 0.8,
                strokeWeight: 2,
              }}
            />
          );
        })}
      </GoogleMap>
    </div>
  );
}
