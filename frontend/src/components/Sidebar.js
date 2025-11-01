import React, { useContext, useEffect, useState } from "react";
import { SelectedParcelContext } from "./SelectedParcelContext";
import axios from "axios";

export default function Sidebar() {
  const { selected } = useContext(SelectedParcelContext);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!selected) return setDetails(null);
    axios
      .get(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:4000"
        }/api/parcels/${selected}`
      )
      .then((r) => setDetails(r.data))
      .catch((e) => setDetails({ error: e.message }));
  }, [selected]);

  if (!selected) return <div className="sidebar">Select a parcel</div>;
  return (
    <div className="sidebar">
      <h3>Parcel {selected}</h3>
      {details ? (
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {JSON.stringify(details, null, 2)}
        </pre>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
