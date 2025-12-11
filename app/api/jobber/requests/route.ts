// app/api/jobber/requests/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const JOBBER_GRAPHQL_ENDPOINT = 'https://api.getjobber.com/api/graphql';

// If you later add JOBBER_GRAPHQL_VERSION to Netlify, this will use it.
// Otherwise it falls back to the example version you showed me.
const JOBBER_GRAPHQL_VERSION =
  process.env.JOBBER_GRAPHQL_VERSION ?? '2025-04-16';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
  }
);

// NOTE: this query ONLY uses scalar fields that are 100% present on `Request`
// from the docs you pasted. No `orderBy`, no `status` field, no bare `address`.
const GET_REQUESTS_QUERY = /* GraphQL */ `
  query GetRequests($first: Int = 50) {
    requests(first: $first) {
      nodes {
        id
        title
        requestStatus
        source
        companyName
        contactName
        email
        phone
        jobberWebUri
        createdAt
        updatedAt
      }
    }
  }
`;

type JobberRequestNode = {
  id: string;
  title?: string | null;
  requestStatus: string;
  source: string;
  companyName?: string | null;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  jobberWebUri: string;
  createdAt: string;
  updatedAt: string;
};

type JobberGraphQLError = {
  message: string;
  extensions?: {
    code?: string;
    [key: string]: unknown;
  };
};

type JobberGraphQLResponse = {
  data?: {
    requests?: {
      nodes?: JobberRequestNode[];
    };
  };
  errors?: JobberGraphQLError[];
};

type NormalizedError = {
  code?: string;
  message: string;
  status: number;
};

async function getLatestJobberAccessToken(): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('jobber_tokens')
    .select('access_token, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data || !data.access_token) {
    return null;
  }

  return data.access_token as string;
}

function buildError(
  message: string,
  status: number,
  code?: string
): NormalizedError {
  return { code, message, status };
}

export async function GET() {
  try {
    const accessToken = await getLatestJobberAccessToken();

    if (!accessToken) {
      const error = buildError(
        'No Jobber access token is available. Connect Jobber first.',
        401,
        'missing_token'
      );
      return NextResponse.json({ ok: false, error });
    }

    const graphqlRes = await fetch(JOBBER_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'X-JOBBER-GRAPHQL-VERSION': JOBBER_GRAPHQL_VERSION,
      },
      body: JSON.stringify({
        query: GET_REQUESTS_QUERY,
        variables: { first: 50 },
      }),
    });

    const json = (await graphqlRes.json()) as JobberGraphQLResponse;

    if (!graphqlRes.ok) {
      const message =
        json.errors?.[0]?.message ||
        `Jobber GraphQL HTTP error (${graphqlRes.status})`;
      const code = json.errors?.[0]?.extensions?.code;
      const error = buildError(message, graphqlRes.status, code);
      return NextResponse.json({ ok: false, error });
    }

    if (json.errors && json.errors.length > 0) {
      const first = json.errors[0];
      const error = buildError(
        `Jobber GraphQL error (${graphqlRes.status}): ${first.message}`,
        graphqlRes.status,
        first.extensions?.code
      );
      return NextResponse.json({ ok: false, error });
    }

    const nodes = json.data?.requests?.nodes ?? [];

    // Normalized shape for the UI. We keep names simple and stable.
    const requests = nodes.map((r) => ({
      id: r.id,
      title: r.title ?? null,
      status: r.requestStatus,
      source: r.source,
      companyName: r.companyName ?? null,
      contactName: r.contactName ?? null,
      email: r.email ?? null,
      phone: r.phone ?? null,
      jobberWebUri: r.jobberWebUri,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    return NextResponse.json({
      ok: true,
      data: {
        requests,
      },
    });
  } catch (err: unknown) {
    console.error('Unexpected error in /api/jobber/requests:', err);

    const message =
      err instanceof Error ? err.message : 'Unknown error fetching Jobber data';

    const error = buildError(message, 500, 'unexpected_error');

    return NextResponse.json({ ok: false, error });
  }
}
