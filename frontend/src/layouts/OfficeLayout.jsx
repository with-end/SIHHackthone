import React from "react";
import { Outlet, useParams } from "react-router-dom";
import OfficeNavbar from "../navbars/OfficeNavbar";

export default function OfficeLayout({mode}) {
   
       let variable ;
       if( mode=="department" ){
           const { deptId } = useParams() ;
           variable = deptId ;
       }
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Constant Navbar */}
      <OfficeNavbar isLoggedIn={false} mode={mode} variable={variable} />

      {/* Page Content */}
      <main className="flex-grow p-6">
        <Outlet /> {/* 👈 This is where the page changes */}
      </main>

      {/* Footer (optional) */}
      <footer className="bg-blue-900 text-white text-center p-3">
        © 2025 Nagarpalika Dashboard | Designed for Civic Management
      </footer>
    </div>
  );
}
