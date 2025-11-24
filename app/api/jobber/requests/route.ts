// app/api/jobber/requests/route.ts

import "@/lib/supabase/server";               // ⬅️ NEW — forces server.ts to execute
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

const JOBBER_GRAPHQL_URL = "https://api.getjobber.com/api/graphql";

// Recent Jobber Requests query (GraphQL)
const RECENT_REQUESTS_QUERY = `
  query RecentRequests($first: Int!) {
    requests(first: $first, orderBy: { field: CREATED_AT, direction: DESC }) {
      edges {
        node {
          id
          title
          status
          createdAt
          client {
            id
            firstName
            lastName
          }
          property {
            id
            address {
              line1
              line2
              city
              province
              postalCode
              country
            }
          }
        }
      }
    }
  }
`;

export async function GET() {
  try {
    // 1) Read latest Jobber tokens from Supabase
    const { data: tokenRow, error: tokenError } = await supabaseAdmin
      .from("jobber_tokens")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tokenError) {
      console.error("Error reading jobber_tokens:", tokenError);
      return NextResponse.json(
        { error: "Failed to read Jobber tokens" },
        { status: 500 }
      );
    }

    if (!tokenRow?.access_token) {
      return NextResponse.json(
        {
          error: "No Jobber tokens found. Please connect Jobber first.",
        },
        { status: 401 }
      );
    }

    const accessToken = tokenRow.access_token as string;

    // 2) Build GraphQL request
    const graphqlBody = {
      query: RECENT_REQUESTS_QUERY,
      variables: { first: 10 },
    };

    const jobberRes = await fetch(JOBBER_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(graphqlBody),
    });

    const text = await jobberRes.text();

    if (!jobberRes.ok) {
      console.error("Jobber GraphQL error:", text);
      return NextResponse.json(
        { error: "Jobber GraphQL request failed", details: text },
        { status: 502 }
      );
    }

    const json = JSON.parse(text);

    // 3) Return the Jobber data
    return NextResponse.json(json);
  } catch (err) {
    console.error("Unexpected error in /api/jobber/requests:", err);
    return NextResponse.json(
      { error: "Unexpected server error", details: String(err) },
      { status: 500 }
    );
  }
}
