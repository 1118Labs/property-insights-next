"use client";

export default function Home() {
  const handleConnect = () => {
    // This will redirect to our authorize route, which then sends you to Jobber
    window.location.href = "/api/jobber/authorize";
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-lg w-full p-8 bg-white rounded-xl shadow">
        <h1 className="text-3xl font-bold mb-4">Property Insights – Jobber Connect</h1>
        <p className="mb-6 text-gray-700">
          Click the button below to connect your Jobber account. You’ll be taken to
          Jobber to approve access, then redirected back here and we’ll exchange the
          authorization code for access tokens.
        </p>

        <button
          onClick={handleConnect}
          className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
        >
          Connect Jobber
        </button>

        <p className="mt-4 text-sm text-gray-500">
          Once connected, we’ll be able to pull client addresses from Jobber and run
          property insights lookups.
        </p>
      </div>
    </main>
  );
}
