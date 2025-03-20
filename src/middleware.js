import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const currentPath = request.nextUrl.pathname;

  // اگه توکن وجود داره یا مسیر فعلی "/auth" هست، درخواست ادامه پیدا می‌کنه
  if (token || currentPath === "/auth") {
    return NextResponse.next();
  }

  // اگه توکن نداره و مسیر فعلی "/auth" نیست، ریدایرکت به "/auth"
  const url = new URL(request.url);
  url.pathname = "/auth";
  return NextResponse.redirect(url.toString());
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico|images|api).*)"],
};
