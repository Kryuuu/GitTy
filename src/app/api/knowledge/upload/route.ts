// ============================================
// GitTy — Knowledge Upload API Route
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const orgId = formData.get("orgId") as string | null;

    if (!file || !orgId) {
      return NextResponse.json(
        { error: "File and orgId are required" },
        { status: 400 }
      );
    }

    // Verify membership
    const { data: membership } = await supabase
      .from("org_members")
      .select("id")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Create a unique file path
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${orgId}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("knowledge_files")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file to storage" },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("knowledge_files").getPublicUrl(filePath);

    // Try to extract text for plain text files
    let extractedText = "";
    if (
      file.type.includes("text") ||
      file.type.includes("json") ||
      file.type.includes("csv") ||
      file.name.endsWith(".md") ||
      file.name.endsWith(".txt")
    ) {
      extractedText = await file.text();
    } else {
      extractedText = `[File attached: ${file.name} - URL: ${publicUrl}]. Note: Binary parsing is handled externally.`;
    }

    // Insert into knowledge table
    const { data: knowledgeRecord, error: dbError } = await supabase
      .from("knowledge")
      .insert({
        org_id: orgId,
        title: file.name,
        file_url: publicUrl,
        file_type: file.type || fileExt,
        file_size: file.size,
        status: "ready", // For MVP, we set it to ready immediately
        created_by: user.id,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      return NextResponse.json(
        { error: "Failed to save file metadata" },
        { status: 500 }
      );
    }

    // Connect to AI Memory Context
    // Fallback logic: If pgvector exists (which it does in our schema), we would generate embeddings.
    // Since we don't have an embedding API configured here yet, we save it as plain context memory.
    // The router will gracefully fallback to metadata/text search for context.
    const memoryContent = `Knowledge Base File: ${file.name}\n\nContent Excerpt:\n${extractedText.substring(0, 1000)}`;
    
    await supabase.from("ai_memory").insert({
      org_id: orgId,
      memory_type: "knowledge",
      content: memoryContent,
    });

    return NextResponse.json({ data: knowledgeRecord });
  } catch (error) {
    console.error("Knowledge upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
