import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function GET(
    request: NextRequest,
    { params }: { params: { filename: string } }
) {
    const filename = params.filename;

    if (!filename) {
        return new NextResponse("Filename not provided", { status: 400 });
    }

    try {
        // Security: Prevent path traversal
        const safeFilename = path.basename(filename);
        const filePath = path.join(process.cwd(), "public", "uploads", safeFilename);

        if (!existsSync(filePath)) {
            return new NextResponse("File not found", { status: 404 });
        }

        const fileBuffer = await readFile(filePath);

        // Determine content type
        const ext = path.extname(safeFilename).toLowerCase();
        let contentType = "application/octet-stream";

        switch (ext) {
            case ".jpg":
            case ".jpeg":
                contentType = "image/jpeg";
                break;
            case ".png":
                contentType = "image/png";
                break;
            case ".gif":
                contentType = "image/gif";
                break;
            case ".webp":
                contentType = "image/webp";
                break;
            case ".svg":
                contentType = "image/svg+xml";
                break;
            case ".pdf":
                contentType = "application/pdf";
                break;
        }

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Error serving file:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
