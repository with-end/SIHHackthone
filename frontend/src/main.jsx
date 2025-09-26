import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css"; // keep your Tailwind styles
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./i18n"; 
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { store } from "./store/store.js";



// Create a Query Client
const queryClient = new QueryClient();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.error('SW registration failed:', err));
  });
}



ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
     <BrowserRouter>
      <App />
      <Toaster  reverseOrder={false} />
    </BrowserRouter>
    </HelmetProvider>
    </QueryClientProvider>
    </Provider>
  </>
  
);

