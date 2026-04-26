import React from "react";
import ReactDOM from "react-dom/client";
import "./App.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
// StrictMode hataya — dev me double invoke band
root.render(<App />);
