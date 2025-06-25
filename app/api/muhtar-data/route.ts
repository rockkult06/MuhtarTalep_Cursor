import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET /api/muhtar-data
export async function GET() {
  try {
    const { data, error } = await supabase.from("muhtar_info").select("*")

    if (error) {
      console.error("Error fetching muhtar data:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error in GET /api/muhtar-data:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST /api/muhtar-data (Bulk upload/replace)
export async function POST(req: Request) {
  try {
    const muhtarData = await req.json()

    // Clear existing muhtar data
    const { error: deleteError } = await supabase.from("muhtar_info").delete().neq("ilce_adi", "NON_EXISTENT_VALUE") // Delete all rows

    if (deleteError) {
      console.error("Error clearing existing muhtar data:", deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // Insert new muhtar data
    const { data, error } = await supabase.from("muhtar_info").insert(muhtarData).select()

    if (error) {
      console.error("Error inserting new muhtar data:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Unexpected error in POST /api/muhtar-data:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
