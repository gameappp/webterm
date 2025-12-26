import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import RockPaperScissors from "@/models/RockPaperScissors";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

export async function POST(req) {
  try {
    await connectDB();
    const { roomId, player1, player2, betAmount = 0, isFreeGame = false } = await req.json();

    // If it's a paid game, deduct bet amount from both players
    if (!isFreeGame && betAmount > 0) {
      const player1User = await User.findById(player1);
      const player2User = await User.findById(player2);

      if (!player1User || !player2User) {
        return NextResponse.json(
          { error: "یکی از بازیکنان یافت نشد" },
          { status: 404 }
        );
      }

      // Validate balances
      if ((player1User.balance || 0) < betAmount) {
        return NextResponse.json(
          { error: "موجودی بازیکن اول کافی نیست" },
          { status: 400 }
        );
      }

      if ((player2User.balance || 0) < betAmount) {
        return NextResponse.json(
          { error: "موجودی بازیکن دوم کافی نیست" },
          { status: 400 }
        );
      }

      // Deduct bet amounts
      player1User.balance = (player1User.balance || 0) - betAmount;
      player2User.balance = (player2User.balance || 0) - betAmount;

      await player1User.save();
      await player2User.save();

      // Create transaction records
      await Transaction.create({
        userId: player1User._id,
        type: "game_bet",
        amount: -betAmount,
        description: `شرط بازی سنگ کاغذ قیچی: ${betAmount} تومان`,
        relatedUserId: player2User._id,
        balanceAfter: player1User.balance,
      });

      await Transaction.create({
        userId: player2User._id,
        type: "game_bet",
        amount: -betAmount,
        description: `شرط بازی سنگ کاغذ قیچی: ${betAmount} تومان`,
        relatedUserId: player1User._id,
        balanceAfter: player2User.balance,
      });
    }

    const newRoom = await RockPaperScissors.create({
      roomId,
      player1,
      player2,
      betAmount: isFreeGame ? 0 : betAmount,
      isFreeGame,
    });

    await newRoom.save();

    return NextResponse.json(
      { message: "اتاق بازی با موفقیت ساخته شد", roomId },
      { status: 200 }
    );
  } catch (error) {
    console.error("خطا هنگام ساخت اتاق:", error);
    return NextResponse.json({ error: "مشکلی رخ داده است." }, { status: 500 });
  }
}
