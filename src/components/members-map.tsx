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
  /** Location accuracy radius in meters (e.g. from OpenCellID range_m). */
  rangeM?: number;
  /** Location source (e.g. "opencellid"). */
  source?: string;
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

const defaultCenter = {
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

export default function MembersMap({ markers, routes }: MembersMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? "",
  });

  const center =
    markers.length > 0
      ? {
          lat: markers.reduce((s, m) => s + m.position.lat, 0) / markers.length,
          lng: markers.reduce((s, m) => s + m.position.lng, 0) / markers.length,
        }
      : defaultCenter;
  const zoom = markers.length > 0 ? 10 : 2;

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
    <div className="relative h-full w-full rounded-xl border bg-muted">
      {markers.length === 0 && (
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded bg-muted/90 px-3 py-1.5 text-xs text-muted-foreground">
          Select a device with location to see it on the map
        </div>
      )}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        options={mapOptions}
      >
        {markers.map((marker) => {
          const resolutionLabel =
            marker.rangeM != null || marker.source
              ? [marker.rangeM != null ? `±${marker.rangeM} m` : "", marker.source].filter(Boolean).join(" · ")
              : undefined;
          return (
            <MarkerF
              key={marker.name}
              position={marker.position}
              title={resolutionLabel ?? undefined}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#B91C1C",
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: "#ffffff",
              }}
            />
          );
        })}
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
