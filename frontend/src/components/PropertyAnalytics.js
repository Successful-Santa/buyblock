import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./PropertyAnalytics.css";

const PropertyAnalytics = ({ analytics }) => {
  const { valuationTrends, nearbyValues, pricePerArea } = analytics;

  return (
    <div className="property-analytics">
      <h3>Property Analytics</h3>

      <div className="chart-section">
        <h4>Valuation History</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={valuationTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="valuation_date"
              tickFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(date) => new Date(date).toLocaleDateString()}
              formatter={(value) => [`$${value.toLocaleString()}`, "Value"]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#1a73e8"
              strokeWidth={2}
              dot={{ fill: "#1a73e8" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-section">
        <h4>Price per Square Meter Trend</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={pricePerArea}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(date) => new Date(date).toLocaleDateString()}
              formatter={(value) => [
                `$${value.toLocaleString()}/m²`,
                "Price/m²",
              ]}
            />
            <Line
              type="monotone"
              dataKey="pricePerSqm"
              stroke="#34a853"
              strokeWidth={2}
              dot={{ fill: "#34a853" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="nearby-properties">
        <h4>Nearby Properties</h4>
        <div className="nearby-grid">
          {nearbyValues.map((property) => (
            <div key={property.parcel_id} className="nearby-card">
              <div className="value">${property.value.toLocaleString()}</div>
              <div className="details">
                <div>Area: {property.area}m²</div>
                <div>
                  Price/m²: ${(property.value / property.area).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyAnalytics;
