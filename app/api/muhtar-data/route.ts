import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { addMuhtarData, getMuhtarData, updateDistrictNames } from "@/lib/data"
import type { MuhtarInfo } from "@/lib/data"

// GET /api/muhtar-data
export async function GET() {
  try {
    const data = await getMuhtarData()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in GET /api/muhtar-data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/muhtar-data (Bulk upload/replace)
export async function POST(request: Request) {
  try {
    const data = await request.json()
    await addMuhtarData(data as MuhtarInfo[])
    return NextResponse.json({ message: "Muhtar data added successfully" })
  } catch (error) {
    console.error("Error in POST /api/muhtar-data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH() {
  try {
    await updateDistrictNames()
    return NextResponse.json({ message: "İlçe adları başarıyla güncellendi" })
  } catch (error) {
    console.error("Error in PATCH /api/muhtar-data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
