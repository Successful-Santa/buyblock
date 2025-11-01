import React from "react";
import MapView from "./components/MapView";
import Sidebar from "./components/Sidebar";
import SelectedParcelProvider from "./components/SelectedParcelContext";

export default function App() {
  return (
    <SelectedParcelProvider>
      <div className="app">
        <MapView />
        <Sidebar />
      </div>
    </SelectedParcelProvider>
  );
}
