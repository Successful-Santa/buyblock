import React, { useState } from "react";
import axios from "axios";
import "./RegisterParcel.css";

export default function RegisterParcel({ onClose }) {
  const [formData, setFormData] = useState({
    coordinates: "",
    owner: "",
    documents: null,
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // TODO: Implement actual registration
      // 1. Upload documents to IPFS
      // 2. Call smart contract to register
      // 3. Update backend database
      alert("Registration feature will be implemented soon!");
    } catch (err) {
      setError(err.message);
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
            placeholder="Enter GeoJSON coordinates"
            required
          />
          <small>Example: [[lon1,lat1], [lon2,lat2], ...]</small>
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
