import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();

    const { search } = await req.json();

    const users = await User.find({ deletedAt: null }, "-__v");

    const filteredUsers = await users.filter(
      (item) => item.nickName.includes(search) || item.userName.includes(search)
    );

    return NextResponse.json(
      {
        message: "جست و جو انجام شد",
        users: filteredUsers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("خطا در ثبت‌ نام:", error);
    return NextResponse.json({ error: "مشکلی رخ داده است." }, { status: 500 });
  }
}
