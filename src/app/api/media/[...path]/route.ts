import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import mime from "mime-types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Await the params
    const { path: pathSegments } = await params;

    // Join the path segments
    const filePath = pathSegments.join("/");

    // Resolve the absolute path to the media directory
    const mediaDir = path.join(process.cwd(), "public");
    const absolutePath = path.join(mediaDir, filePath);

    // Security: Ensure the resolved path is within the media directory
    if (!absolutePath.startsWith(mediaDir)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      return new NextResponse("File not found", { status: 404 });
    }

    // Get file stats
    const stat = fs.statSync(absolutePath);

    // Ensure it's a file, not a directory
    if (!stat.isFile()) {
      return new NextResponse("Not a file", { status: 400 });
    }

    // Read the file
    const file = fs.readFileSync(absolutePath);

    // Determine content type
    const contentType = mime.lookup(absolutePath) || "application/octet-stream";

    // Return the file with appropriate headers
    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": stat.size.toString(),
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
