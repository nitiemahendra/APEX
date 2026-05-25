import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "../apex-advisor_2.jsx";

window.storage = {
  async get(key) {
    const res = await fetch(`/api/storage/${encodeURIComponent(key)}`);
    if (!res.ok) return null;
    return res.json();
  },
  async set(key, value) {
    await fetch(`/api/storage/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
  },
  async remove(key) {
    await fetch(`/api/storage/${encodeURIComponent(key)}`, { method: "DELETE" });
  },
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
