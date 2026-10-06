import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";

// Keep Bootstrap during the migration.
// We will remove it only after the existing UI
// has been successfully migrated to Tailwind.
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);