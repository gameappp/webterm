import connectDB from "@/lib/db";
import RockPaperScissors from "@/models/RockPaperScissors";
import TicTacToe from "@/models/TicTacToe";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connectDB();

  try {
    // استخراج توکن از کوکی یا هدر
    const token =
      req.cookies.get("token")?.value ||
      req.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "توکن یافت نشد." }, { status: 401 });
    }

    // استخراج userId از توکن
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (err) {
      return NextResponse.json({ error: "توکن نامعتبر است." }, { status: 401 });
    }

    // Get pagination params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // دریافت بازی‌های RPS
    const rpsGames = await RockPaperScissors.find({
      $or: [{ player1: userId }, { player2: userId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    // دریافت بازی‌های TicTacToe
    const tttGames = await TicTacToe.find({
      $or: [{ player1: userId }, { player2: userId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    // Combine and sort all games
    const allGames = [
      ...rpsGames.map((game) => ({ ...game, gameType: "rps" })),
      ...tttGames.map((game) => ({ ...game, gameType: "tictactoe" })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Calculate stats
    let totalWins = 0;
    let totalLosses = 0;
    let totalDraws = 0;

    allGames.forEach((game) => {
      if (!game.winner || game.winner === "draw") {
        totalDraws++;
      } else if (game.winner === userId) {
        totalWins++;
      } else {
        totalLosses++;
      }
    });

    // Paginate
    const paginatedGames = allGames.slice(skip, skip + limit);
    const hasMore = allGames.length > skip + limit;

    // ساخت آرایه تاریخچه
    const history = await Promise.all(
      paginatedGames.map(async (game) => {
        const isPlayer1 = game.player1 === userId;
        const opponentId = isPlayer1 ? game.player2 : game.player1;

        const opponent = await User.findById(opponentId).select(
          "userName nickName _id"
        );

        return {
          gameId: game._id,
          gameName: game.gameType === "rps" ? "سنگ، کاغذ، قیچی" : "دوز",
          gameType: game.gameType,
          opponent,
          winner: game.winner,
          createdAt: game.createdAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      history,
      stats: {
        totalGames: allGames.length,
        wins: totalWins,
        losses: totalLosses,
        draws: totalDraws,
      },
      pagination: {
        page,
        limit,
        hasMore,
        total: allGames.length,
      },
    });
  } catch (error) {
    console.error("خطا در دریافت تاریخچه بازی:", error);
    return NextResponse.json({ error: "مشکلی رخ داده است." }, { status: 500 });
  }
}
