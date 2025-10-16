import { file, randomUUIDv7, serve } from "bun";
import index from "./index.html";
import fs from "fs";
import { exec, execSync, spawn } from "child_process";

function convertFileToPDF(fileName: string, fileContent: string) {
  const customCSS = `
    <style>
        .slide-chalkboard-buttons{
            display: none !important;
        }

        .reveal .slides section .fragment {
          filter: none !important;
          opacity: 1 !important;
          visibility: visible !important;
        }

        .reveal .slides section .fragment.visible {
          filter: none !important;
          opacity: 1 !important;
          visibility: visible !important;
        }

        section img {
          display: block; 
          max-width: 80% !important; 
          max-height: 60vh !important;
          object-fit: contain; 
        }
    </style>
  `;

  const tempFileName = `${randomUUIDv7()}.ipynb`;
  const notIncrementalFileContent = fileContent.replaceAll(
    /incremental:.*true/g,
    "incremental: false"
  );

  fs.writeFileSync(tempFileName, notIncrementalFileContent);

  execSync(`/root/.local/bin/quarto render ${tempFileName}`);

  const tempHTMLFileName = tempFileName.replace(".ipynb", ".html");
  const tempHTMLFileContent = fs.readFileSync(tempHTMLFileName, "utf-8");

  const tempPDFFileName = tempFileName.replace(".ipynb", ".pdf");
  let HTMLwithCSS = tempHTMLFileContent.replace(
    "</head>",
    customCSS + "</head>"
  );

  fs.writeFileSync(tempHTMLFileName, HTMLwithCSS);

  execSync(
    `decktape --page-load-timeout=60000 --chrome-path=/usr/bin/chromium --chrome-arg=--no-sandbox --chrome-arg=--disable-setuid-sandbox --chrome-arg=--disable-dev-shm-usage --headless=true ${tempHTMLFileName} ${tempPDFFileName}`,
    {
      stdio: "inherit",
    }
  );

  console.log("PDF created:", tempPDFFileName);

  // Clean up temporary files
  fs.unlinkSync(tempFileName);
  fs.unlinkSync(tempHTMLFileName);

  const base64PDF = fs.readFileSync(tempPDFFileName, "base64");
  fs.unlinkSync(tempPDFFileName);
  fs.rmdirSync(`${tempFileName.replace(".ipynb", "")}_files`, {
    recursive: true,
  });

  return base64PDF;
}

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/convert": {
      async POST(req) {
        const formData = await req.formData();
        console.log(formData);

        const fileName = formData.get("name");
        const fileContent = formData.get("content");

        if (!fileName || !fileContent) {
          return Response.json({
            message: "Missing name or content",
            method: "POST",
            status: 400,
          });
        }
        const base64PDF = convertFileToPDF(
          fileName.toString(),
          fileContent.toString()
        );
        if (!base64PDF) {
          return Response.json({
            message: "Error converting file to PDF",
            method: "POST",
            status: 500,
          });
        }

        return Response.json({
          message: "File converted to PDF successfully",
          body: base64PDF,
          method: "POST",
        });
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
