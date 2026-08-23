import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./Routes/Router.jsx";
import AuthProvider from "./provider/AuthProvider.jsx";
import ThemeProvider from "./provider/ThemeProvider.jsx";
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
        <Toaster/>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);
