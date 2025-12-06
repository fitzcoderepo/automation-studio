import { prisma } from "@/lib/prisma";
import type { UploadedFile } from "@prisma/client";


export default async function FilesPage() {
    
    const files: UploadedFile[] = await prisma.uploadedFile.findMany({
        orderBy: { uploadedAt: "desc" },
    });

    return (
      <>
        <h1 className="text-2xl font-bold mb-6">Uploaded Files</h1>

        {files.length === 0 ? (
          <p className="text-slate-400 text-sm">
            No files uploaded yet. Go to the AI Chatbot page and upload a PDF or
            text file.
          </p>
        ) : (
          <div className="rounded-lg border border-slate-800 bg-slate-900/60">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-800 bg-slate-900">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Filename</th>
                  <th className="px-4 py-2 text-left font-medium">
                    OpenAI File ID
                  </th>
                  <th className="px-4 py-2 text-left font-medium">Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {files.map((f) => (
                  <tr key={f.id} className="border-t border-slate-800">
                    <td className="px-4 py-2">{f.filename}</td>
                    <td className="px-4 py-2 text-xs text-slate-400">
                      {f.fileId}
                    </td>
                    <td className="px-4 py-2">
                      {f.uploadedAt.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
  );
}
