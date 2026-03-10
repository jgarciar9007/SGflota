import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = 'force-dynamic';

// Helper to sanitize filename
function sanitizeFilename(filename: string): string {
    return filename
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9.-]/g, "-")    // Replace any non-alphanumeric char (except dots/dashes) with dash
        .replace(/-+/g, "-")             // Replace multiple dashes with one
        .replace(/^-+|-+$/g, "");        // Trim dashes from start/end
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const type = formData.get("type") as string || "general"; // 'logo', 'vehicle', 'document', etc.

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize original name and prepare unique filename
        const ext = path.extname(file.name);
        const nameWithoutExt = path.basename(file.name, ext);
        const sanitizedBase = sanitizeFilename(nameWithoutExt);

        // Use a timestamp and short random string for uniqueness
        const uniqueSuffix = Date.now() + "-" + Math.random().toString(36).substring(2, 7);
        const filename = `${sanitizedBase}-${uniqueSuffix}${ext.toLowerCase()}`;

        // Determine upload path - support subfolders
        const subfolder = type === 'logo' ? 'logos' : (type === 'vehicle' ? 'vehicles' : 'general');
        const uploadDir = path.join(process.cwd(), "public/uploads", subfolder);

        // Ensure directory exists
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (err) {
            // Ignore error if it already exists
        }

        const filePath = path.join(uploadDir, filename);

        // Write file
        await writeFile(filePath, buffer);

        // Return public URL - include subfolder
        const publicUrl = `/uploads/${subfolder}/${filename}`;

        return NextResponse.json({
            url: publicUrl,
            filename: filename,
            originalName: file.name,
            path: publicUrl
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Error uploading file" },
            { status: 500 }
        );
    }
}
