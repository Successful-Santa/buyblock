import React from "react";
import "./ConfirmDialog.css";

export default function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="buttons">
          <button className="cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="confirm" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
