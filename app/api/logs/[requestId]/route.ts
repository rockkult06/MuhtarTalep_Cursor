import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET /api/logs/[requestId]
export async function GET(req: Request, { params }: { params: { requestId: string } }) {
  try {
    const { requestId } = params

    const { data, error } = await supabase
      .from("logs")
      .select("*")
      .eq("request_id", requestId)
      .order("timestamp", { ascending: true })

    if (error) {
      console.error(`Error fetching logs for request ${requestId}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error in GET /api/logs/[requestId]:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
