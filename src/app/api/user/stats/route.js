import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import RockPaperScissors from "@/models/RockPaperScissors";
import TicTacToe from "@/models/TicTacToe";
import jwt from "jsonwebtoken";

export async function GET(req) {
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

    // Check user token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Get user
    const user = await User.findById(userId).select("-password -__v");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get RPS games
    const rpsGames = await RockPaperScissors.find({
      $or: [{ player1: userId }, { player2: userId }],
    });

    // Get TicTacToe games
    const tttGames = await TicTacToe.find({
      $or: [{ player1: userId }, { player2: userId }],
    });

    // Calculate RPS stats
    let rpsWins = 0;
    let rpsLosses = 0;
    let rpsDraws = 0;
    let rpsTotal = rpsGames.length;

    rpsGames.forEach((game) => {
      if (!game.winner || game.winner === "draw") {
        rpsDraws++;
      } else if (game.winner === userId) {
        rpsWins++;
      } else {
        rpsLosses++;
      }
    });

    // Calculate TicTacToe stats
    let tttWins = 0;
    let tttLosses = 0;
    let tttDraws = 0;
    let tttTotal = tttGames.length;

    tttGames.forEach((game) => {
      if (!game.winner || game.winner === "draw") {
        tttDraws++;
      } else if (game.winner === userId) {
        tttWins++;
      } else {
        tttLosses++;
      }
    });

    // Calculate overall stats
    const totalGames = rpsTotal + tttTotal;
    const totalWins = (user.wins || 0);
    const totalLosses = (user.losses || 0);
    const totalDraws = (user.draws || 0);
    const winRate = totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : 0;

    return NextResponse.json({
      success: true,
      stats: {
        overall: {
          totalGames,
          wins: totalWins,
          losses: totalLosses,
          draws: totalDraws,
          winRate: parseFloat(winRate),
        },
        rps: {
          total: rpsTotal,
          wins: rpsWins,
          losses: rpsLosses,
          draws: rpsDraws,
          winRate: rpsTotal > 0 ? ((rpsWins / rpsTotal) * 100).toFixed(1) : 0,
        },
        tictactoe: {
          total: tttTotal,
          wins: tttWins,
          losses: tttLosses,
          draws: tttDraws,
          winRate: tttTotal > 0 ? ((tttWins / tttTotal) * 100).toFixed(1) : 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "خطا در دریافت آمار" },
      { status: 500 }
    );
  }
}

