import React, { useState } from "react";
import "./SearchPanel.css";

const SearchPanel = ({ onSearch }) => {
  const [filters, setFilters] = useState({
    owner: "",
    status: "",
    minValue: "",
    maxValue: "",
    minArea: "",
    maxArea: "",
    location: "",
    verified: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  return (
    <div className="search-panel">
      <form onSubmit={handleSubmit}>
        <h3>Search Properties</h3>

        <div className="form-group">
          <label>Owner Address</label>
          <input
            type="text"
            name="owner"
            value={filters.owner}
            onChange={handleChange}
            placeholder="0x..."
          />
        </div>

        <div className="form-group">
          <label>Status</label>
          <select name="status" value={filters.status} onChange={handleChange}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="disputed">Disputed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Min Value</label>
            <input
              type="number"
              name="minValue"
              value={filters.minValue}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label>Max Value</label>
            <input
              type="number"
              name="maxValue"
              value={filters.maxValue}
              onChange={handleChange}
              placeholder="1000000"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Min Area (m²)</label>
            <input
              type="number"
              name="minArea"
              value={filters.minArea}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label>Max Area (m²)</label>
            <input
              type="number"
              name="maxArea"
              value={filters.maxArea}
              onChange={handleChange}
              placeholder="10000"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleChange}
            placeholder="City, Region"
          />
        </div>

        <div className="form-group">
          <label>Verification Status</label>
          <select
            name="verified"
            value={filters.verified}
            onChange={handleChange}
          >
            <option value="">All</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
        </div>

        <button type="submit" className="search-button">
          Search Properties
        </button>
      </form>
    </div>
  );
};

export default SearchPanel;
