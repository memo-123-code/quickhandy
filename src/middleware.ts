import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Always allow direct access in development / preview mode
  return NextResponse.next();
}

// Specify the paths that the middleware should run on
export const config = {
  matcher: [
    "/dashboard/:path*",
  ],
};
