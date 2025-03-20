export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "شناسه کاربر ارسال نشده است." },
        { status: 400 }
      );
    }

    // دریافت درخواست‌های دوستی‌ای که هنوز قبول یا رد نشده‌اند
    const requests = await FriendRequest.find({
      receiver: userId,
      status: "pending",
    }).populate("sender", "name nickName");

    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: "مشکلی رخ داده است." }, { status: 500 });
  }
}
