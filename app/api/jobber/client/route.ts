import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { clientId } = await req.json();

    if (!clientId) {
      return NextResponse.json(
        { error: "Missing clientId in request body" },
        { status: 400 }
      );
    }

    const accessToken = process.env.JOBBER_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing JOBBER_ACCESS_TOKEN in env vars" },
        { status: 500 }
      );
    }

    const res = await fetch(
      `https://api.getjobber.com/api/clients/${clientId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {
          error: "Jobber returned an error",
          status: res.status,
          details: data,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Exception during Jobber client fetch", details: err.message },
      { status: 500 }
    );
  }
}
