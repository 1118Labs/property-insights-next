// Alias for /api/jobber/auth to match docs and UI links
import { handleJobberAuth } from "../auth/route";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleJobberAuth(request);
}
