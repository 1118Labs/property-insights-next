type JobberPageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function JobberFramePage({ searchParams }: JobberPageProps) {
  const jobIdParam = searchParams["job_id"];
  const jobId =
    Array.isArray(jobIdParam) ? jobIdParam[0] : jobIdParam ?? "unknown";

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "24px",
        backgroundColor: "#f5f7fb",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "12px",
          padding: "24px 28px",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "24px", margin: 0 }}>
              AI Property Insights
            </h1>
            <p style={{ margin: "6px 0 0", color: "#64748b" }}>
              Embedded inside Jobber · Job ID:{" "}
              <span style={{ fontWeight: 600 }}>{jobId}</span>
            </p>
          </div>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "999px",
              fontSize: "12px",
              background: "#e0f2fe",
              color: "#0369a1",
              fontWeight: 600,
            }}
          >
            Connected
          </span>
        </header>

        <section
          style={{
            marginBottom: "20px",
            padding: "16px",
            borderRadius: "10px",
            background:
              "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(45,212,191,0.08))",
          }}
        >
          <h2 style={{ margin: "0 0 8px", fontSize: "18px" }}>
            Property Insights Panel
          </h2>
          <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>
            This view is loaded directly from the Jobber job you just opened.
            In the next pass, we’ll use this <strong>Job ID</strong> to pull
            the job&apos;s address from Jobber, fetch enriched property data
            (beds, baths, lot size, AVM, comps), and display your full
            quote-ready insight stack.
          </p>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "16px",
          }}
        >
          <div
            style={{
              padding: "16px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "10px" }}>
              Coming Next: Live Job + Property Data
            </h3>
            <ul
              style={{
                margin: 0,
                paddingLeft: "18px",
                color: "#475569",
                lineHeight: 1.7,
              }}
            >
              <li>Pull job details from Jobber using the Job ID</li>
              <li>Extract the service address automatically</li>
              <li>Call the Property Insights engine for rich data</li>
              <li>Surface a clean, quote-ready summary for your team</li>
            </ul>
          </div>

          <div
            style={{
              padding: "16px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
            }}
          >
            <h4 style={{ marginTop: 0, marginBottom: "8px" }}>
              Debug Information
            </h4>
            <p style={{ margin: "0 0 6px", fontSize: "14px", color: "#64748b" }}>
              <strong>Jobber → iframe query params</strong>
            </p>
            <pre
              style={{
                margin: 0,
                padding: "8px",
                fontSize: "12px",
                background: "#0f172a",
                color: "#e2e8f0",
                borderRadius: "6px",
                overflowX: "auto",
              }}
            >
{JSON.stringify(searchParams, null, 2)}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
