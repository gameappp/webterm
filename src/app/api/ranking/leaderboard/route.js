import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit")) || 100;
    const gameType = searchParams.get("gameType") || "all"; // all, rps, tictactoe

    // Get top users by totalScore
    const users = await User.find({ deletedAt: null })
      .select("nickName userName totalScore wins losses draws rank")
      .sort({ totalScore: -1 })
      .limit(limit)
      .lean();

    // Add position/rank number
    const leaderboard = users.map((user, index) => ({
      ...user,
      position: index + 1,
    }));

    return NextResponse.json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "خطا در دریافت لیدربورد" },
      { status: 500 }
    );
  }
}

