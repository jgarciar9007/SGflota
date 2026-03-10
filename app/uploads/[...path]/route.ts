import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    const pathParts = params.path;

    if (!pathParts || pathParts.length === 0) {
        return new NextResponse("File path not provided", { status: 400 });
    }

    try {
        // Security: Prevent path traversal and join parts safely
        const safePath = pathParts.map(part => path.basename(part));
        const filePath = path.join(process.cwd(), "public", "uploads", ...safePath);

        if (!existsSync(filePath)) {
            // Log for debugging
            console.warn(`File not found: ${filePath}`);
            return new NextResponse("File not found", { status: 404 });
        }

        const fileBuffer = await readFile(filePath);

        // Determine content type
        const filename = safePath[safePath.length - 1];
        const ext = path.extname(filename).toLowerCase();
        let contentType = "application/octet-stream";

        const mimeTypes: Record<string, string> = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            ".webp": "image/webp",
            ".svg": "image/svg+xml",
            ".pdf": "application/pdf",
            ".mp4": "video/mp4",
            ".webm": "video/webm",
        };

        if (mimeTypes[ext]) {
            contentType = mimeTypes[ext];
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
