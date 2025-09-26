// src/layouts/PublicLayout.jsx
import { Outlet } from "react-router-dom";
import PublicNavbar from "../navbars/publicNavbar";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      <div className="   ">
        <Outlet /> {/* This will render the current page (Home, Report, etc.) */}
      </div>
    </div>
  );
}
