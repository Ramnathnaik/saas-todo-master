import { db } from "@/app/utils/dbConfig";
import { Users } from "@/app/utils/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const user = await db
      .select()
      .from(Users)
      .where(eq(Users.id, userId))
      .execute();

    if (user.length === 0) {
      return new NextResponse("User not found", { status: 404 });
    }

    let subscriptionEnds = user[0].subscriptionEnds as Date | null;
    const now = new Date();

    if (subscriptionEnds && subscriptionEnds > now) {
      return new NextResponse("Already subscribed", { status: 400 });
    }

    if (subscriptionEnds && subscriptionEnds < now) {
      subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1);
    } else {
      subscriptionEnds = new Date();
      subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1);
    }

    const updatedUser = await db
      .update(Users)
      .set({
        isSubscribed: true,
        subscriptionEnds: subscriptionEnds.toISOString(),
      })
      .where(eq(Users.id, userId))
      .returning({
        id: Users.id,
        isSubscribed: Users.isSubscribed,
        subscriptionEnds: Users.subscriptionEnds,
      })
      .execute();

    return new NextResponse(JSON.stringify(updatedUser), { status: 200 });
  } catch (error) {
    console.log(error);
    return new NextResponse("Error", { status: 500 });
  }
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const user = await db
      .select()
      .from(Users)
      .where(eq(Users.id, userId))
      .execute();

    if (user.length === 0) {
      return new NextResponse("User not found", { status: 404 });
    }

    const subscriptionEnds = user[0].subscriptionEnds as Date | null;
    const isSubscribed = user[0].isSubscribed as boolean | null;
    const now = new Date();

    if (subscriptionEnds && subscriptionEnds > now) {
      return NextResponse.json({
        isSubscribed,
        subscriptionEnds,
      });
    }

    if (subscriptionEnds && subscriptionEnds < now) {
      const updatedUser = await db
        .update(Users)
        .set({
          isSubscribed: false,
          subscriptionEnds: null,
        })
        .where(eq(Users.id, userId))
        .execute();

      console.log(updatedUser);
      return NextResponse.json({
        isSubscribed: false,
        subscriptionEnds: null,
      });
    }

    return NextResponse.json({
      isSubscribed: false,
      subscriptionEnds: null,
    });
  } catch (error) {
    console.log(error);
    return new NextResponse("Error", { status: 500 });
  }
}
