import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { EmailAddressJSON } from "@clerk/backend";
import { db } from "@/app/utils/dbConfig";
import { Users } from "@/app/utils/schema";

export async function POST(request: NextRequest) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET!;
  if (!WEBHOOK_SECRET)
    return new NextResponse("Missing WEBHOOK_SECRET", { status: 500 });

  const body = await request.json();
  const payload = JSON.stringify(body);
  const svixId = headers().get("svix-id");
  const svixSignature = headers().get("svix-signature");
  const svixTimestamp = headers().get("svix-timestamp");

  if (!svixId || !svixSignature || !svixTimestamp)
    return new NextResponse("Missing svix headers", { status: 400 });

  try {
    const webhook = new Webhook(WEBHOOK_SECRET);
    const webhookPayload: WebhookEvent = (await webhook.verify(payload, {
      "svix-id": svixId,
      "svix-signature": svixSignature,
      "svix-timestamp": svixTimestamp,
    })) as WebhookEvent;

    console.log(webhookPayload);

    const { type, data } = webhookPayload;

    if (type === "user.created") {
      const { id, email_addresses, primary_email_address_id } = data;

      if (!email_addresses || !primary_email_address_id)
        return new NextResponse(
          "Missing email_addresses or primary_email_address_id",
          { status: 400 }
        );

      const primaryEmailAddress: EmailAddressJSON = email_addresses.find(
        (email: EmailAddressJSON) => email.id === primary_email_address_id
      ) as EmailAddressJSON;

      if (!primaryEmailAddress)
        return new NextResponse("Missing email", { status: 400 });

      try {
        const newUser = await db
          .insert(Users)
          .values({
            id,
            username: primaryEmailAddress.email_address,
            isSubscribed: false,
            subscriptionEnds: null,
          })
          .returning({ id: Users.id, username: Users.username })
          .execute();

        console.log(newUser);
      } catch (error) {
        console.error(error);
        return new NextResponse("Failed to insert user", { status: 500 });
      }
    }
  } catch (error) {
    console.error(error);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  return NextResponse.json({ received: true });
}
