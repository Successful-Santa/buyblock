import React, { useEffect, useState } from "react";
import axios from "axios";
import ConfirmDialog from "./ConfirmDialog";
import PropertyHistory from "./PropertyHistory";
import PropertyAnalytics from "./PropertyAnalytics";
import "./ParcelDetails.css";

export default function ParcelDetails({ parcelId, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transferTo, setTransferTo] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [propertyHistory, setPropertyHistory] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (!parcelId) return;
    setLoading(true);

    // Fetch all data in parallel
    Promise.all([
      axios.get(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3001"
        }/api/parcels/${parcelId}`
      ),
      axios.get(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3001"
        }/api/parcels/${parcelId}/history`
      ),
      axios.get(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3001"
        }/api/parcels/${parcelId}/analytics`
      ),
    ])
      .then(([detailsRes, historyRes, analyticsRes]) => {
        setDetails(detailsRes.data);
        setPropertyHistory(historyRes.data);
        setAnalytics(analyticsRes.data);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.error || err.message);
      })
      .finally(() => setLoading(false));
  }, [parcelId]);

  if (!parcelId) return null;
  if (loading) return <div className="parcel-details loading">Loading...</div>;
  if (error) return <div className="parcel-details error">Error: {error}</div>;

  const { db, onchain } = details;
  const verifiedOnChain = onchain && !onchain.error;

  const handleTransfer = async (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const confirmTransfer = async () => {
    try {
      // TODO: Implement actual transfer
      // 1. Call smart contract transfer function
      // 2. Update backend database
      alert("Transfer will be implemented soon!");
      setShowConfirm(false);
      setTransferTo("");
    } catch (err) {
      setError(`Transfer failed: ${err.message}`);
      setShowConfirm(false);
    }
  };
  const shortenAddress = (addr) => {
    if (!addr) return "-";
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const renderDetailsTab = () => (
    <>
      <div className="status">
        <div
          className={`verification ${verifiedOnChain ? "verified" : "pending"}`}
        >
          {verifiedOnChain
            ? "✓ Verified On-Chain"
            : "⚠ Pending Blockchain Verification"}
        </div>
      </div>

      <div className="section">
        <h3>Property Information</h3>
        <table>
          <tbody>
            <tr>
              <td>Owner:</td>
              <td>
                {shortenAddress(verifiedOnChain ? onchain.owner : db.owner)}
              </td>
            </tr>
            <tr>
              <td>Registration Date:</td>
              <td>
                {formatDate(
                  verifiedOnChain ? onchain.registeredAt : db.registered_at
                )}
              </td>
            </tr>
            <tr>
              <td>Area:</td>
              <td>{db.area || "N/A"} m²</td>
            </tr>
            <tr>
              <td>Location:</td>
              <td>{db.location || "N/A"}</td>
            </tr>
            <tr>
              <td>Current Value:</td>
              <td>${db.value?.toLocaleString() || "N/A"}</td>
            </tr>
            <tr>
              <td>Status:</td>
              <td style={{ textTransform: "capitalize" }}>
                {db.status || "Active"}
              </td>
            </tr>
            <tr>
              <td>Document Hash:</td>
              <td className="hash">{shortenAddress(db.doc_hash)}</td>
            </tr>
            <tr>
              <td>IPFS Link:</td>
              <td>
                <a
                  href={db.metadata_uri || db.geojson?.properties?.geoCid}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Documents
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {verifiedOnChain && (
        <div className="section">
          <h3>Transfer Property</h3>
          <form onSubmit={handleTransfer}>
            <input
              type="text"
              placeholder="Enter recipient address"
              value={transferTo}
              onChange={(e) => setTransferTo(e.target.value)}
            />
            <button type="submit" className="primary">
              Request Transfer
            </button>
          </form>
        </div>
      )}
    </>
  );

  return (
    <div className="parcel-details">
      <div className="header">
        <h2>Parcel {parcelId} Details</h2>
        <button onClick={onClose}>×</button>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "details" ? "active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          Details
        </button>
        <button
          className={`tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>
        <button
          className={`tab ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "details" && renderDetailsTab()}
        {activeTab === "history" && (
          <PropertyHistory history={propertyHistory} />
        )}
        {activeTab === "analytics" && (
          <PropertyAnalytics analytics={analytics} />
        )}
      </div>

      {showConfirm && (
        <ConfirmDialog
          title="Confirm Property Transfer"
          message={`Are you sure you want to transfer this property to ${transferTo}? This action cannot be undone.`}
          onConfirm={confirmTransfer}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
