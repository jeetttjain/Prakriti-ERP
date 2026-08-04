import React from "react";

/**
 * Standard badge component displaying color-coded stock availability status.
 * @component
 * @param {Object} props
 * @param {string} props.status 'In Stock' | 'Low Stock' | 'Out Of Stock'
 */
export default function StockStatusBadge({ status }) {
  let badgeClass = "badge-info";
  let customStyle = {};

  if (status === "In Stock") {
    badgeClass = "badge-success";
  } else if (status === "Low Stock") {
    // Custom warning style matching dashboard alerts
    customStyle = {
      backgroundColor: "#fff3cd",
      color: "#856404",
      border: "1px solid #ffeeba",
      padding: "4px 8px",
      borderRadius: "4px",
      fontWeight: "600",
      fontSize: "0.75rem",
      display: "inline-block",
    };
  } else if (status === "Out Of Stock") {
    badgeClass = "badge-danger";
  }

  return (
    <span className={`badge ${badgeClass}`} style={customStyle}>
      {status}
    </span>
  );
}
