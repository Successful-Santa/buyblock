import React, { useState } from "react";
import "./PropertyHistory.css";

const PropertyHistory = ({ history }) => {
  const [activeTab, setActiveTab] = useState("ownership");
  const { ownershipHistory, valuationHistory, disputeHistory } = history;

  const renderOwnershipHistory = () => (
    <div className="history-list">
      {ownershipHistory.map((record, index) => (
        <div key={record.id} className="history-item">
          <div className="history-icon transfer" />
          <div className="history-content">
            <div className="history-header">
              <span className="date">
                {new Date(record.changed_at).toLocaleDateString()}
              </span>
              {record.price && (
                <span className="price">${record.price.toLocaleString()}</span>
              )}
            </div>
            <div className="transfer-details">
              <div>From: {record.previous_owner}</div>
              <div>To: {record.new_owner}</div>
            </div>
            {record.document_uri && (
              <a
                href={record.document_uri}
                target="_blank"
                rel="noopener noreferrer"
                className="document-link"
              >
                View Transfer Document
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderValuationHistory = () => (
    <div className="history-list">
      {valuationHistory.map((record) => (
        <div key={record.id} className="history-item">
          <div className="history-icon valuation" />
          <div className="history-content">
            <div className="history-header">
              <span className="date">
                {new Date(record.valuation_date).toLocaleDateString()}
              </span>
              <span className="value">${record.value.toLocaleString()}</span>
            </div>
            <div className="valuation-details">
              <div>Type: {record.valuation_type}</div>
              {record.appraiser && <div>Appraiser: {record.appraiser}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDisputeHistory = () => (
    <div className="history-list">
      {disputeHistory.map((record) => (
        <div key={record.id} className="history-item">
          <div className="history-icon dispute" />
          <div className="history-content">
            <div className="history-header">
              <span className="date">
                {new Date(record.dispute_date).toLocaleDateString()}
              </span>
              <span className={`status ${record.status}`}>{record.status}</span>
            </div>
            <div className="dispute-details">
              <div>Type: {record.dispute_type}</div>
              <div>Filed by: {record.disputed_by}</div>
              {record.description && (
                <div className="description">{record.description}</div>
              )}
              {record.resolution_date && (
                <div className="resolution">
                  Resolved on:{" "}
                  {new Date(record.resolution_date).toLocaleDateString()}
                  {record.resolved_by && ` by ${record.resolved_by}`}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="property-history">
      <h3>Property History</h3>

      <div className="history-tabs">
        <button
          className={`tab ${activeTab === "ownership" ? "active" : ""}`}
          onClick={() => setActiveTab("ownership")}
        >
          Ownership
        </button>
        <button
          className={`tab ${activeTab === "valuations" ? "active" : ""}`}
          onClick={() => setActiveTab("valuations")}
        >
          Valuations
        </button>
        <button
          className={`tab ${activeTab === "disputes" ? "active" : ""}`}
          onClick={() => setActiveTab("disputes")}
        >
          Disputes
        </button>
      </div>

      <div className="history-content">
        {activeTab === "ownership" && renderOwnershipHistory()}
        {activeTab === "valuations" && renderValuationHistory()}
        {activeTab === "disputes" && renderDisputeHistory()}
      </div>
    </div>
  );
};

export default PropertyHistory;
