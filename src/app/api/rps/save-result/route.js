import { NextResponse } from "next/server";
import RockPaperScissors from "@/models/RockPaperScissors";
import User from "@/models/User";
import connectDB from "@/lib/db";
import { calculateRank } from "@/helper/helper";

export async function POST(req) {
  await connectDB(); // اضافه کردن await

  try {
    const { roomId, moves, winner } = await req.json();

    if (!roomId || !Array.isArray(moves) || !moves.length) {
      return NextResponse.json(
        { error: "roomId and moves are required" },
        { status: 400 }
      );
    }

    const updatedGame = await RockPaperScissors.findOneAndUpdate(
      { roomId },
      {
        moves,
        winner: winner || null,
      },
      { new: true }
    );

    if (!updatedGame) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Update ranking for free games (paid games are handled in payout route)
    if (updatedGame.isFreeGame && winner && winner !== "draw") {
      const loser = updatedGame.player1 === winner ? updatedGame.player2 : updatedGame.player1;
      
      const winnerUser = await User.findById(winner);
      const loserUser = await User.findById(loser);

      if (winnerUser) {
        winnerUser.wins = (winnerUser.wins || 0) + 1;
        winnerUser.totalScore = (winnerUser.totalScore || 0) + 20;
        winnerUser.rank = calculateRank(winnerUser.totalScore);
        await winnerUser.save();
      }

      if (loserUser) {
        loserUser.losses = (loserUser.losses || 0) + 1;
        loserUser.totalScore = Math.max(0, (loserUser.totalScore || 0) - 5);
        loserUser.rank = calculateRank(loserUser.totalScore);
        await loserUser.save();
      }
    } else if (updatedGame.isFreeGame && winner === "draw") {
      // Handle draw for free games
      const player1 = await User.findById(updatedGame.player1);
      const player2 = await User.findById(updatedGame.player2);

      if (player1) {
        player1.draws = (player1.draws || 0) + 1;
        player1.totalScore = (player1.totalScore || 0) + 5;
        player1.rank = calculateRank(player1.totalScore);
        await player1.save();
      }

      if (player2) {
        player2.draws = (player2.draws || 0) + 1;
        player2.totalScore = (player2.totalScore || 0) + 5;
        player2.rank = calculateRank(player2.totalScore);
        await player2.save();
      }
    }

    return NextResponse.json(
      {
        success: true,
        game: updatedGame,
        message: "Game result saved successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving game result:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
