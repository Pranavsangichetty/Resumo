import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_API_URL ||
  "https://nani111-resumo-api.hf.space";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const targetUrl = `${BACKEND_URL.replace(/\/+$/, "")}/api/v1/auth/google`;

    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg =
        data?.detail ||
        data?.message ||
        `Backend authentication returned status ${res.status}`;
      return NextResponse.json({ detail: errorMsg }, { status: res.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("[api/auth/google] Error forwarding Google login:", error);
    return NextResponse.json(
      {
        detail:
          error?.message ||
          "Unable to connect to Resumo authentication server.",
      },
      { status: 502 }
    );
  }
}
