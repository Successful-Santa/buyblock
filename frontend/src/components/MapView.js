import React, { useEffect, useState, useContext } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
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

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/parcels")
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
        <RegisterParcel onClose={() => setShowRegister(false)} />
      )}
      <MapContainer
        center={[22.0, 82.0]}
        zoom={5}
        style={{ height: "100%" }}
        maxBounds={INDIA_BOUNDS}
        maxBoundsViscosity={0.8}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
    </div>
  );
}
