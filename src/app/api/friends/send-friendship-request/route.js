import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import FriendRequest from "@/models/FriendRequest";

export async function POST(request) {
  try {
    await connectDB();

    const { senderId, receiverId } = await request.json();

    if (!senderId || !receiverId) {
      return NextResponse.json(
        { message: "اطلاعات ناقص است." },
        { status: 400 }
      );
    }

    // check if friendship request exist
    const existingRequest = await FriendRequest.findOne({
      sender: senderId,
      receiver: receiverId,
    });
    if (existingRequest) {
      return NextResponse.json(
        { message: "درخواست قبلاً ارسال شده است." },
        { status: 400 }
      );
    }

    // save requet in db
    await FriendRequest.create({ sender: senderId, receiver: receiverId });

    return NextResponse.json(
      { message: "درخواست دوستی ارسال شد!" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "مشکلی رخ داده است." }, { status: 500 });
  }
}
