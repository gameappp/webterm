import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function PUT(req) {
  try {
    await connectDB();

    // Get user token
    const token =
      req.cookies.get("token")?.value ||
      req.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { error: "وارد حساب کاربری شوید." },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get request body
    const body = await req.json();
    const { nickName, userName, phoneNumber } = body;

    // Validate required fields
    if (!nickName || !userName || !phoneNumber) {
      return NextResponse.json(
        { error: "تمام فیلدها الزامی هستند." },
        { status: 400 }
      );
    }

    // Check if userName is already taken by another user
    const existingUserByUserName = await User.findOne({
      userName: userName,
      _id: { $ne: decoded.userId }
    });

    if (existingUserByUserName) {
      return NextResponse.json(
        { error: "این نام کاربری قبلاً استفاده شده است." },
        { status: 400 }
      );
    }

    // Check if phoneNumber is already taken by another user
    const existingUserByPhone = await User.findOne({
      phoneNumber: phoneNumber,
      _id: { $ne: decoded.userId }
    });

    if (existingUserByPhone) {
      return NextResponse.json(
        { error: "این شماره تلفن قبلاً استفاده شده است." },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      {
        nickName,
        userName,
        phoneNumber,
      },
      { new: true, select: "-password -__v" }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "کاربر یافت نشد." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        user: updatedUser,
        message: "پروفایل با موفقیت به‌روزرسانی شد." 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating profile:", error);
    
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        { error: "توکن نامعتبر است." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "خطا در به‌روزرسانی پروفایل." },
      { status: 500 }
    );
  }
}

