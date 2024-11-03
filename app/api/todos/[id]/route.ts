import { db } from "@/app/utils/dbConfig";
import { Todos } from "@/app/utils/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  //get the id from the request url

  const id = params.id;

  if (!id) {
    return new NextResponse("Missing id", { status: 400 });
  }

  try {
    await db
      .delete(Todos)
      .where(eq(Todos.id, parseInt(id)))
      .execute();
    return new NextResponse("Todo deleted", { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Failed to delete todo", { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  //get the id from the request
  const id = params.id;
  if (!id) {
    return new NextResponse("Missing id", { status: 400 });
  }

  try {
    const body = await req.json();
    const { title, completed } = body;
    await db
      .update(Todos)
      .set({ title, completed })
      .where(eq(Todos.id, parseInt(id)))
      .execute();
    return new NextResponse("Todo updated", { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Failed to update todo", { status: 500 });
  }
}
