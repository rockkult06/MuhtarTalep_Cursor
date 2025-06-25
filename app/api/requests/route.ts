import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET /api/requests
export async function GET() {
  try {
    const { data, error } = await supabase.from("requests").select("*")

    if (error) {
      console.error("Error fetching requests:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error in GET /api/requests:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST /api/requests
export async function POST(req: Request) {
  try {
    const newRequestData = await req.json()

    // Generate talep_no
    const { data: lastRequest, error: lastRequestError } = await supabase
      .from("requests")
      .select("talep_no")
      .order("talep_no", { ascending: false })
      .limit(1)

    if (lastRequestError) {
      console.error("Error fetching last talep_no:", lastRequestError)
      return NextResponse.json({ error: lastRequestError.message }, { status: 500 })
    }

    const lastTalepNo = lastRequest?.[0]?.talep_no
    const nextId = lastTalepNo ? Number.parseInt(lastTalepNo.split("-")[1]) + 1 : 1
    const talepNo = `MTYS-${String(nextId).padStart(4, "0")}`

    const currentDate = new Date().toISOString().split("T")[0]

    const requestToInsert = {
      ...newRequestData,
      talep_no: talepNo,
      guncelleme_tarihi: currentDate,
      // Ensure muhtar_adi and muhtar_telefonu are populated from muhtar_info if not provided
      // This logic can be enhanced to fetch from muhtar_info table on server if needed
      muhtar_adi: newRequestData.muhtarAdi || "",
      muhtar_telefonu: newRequestData.muhtarTelefonu || "",
    }

    const { data, error } = await supabase.from("requests").insert([requestToInsert]).select()

    if (error) {
      console.error("Error adding request:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const addedRequest = data[0]

    // Log the creation
    await supabase.from("logs").insert([
      {
        request_id: addedRequest.id,
        action: "create",
        changes: Object.entries(addedRequest).map(([field, value]) => ({ field, oldValue: null, newValue: value })),
        guncelleyen: newRequestData.guncelleyen,
      },
    ])

    return NextResponse.json(addedRequest, { status: 201 })
  } catch (error) {
    console.error("Unexpected error in POST /api/requests:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// PUT /api/requests/[id]
export async function PUT(req: Request) {
  try {
    const { id, ...updatedFields } = await req.json()
    const currentDate = new Date().toISOString().split("T")[0]

    const { data: oldRequestData, error: oldRequestError } = await supabase
      .from("requests")
      .select("*")
      .eq("id", id)
      .single()

    if (oldRequestError) {
      console.error("Error fetching old request for update:", oldRequestError)
      return NextResponse.json({ error: oldRequestError.message }, { status: 500 })
    }

    const changes = Object.entries(updatedFields).reduce((acc: any[], [field, newValue]) => {
      // Convert field names from camelCase to snake_case for DB
      const dbField = field.replace(/([A-Z])/g, "_$1").toLowerCase()
      if (oldRequestData[dbField] !== newValue) {
        acc.push({
          field: field, // Keep original field name for frontend display
          oldValue: oldRequestData[dbField],
          newValue: newValue,
        })
      }
      return acc
    }, [])

    const { data, error } = await supabase
      .from("requests")
      .update({ ...updatedFields, guncelleme_tarihi: currentDate })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error updating request:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const updatedRequest = data[0]

    // Log the update
    if (changes.length > 0) {
      await supabase.from("logs").insert([
        {
          request_id: updatedRequest.id,
          action: "update",
          changes: changes,
          guncelleyen: updatedFields.guncelleyen,
        },
      ])
    }

    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error("Unexpected error in PUT /api/requests:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// NEW: DELETE /api/requests
export async function DELETE(req: Request) {
  try {
    const { ids } = await req.json() // Expects an array of IDs

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Geçersiz ID listesi sağlandı." }, { status: 400 })
    }

    // Fetch requests before deletion for logging purposes
    const { data: requestsToDelete, error: fetchError } = await supabase
      .from("requests")
      .select("id, talep_no")
      .in("id", ids)

    if (fetchError) {
      console.error("Error fetching requests for deletion logging:", fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const { error } = await supabase.from("requests").delete().in("id", ids)

    if (error) {
      console.error("Error deleting requests:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log each deletion
    for (const req of requestsToDelete || []) {
      await supabase.from("logs").insert([
        {
          request_id: req.id,
          action: "delete",
          changes: [{ field: "talepNo", oldValue: req.talep_no, newValue: null }],
          guncelleyen: "Sistem (Toplu Silme)", // Or pass guncelleyen from frontend if available
        },
      ])
    }

    return NextResponse.json({ message: `${ids.length} talep başarıyla silindi.` }, { status: 200 })
  } catch (error) {
    console.error("Unexpected error in DELETE /api/requests:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
