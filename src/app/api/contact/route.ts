import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, message } = body ?? {};

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !message.trim()
  ) {
    return NextResponse.json(
      { error: "Bitte alle Felder ausfüllen." },
      { status: 400 }
    );
  }

  const db = getAdminFirestore();
  await db.collection("contactSubmissions").add({
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
