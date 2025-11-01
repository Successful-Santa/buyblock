import React, { useState } from "react";
import axios from "axios";
import "./RegisterParcel.css";

export default function RegisterParcel({ onClose, selectedArea }) {
  const [formData, setFormData] = useState({
    coordinates: selectedArea?.geoJson || "",
    area: selectedArea?.area || "",
    owner: "",
    documents: null,
    description: "",
    location: "",
    value: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataObj = new FormData();
      formDataObj.append("coordinates", formData.coordinates);
      formDataObj.append("area", formData.area);
      formDataObj.append("owner", formData.owner);
      formDataObj.append("description", formData.description);
      formDataObj.append("location", formData.location);
      formDataObj.append("value", formData.value);
      formDataObj.append("documents", formData.documents);

      const response = await axios.post(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3001"
        }/api/parcels/register`,
        formDataObj,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        alert(
          `Parcel registered successfully! Parcel ID: ${response.data.parcelId}`
        );
        onClose();
        // Optionally refresh the map data
        window.location.reload();
      } else {
        setError("Registration failed");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  return (
    <div className="register-parcel">
      <div className="header">
        <h2>Register New Land Parcel</h2>
        <button onClick={onClose}>×</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Coordinates (GeoJSON)</label>
          <textarea
            name="coordinates"
            value={formData.coordinates}
            onChange={handleChange}
            placeholder="Draw on map or enter GeoJSON coordinates"
            required
            readOnly={!!selectedArea}
          />
          <small>
            {selectedArea
              ? `Area: ${formData.area} m²`
              : "Example: [[lon1,lat1], [lon2,lat2], ...]"}
          </small>
        </div>

        <div className="form-group">
          <label>Area (m²)</label>
          <input
            type="number"
            name="area"
            value={formData.area}
            onChange={handleChange}
            placeholder="Property area in square meters"
            required
            readOnly={!!selectedArea}
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="City, State, Country"
            required
          />
        </div>

        <div className="form-group">
          <label>Property Value (ETH)</label>
          <input
            type="number"
            name="value"
            value={formData.value}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Owner Address</label>
          <input
            type="text"
            name="owner"
            value={formData.owner}
            onChange={handleChange}
            placeholder="0x..."
            required
          />
        </div>

        <div className="form-group">
          <label>Property Documents</label>
          <input
            type="file"
            name="documents"
            onChange={handleChange}
            accept=".pdf,.jpg,.jpeg,.png"
            required
          />
          <small>Upload property papers, sale deed, etc.</small>
        </div>

        <div className="form-group">
          <label>Property Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter property details..."
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register Property"}
        </button>
      </form>
    </div>
  );
}
