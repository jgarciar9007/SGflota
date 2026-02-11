import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        // const type = formData.get("type") as string; // 'logo' | 'vehicle' | 'document'

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const originalName = file.name.replace(/\s/g, "-");
        const filename = `${uniqueSuffix}-${originalName}`;

        // Determine upload path
        // Default to 'uploads'
        const uploadDir = path.join(process.cwd(), "public/uploads");

        // Ensure directory exists
        const { mkdir } = require("fs/promises");
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (err) {
            // Ignore error if it already exists (redundant with recursive: true but safe)
        }

        const filePath = path.join(uploadDir, filename);

        // Write file
        await writeFile(filePath, buffer);

        // Return public URL
        const publicUrl = `/uploads/${filename}`;

        return NextResponse.json({ url: publicUrl, filename: filename });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Error uploading file" },
            { status: 500 }
        );
    }
}
