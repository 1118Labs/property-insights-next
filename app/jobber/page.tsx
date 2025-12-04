"use client";

export default function JobberConnectPage() {

  function connect() {
    window.location.href = "/api/jobber/authorize";
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Connect Property Insights to Jobber</h1>
      <p>This will redirect you to Jobber to approve the integration.</p>

      <button
        onClick={connect}
        style={{
          padding: "10px 20px",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Connect to Jobber
      </button>
    </div>
  );
}
