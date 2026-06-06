import { NextResponse } from "next/server";

interface ContactPayload {
  name: string;
  company?: string;
  role?: string;
  email: string;
  message: string;
  productInterest?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  let body: ContactPayload;

  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim();
  const message = body.message?.trim();
  const company = body.company?.trim() ?? "";
  const role = body.role?.trim() ?? "";
  const productInterest = body.productInterest?.trim() ?? "";

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL_TO ?? "321tair@gmail.com";
  const from =
    process.env.CONTACT_EMAIL_FROM ?? "TAIR Website <onboarding@resend.dev>";

  if (!apiKey) {
    console.error("RESEND_API_KEY is not configured.");
    return NextResponse.json(
      {
        error:
          "Contact form is not configured yet. Please email us directly at 321tair@gmail.com.",
      },
      { status: 503 }
    );
  }

  const subject = `TAIR inquiry from ${name}${company ? ` (${company})` : ""}`;
  const text = [
    `Name: ${name}`,
    company ? `Company: ${company}` : null,
    role ? `Role: ${role}` : null,
    `Email: ${email}`,
    productInterest ? `Product interest: ${productInterest}` : null,
    "",
    "Message:",
    message,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Resend API error:", errorBody);
    return NextResponse.json(
      { error: "Failed to send message. Please try again or email 321tair@gmail.com." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
