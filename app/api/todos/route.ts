import { db } from "@/app/utils/dbConfig";
import { Todos, Users } from "@/app/utils/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, like, desc, sql, count } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const ITEMS_PER_PAGE = 10;

export async function GET(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const page = Number(req.nextUrl.searchParams.get("page")) || 1;
  const searchTerm = req.nextUrl.searchParams.get("searchTerm") || "";

  try {
    // Count total todos
    const totalTodosResult = await db
      .select({ count: sql`COUNT(*)` })
      .from(Todos)
      .where(
        and(
          eq(Todos.userId, userId),
          searchTerm ? like(Todos.title, `%${searchTerm}%`) : undefined
        )
      )
      .execute();

    const totalTodos = parseInt(
      (totalTodosResult[0] as { count: string }).count,
      10
    );
    const totalPages = Math.ceil(totalTodos / ITEMS_PER_PAGE);

    // Fetch paginated todos
    const todos = await db
      .select()
      .from(Todos)
      .where(
        and(
          eq(Todos.userId, userId),
          searchTerm ? like(Todos.title, `%${searchTerm}%`) : undefined
        )
      )
      .orderBy(desc(Todos.updatedAt))
      .limit(ITEMS_PER_PAGE)
      .offset((page - 1) * ITEMS_PER_PAGE)
      .execute();

    return new NextResponse(JSON.stringify({ todos, totalTodos, totalPages }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Join users and todos tables to get user info and todo count
    const userResult = await db
      .select({
        id: Users.id,
        isSubscribed: Users.isSubscribed,
        todoCount: count(Todos.id),
      })
      .from(Users)
      .leftJoin(Todos, eq(Users.id, Todos.userId))
      .where(eq(Users.id, userId))
      .groupBy(Users.id, Users.isSubscribed) // Ensure to include all non-aggregated fields in group by
      .execute();

    if (userResult.length === 0) {
      return new NextResponse("User not found", { status: 404 });
    }

    const user = userResult[0];

    // Check subscription status and todo count
    if (!user.isSubscribed && user.todoCount >= 3) {
      return new NextResponse(
        JSON.stringify({
          message:
            "You have exceeded the limit of 3 todos. Please subscribe to add more todos.",
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Add the new todo
    const todoData = await req.json();
    await db
      .insert(Todos)
      .values({
        userId,
        title: todoData.title,
        completed: false,
      })
      .execute();

    return new NextResponse("Todo added successfully", { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
