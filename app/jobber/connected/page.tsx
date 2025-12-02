export default function JobberConnected() {
  return (
    <div
      style={{
        padding: "60px",
        fontFamily: "system-ui",
        maxWidth: "600px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>
        🎉 Jobber Connected Successfully
      </h1>

      <p style={{ fontSize: "18px", marginBottom: "40px", lineHeight: "1.6" }}>
        Property Insights is now securely connected to your Jobber workspace.
        You can now pull job addresses, view property details, and generate
        instant insights directly inside Jobber.
      </p>

      <a
        href="/jobber"
        style={{
          display: "inline-block",
          padding: "14px 24px",
          backgroundColor: "#0a7cff",
          color: "#fff",
          borderRadius: "8px",
          fontWeight: "bold",
          textDecoration: "none",
          fontSize: "16px",
        }}
      >
        Continue to Property Insights →
      </a>
    </div>
  );
}
