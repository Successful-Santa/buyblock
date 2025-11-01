import React, { useContext, useEffect, useState } from "react";
import { SelectedParcelContext } from "./SelectedParcelContext";
import axios from "axios";
import SearchPanel from "./SearchPanel";

export default function Sidebar() {
  const { selected, setSelected } = useContext(SelectedParcelContext);
  const [details, setDetails] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [activeTab, setActiveTab] = useState("details"); // 'details' or 'search'

  useEffect(() => {
    if (!selected) {
      setDetails(null);
      return;
    }
    axios
      .get(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3001"
        }/api/parcels/${selected}`
      )
      .then((r) => setDetails(r.data))
      .catch((e) => setDetails({ error: e.message }));
  }, [selected]);

  const handleSearch = async (filters) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== undefined && value !== null) {
          params.append(key, value);
        }
      });

      const response = await axios.get(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3001"
        }/api/parcels/search?${params}`
      );
      setSearchResults(response.data);
      setActiveTab("search");
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults({ error: error.message });
    }
  };

  const renderParcelDetails = () => {
    if (!details) {
      return <div className="loading">Loading parcel details...</div>;
    }

    if (details.error) {
      return <div className="error">Error: {details.error}</div>;
    }

    const dbData = details.db || {};
    const onchainData = details.onchain || {};

    return (
      <div className="parcel-details">
        <div className="detail-section">
          <h4>Database Information</h4>
          <p>
            <strong>Owner:</strong> {dbData.owner || "N/A"}
          </p>
          {dbData.area && (
            <p>
              <strong>Area:</strong> {dbData.area} m²
            </p>
          )}
          {dbData.location && (
            <p>
              <strong>Location:</strong> {dbData.location}
            </p>
          )}
          {dbData.value && (
            <p>
              <strong>Value:</strong> {dbData.value} ETH
            </p>
          )}
          {dbData.description && (
            <p>
              <strong>Description:</strong> {dbData.description}
            </p>
          )}
          {dbData.registered_at && (
            <p>
              <strong>Registered:</strong>{" "}
              {new Date(dbData.registered_at).toLocaleString()}
            </p>
          )}
        </div>

        {onchainData && !onchainData.error && (
          <div className="detail-section">
            <h4>Blockchain Information</h4>
            <p>
              <strong>Owner:</strong> {onchainData.owner || "N/A"}
            </p>
            {onchainData.geoCid && (
              <p>
                <strong>Geo CID:</strong> {onchainData.geoCid}
              </p>
            )}
            {onchainData.registeredAt && (
              <p>
                <strong>Registered At:</strong> {onchainData.registeredAt}
              </p>
            )}
          </div>
        )}

        {onchainData && onchainData.error && (
          <div className="detail-section">
            <h4>Blockchain Information</h4>
            <p className="info">{onchainData.error}</p>
          </div>
        )}

        {details.history && details.history.length > 0 && (
          <div className="detail-section">
            <h4>Ownership History</h4>
            {details.history.map((h, idx) => (
              <div key={idx} className="history-item">
                <p>
                  <strong>From:</strong> {h.previous_owner || "N/A"}
                </p>
                <p>
                  <strong>To:</strong> {h.new_owner}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(h.changed_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSearchResults = () => {
    if (!searchResults) return null;
    if (searchResults.error)
      return <div className="error">Error: {searchResults.error}</div>;

    if (searchResults.length === 0) {
      return (
        <div className="no-results">
          No parcels found matching your criteria.
        </div>
      );
    }

    return (
      <div className="search-results">
        <h4>Search Results ({searchResults.length} found)</h4>
        <div className="results-list">
          {searchResults.map((parcel) => (
            <div
              key={parcel.parcel_id}
              className="result-item"
              onClick={() => setSelected(parcel.parcel_id)}
            >
              <div className="result-header">
                <strong>Parcel #{parcel.parcel_id}</strong>
                <span className="status">{parcel.status || "Active"}</span>
              </div>
              <div className="result-details">
                <p>
                  <strong>Owner:</strong> {parcel.owner}
                </p>
                {parcel.area && (
                  <p>
                    <strong>Area:</strong> {parcel.area} m²
                  </p>
                )}
                {parcel.location && (
                  <p>
                    <strong>Location:</strong> {parcel.location}
                  </p>
                )}
                {parcel.value && (
                  <p>
                    <strong>Value:</strong> ${parcel.value}
                  </p>
                )}
                <p>
                  <strong>Verified:</strong> {parcel.is_verified ? "Yes" : "No"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!selected) {
    return (
      <div className="sidebar">
        <div className="tabs">
          <button
            className={activeTab === "search" ? "active" : ""}
            onClick={() => setActiveTab("search")}
          >
            Search
          </button>
        </div>
        {activeTab === "search" && (
          <>
            <SearchPanel onSearch={handleSearch} />
            {renderSearchResults()}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="sidebar">
      <div className="tabs">
        <button
          className={activeTab === "details" ? "active" : ""}
          onClick={() => setActiveTab("details")}
        >
          Details
        </button>
        <button
          className={activeTab === "search" ? "active" : ""}
          onClick={() => setActiveTab("search")}
        >
          Search
        </button>
      </div>

      {activeTab === "details" && (
        <>
          <h3>Parcel {selected}</h3>
          {renderParcelDetails()}
        </>
      )}

      {activeTab === "search" && (
        <>
          <SearchPanel onSearch={handleSearch} />
          {renderSearchResults()}
        </>
      )}
    </div>
  );
}
