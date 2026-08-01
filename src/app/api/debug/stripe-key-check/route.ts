import { NextResponse } from "next/server";

// Temporary, one-time diagnostic — never returns the actual key value, only
// sanitized shape info, so it's safe to hit even though it's not otherwise
// protected. Delete this route once the STRIPE_SECRET_KEY corruption is fixed.
const TOKEN = "b70ccb0b21679db8093aefbd307b8ab1";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("token") !== TOKEN) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const key = process.env.STRIPE_SECRET_KEY ?? "";

  return NextResponse.json({
    length: key.length,
    containsNewline: key.includes("\n"),
    containsQuote: key.includes('"'),
    containsEquals: key.includes("="),
    startsWithSkTest: key.startsWith("sk_test_"),
    first10: key.slice(0, 10),
    last6: key.slice(-6),
    lineCount: key.split("\n").length,
  });
}
