// app/jobber/page.tsx
"use client";

export default function JobberConnectPage() {
  const handleConnect = () => {
    window.location.href = "/api/jobber/authorize";
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Connect Property Insights to Jobber</h1>
      <p>This will redirect you to Jobber to approve the integration.</p>
      <button
        style={{
          padding: "12px 20px",
          fontSize: 18,
          borderRadius: 8,
          cursor: "pointer",
          background: "#0a84ff",
          color: "white",
        }}
        onClick={handleConnect}
      >
        Connect to Jobber
      </button>
    </div>
  );
}
