import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css"; // keep your Tailwind styles
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./i18n"; 



// Create a Query Client
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
     <BrowserRouter>
      <App />
    </BrowserRouter>
    </HelmetProvider>
    </QueryClientProvider>
  </>
  
);

