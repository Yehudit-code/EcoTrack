// src/lib/api-helpers.ts
import { NextResponse } from "next/server";

export function ok<T>(data: T, init: number = 200) {
  return NextResponse.json({ success: true, data }, { status: init });
}
export function fail(message: string, code = 400, extra?: unknown) {
  return NextResponse.json({ success: false, message, extra }, { status: code });
}
