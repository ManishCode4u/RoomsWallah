import { NextResponse } from "next/server";
import { getApiUrl } from "@/data/api";

export async function GET() {
  const targetId = "6a9254e7903234c06fb8f0dc";
  const url = getApiUrl(`/api/listings/${targetId}`);
  
  const debugInfo: any = {
    targetId,
    resolvedUrl: url,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    },
    fetchResult: null,
  };

  try {
    const startTime = Date.now();
    const res = await fetch(url, { cache: "no-store" });
    const durationMs = Date.now() - startTime;

    debugInfo.fetchResult = {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      durationMs,
      headers: Array.from(res.headers.entries()),
    };

    if (res.ok) {
      const data = await res.json();
      debugInfo.fetchResult.dataSample = data;
    } else {
      const text = await res.text();
      debugInfo.fetchResult.errorBody = text.substring(0, 500);
    }
  } catch (err: any) {
    debugInfo.fetchResult = {
      errorName: err.name,
      errorMessage: err.message,
      errorStack: err.stack,
    };
  }

  return NextResponse.json(debugInfo);
}
