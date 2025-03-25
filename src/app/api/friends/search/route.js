import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";
import FriendRequest from "@/models/FriendRequest";

export async function POST(req) {
  try {
    await connectDB();

    // get user token
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "توکن یافت نشد." }, { status: 401 });
    }

    // get user id by token
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (err) {
      return NextResponse.json({ error: "توکن نامعتبر است." }, { status: 401 });
    }

    // get search value from front end
    const { search } = await req.json();

    // search user
    const users = await User.find(
      {
        deletedAt: null,
        $or: [
          { nickName: { $regex: search, $options: "i" } },
          { userName: { $regex: search, $options: "i" } },
        ],
      },
      "-__v -password"
    );

    // check friendship request status
    const usersWithFriendshipStatus = await Promise.all(
      users.map(async (user) => {
        // donsnt show current user(my self)
        if (user._id.toString() === userId) return null;

        const friendRequest = await FriendRequest.findOne({
          $or: [
            { sender: userId, receiver: user._id },
            { sender: user._id, receiver: userId },
          ],
        });

        return {
          ...user.toObject(),
          friendshipStatus: friendRequest?.status || "none",
        };
      })
    );

    return NextResponse.json(
      {
        message: "جستجو انجام شد",
        users: usersWithFriendshipStatus.filter(Boolean), // remove null data
        result: usersWithFriendshipStatus.filter(Boolean).length
          ? "result"
          : "empty",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("خطا در جستجو:", error);
    return NextResponse.json({ error: "مشکلی رخ داده است." }, { status: 500 });
  }
}
