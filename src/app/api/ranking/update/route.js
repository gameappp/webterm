import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { calculateRank } from "@/helper/helper";

export async function POST(req) {
  try {
    await connectDB();
    const { userId, result } = await req.json(); // result: 'win', 'loss', 'draw'

    if (!userId || !result) {
      return NextResponse.json(
        { error: "userId and result are required" },
        { status: 400 }
      );
    }

    if (!["win", "loss", "draw"].includes(result)) {
      return NextResponse.json(
        { error: "result must be 'win', 'loss', or 'draw'" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update stats
    if (result === "win") {
      user.wins = (user.wins || 0) + 1;
      user.totalScore = (user.totalScore || 0) + 20; // +20 points for win
    } else if (result === "loss") {
      user.losses = (user.losses || 0) + 1;
      user.totalScore = Math.max(0, (user.totalScore || 0) - 5); // -5 points for loss (minimum 0)
    } else if (result === "draw") {
      user.draws = (user.draws || 0) + 1;
      user.totalScore = (user.totalScore || 0) + 5; // +5 points for draw
    }

    // Calculate new rank
    user.rank = calculateRank(user.totalScore);

    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        totalScore: user.totalScore,
        wins: user.wins,
        losses: user.losses,
        draws: user.draws,
        rank: user.rank,
      },
    });
  } catch (error) {
    console.error("Error updating ranking:", error);
    return NextResponse.json(
      { error: "خطا در آپدیت رنکینگ" },
      { status: 500 }
    );
  }
}

