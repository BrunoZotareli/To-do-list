import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

/**
 * Entrega o script de Service Worker com o MIME correto.
 * Isso evita que a rota caia no sistema de páginas do Next
 * e devolva HTML (causando “unsupported MIME type”).
 */
export async function GET() {
  // Caminho absoluto até /public/sw.js
  const swPath = path.join(process.cwd(), "public", "sw.js")
  const swCode = await fs.readFile(swPath, "utf8")

  return new NextResponse(swCode, {
    status: 200,
    headers: {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  })
}
