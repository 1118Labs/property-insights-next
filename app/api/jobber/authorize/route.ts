import { handleJobberAuth } from "../auth/route";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleJobberAuth(request);
}
