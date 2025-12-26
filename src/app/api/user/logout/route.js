import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function POST(req) {
  try {
    // Clear the token cookie by setting it to expire immediately
    const cookie = serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
      maxAge: 0, // Expire immediately
    });

    const response = NextResponse.json(
      {
        message: "خروج با موفقیت انجام شد",
      },
      { status: 200 }
    );

    response.headers.set("Set-Cookie", cookie);

    return response;
  } catch (error) {
    console.error("خطا در خروج:", error);
    return NextResponse.json({ error: "مشکلی رخ داده است." }, { status: 500 });
  }
}

