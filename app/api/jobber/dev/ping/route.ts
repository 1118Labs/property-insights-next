// app/api/jobber/dev/ping/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const JOBBER_GRAPHQL_ENDPOINT = 'https://api.getjobber.com/api/graphql';
const JOBBER_GRAPHQL_VERSION =
  process.env.JOBBER_GRAPHQL_VERSION ?? '2025-04-16';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
  }
);

// Reuse the exact same query as /api/jobber/requests.
// Keeping this in sync is what prevents future “orderBy”/“status” surprises.
const GET_REQUESTS_QUERY = /* GraphQL */ `
  query GetRequests {
    requests(first: 50) {
      nodes {
        id
        title
        requestStatus
        source
        createdAt

        client {
          id
          firstName
          lastName
          emails {
            address
          }
          phones {
            number
          }
        }

        property {
          id
          address {
            address
            city
            province
            postalCode
            country
          }
        }

        jobs(first: 10) {
          nodes {
            id
            jobStatus
            title
            createdAt
          }
        }
      }
    }
  }
`;

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
      nodes?: {
        id: string;
        title?: string | null;
        requestStatus: string;
        source?: string | null;
        createdAt: string;
        client?: {
          id?: string | null;
          firstName?: string | null;
          lastName?: string | null;
          emails?: Array<{ address?: string | null }> | null;
          phones?: Array<{ number?: string | null }> | null;
        } | null;
        property?: {
          id?: string | null;
          address?: {
            address?: string | null;
            city?: string | null;
            province?: string | null;
            postalCode?: string | null;
            country?: string | null;
          } | null;
        } | null;
        jobs?: {
          nodes?: Array<{
            id?: string | null;
            jobStatus?: string | null;
            title?: string | null;
            createdAt?: string | null;
          }>;
        } | null;
      }[];
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

    // For the dev ping we only return a tiny sample slice so the payload stays small.
    const sample = nodes.slice(0, 3).map((r) => ({
      id: r.id,
      title: r.title ?? null,
      status: r.requestStatus,
      source: r.source ?? null,
      createdAt: r.createdAt,
      client: r.client
        ? {
            id: r.client.id ?? null,
            firstName: r.client.firstName ?? null,
            lastName: r.client.lastName ?? null,
            emails: r.client.emails ?? [],
            phones: r.client.phones ?? [],
          }
        : null,
      property: r.property
        ? {
            id: r.property.id ?? null,
            address: {
              address: r.property.address?.address ?? null,
              city: r.property.address?.city ?? null,
              province: r.property.address?.province ?? null,
              postalCode: r.property.address?.postalCode ?? null,
              country: r.property.address?.country ?? null,
            },
          }
        : null,
      jobs:
        r.jobs?.nodes?.map((job) => ({
          id: job?.id ?? null,
          title: job?.title ?? null,
          status: job?.jobStatus ?? null,
          createdAt: job?.createdAt ?? null,
        })) ?? [],
    }));

    return NextResponse.json({
      ok: true,
      data: {
        sample,
        count: nodes.length,
      },
    });
  } catch (err: unknown) {
    console.error('Unexpected error in /api/jobber/dev/ping:', err);

    const message =
      err instanceof Error ? err.message : 'Unknown error running Jobber dev ping';

    const error = buildError(message, 500, 'unexpected_error');

    return NextResponse.json({ ok: false, error });
  }
}
