import TicTacToe from "@/models/TicTacToe";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { roomId } = body;

    // دریافت توکن از cookie یا header
    const authHeader = req.headers.get("authorization");
    const token =
      req.cookies.get("token")?.value ||
      (authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);

    if (!token) {
      return NextResponse.json(
        { message: "وارد حساب کاربری شوید" },
        { status: 401 }
      );
    }

    // استخراج userId از توکن
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { message: "توکن نامعتبر است" },
        { status: 401 }
      );
    }

    console.log("Fetching room:", { roomId, userId });

    if (!roomId) {
      console.error("Missing roomId");
      return NextResponse.json(
        { message: "آیدی اتاق اجباری میباشد" },
        { status: 400 }
      );
    }

    const room = await TicTacToe.findOne({ roomId });
    console.log("Room found:", room ? "Yes" : "No");
    
    if (!room) {
      return NextResponse.json(
        { message: "اتاق مورد نظر یافت نشد" },
        { status: 404 }
      );
    }

    const player1 = await User.findOne({ _id: room.player1 }, "-__v -password");
    const player2 = await User.findOne({ _id: room.player2 }, "-__v -password");

    if (!player1 || !player2) {
      return NextResponse.json(
        { message: "بازکن ها یافت نشدند" },
        { status: 400 }
      );
    }

    let user, opponent;
    if (room.player1 === userId) {
      user = player1;
      opponent = player2;
    } else if (room.player2 === userId) {
      user = player2;
      opponent = player1;
    } else {
      return NextResponse.json(
        { message: "بازیکن ها در این اتاق نیستند" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        roomId,
        user,
        opponent,
        host: player1,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in get-room route:", error);
    return NextResponse.json(
      { 
        error: error.message || "خطا در دریافت اطلاعات اتاق",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
}

