import React, { useEffect, useState, useContext } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import "leaflet-draw";
import "leaflet-geometryutil";
import axios from "axios";
import { SelectedParcelContext } from "./SelectedParcelContext";
import ParcelDetails from "./ParcelDetails";
import RegisterParcel from "./RegisterParcel";
import sample from "../data/indiaParcels.json";
import "./FloatingButton.css";

// India bounding box roughly: [west, south, east, north]
const INDIA_BOUNDS = [
  [6.5, 68.0],
  [35.5, 97.5],
]; // southWest, northEast in lat,lng

// Drawing controls component
function DrawingControls({ onAreaSelected }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Initialize draw control
    const drawControl = new L.Control.Draw({
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          drawError: {
            color: "#e1e100",
            message: "<strong>Error:</strong> Shape edges cannot cross!",
          },
          shapeOptions: {
            color: "#007bff",
            fillColor: "#007bff",
            fillOpacity: 0.2,
            weight: 2,
          },
        },
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: new L.FeatureGroup(),
        remove: true,
        edit: false,
      },
    });

    map.addControl(drawControl);

    // Handle draw events
    map.on(L.Draw.Event.CREATED, (e) => {
      const layer = e.layer;
      const geoJson = layer.toGeoJSON();

      // Calculate area in square meters
      const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);

      onAreaSelected({
        geoJson: JSON.stringify(geoJson),
        area: Math.round(area),
        bounds: layer.getBounds(),
      });

      // Add to map
      map.addLayer(layer);
    });

    return () => {
      map.removeControl(drawControl);
      map.off(L.Draw.Event.CREATED);
    };
  }, [map, onAreaSelected]);

  return null;
}

function colorForString(s) {
  // simple hash to HSL
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return `hsl(${h},70%,50%)`;
}

export default function MapView() {
  const [data, setData] = useState(null);
  const { selected, setSelected } = useContext(SelectedParcelContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/parcels")
      .then((r) => {
        // backend returns FeatureCollection; if empty, fall back to sample
        if (!r.data || !r.data.features || r.data.features.length === 0) {
          setData(sample);
        } else {
          setData(r.data);
        }
      })
      .catch((err) => {
        console.error("API error, falling back to sample:", err.message || err);
        setData(sample);
      });
  }, []);

  function styleFeature(feature) {
    const contract =
      (feature.properties && feature.properties.contract) ||
      String(feature.properties && feature.properties.parcelId);
    return {
      color: colorForString(contract),
      weight: 2,
      fillOpacity: 0.45,
    };
  }

  const handleAreaSelected = (areaData) => {
    setSelectedArea(areaData);
    setShowRegister(true);
  };

  return (
    <div className="map">
      {selected && (
        <ParcelDetails
          parcelId={selected}
          onClose={() => {
            setSelected(null);
            setSidebarOpen(false);
          }}
        />
      )}
      {showRegister && (
        <RegisterParcel
          onClose={() => {
            setShowRegister(false);
            setSelectedArea(null);
          }}
          selectedArea={selectedArea}
        />
      )}
      <MapContainer
        center={[22.0, 82.0]}
        zoom={5}
        style={{ height: "100%" }}
        maxBounds={INDIA_BOUNDS}
        maxBoundsViscosity={0.8}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <DrawingControls onAreaSelected={handleAreaSelected} />
        {data && (
          <GeoJSON
            data={data}
            style={styleFeature}
            onEachFeature={(f, layer) => {
              layer.on("click", () => setSelected(f.properties.parcelId));
              const props = f.properties || {};
              const info = `Parcel: ${props.parcelId || "?"}\nContract: ${
                props.contract || "-"
              }\nOwner: ${props.owner || "-"}`;
              layer.bindPopup(info);
            }}
          />
        )}
      </MapContainer>
      <button className="fab" onClick={() => setShowRegister(true)}>
        +<span className="fab-tooltip">Register New Property</span>
      </button>
      <div className="draw-instructions">
        <p>Click the polygon tool to draw property boundaries</p>
      </div>
    </div>
  );
}
