import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// npm run docs:index

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const docsDir = path.join(__dirname, "..", "docs");

    // Ensure docs directory exists
    let entries;
    try {
        entries = await fs.readdir(docsDir, { withFileTypes: true });
    } catch (err) {
        console.error(`❌ Could not read docs directory at: ${docsDir}`);
        console.error(err);
        process.exit(1);
    }

    // Filter .md files (excluding README.md)
    const files = entries
        .filter(
            (entry) =>
                entry.isFile() &&
                entry.name.toLowerCase().endsWith(".md") &&
                entry.name.toLowerCase() !== "readme.md"
        )
        .map((entry) => entry.name)
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

    // Build markdown index content
    const lines = [];
    lines.push("# Documentation Index");
    lines.push("");
    lines.push(
        `Generated automatically by generate-docs-index.mjs on ${new Date().toISOString()}`
    );
    lines.push("");
    if (files.length === 0) {
        lines.push("_No documentation files found in this folder yet._");
    } else {
        for (const filename of files) {
            const label = filename.replace(/\.md$/i, "");
            lines.push(`- [${label}](./${filename})`);
        }
    }
    lines.push("");

    const output = lines.join("\n");
    const readmePath = path.join(".", "README.md");

    try {
        await fs.writeFile(readmePath, output, "utf8");
        console.log(`✅ docs/README.md generated successfully.`);
    } catch (err) {
        console.error(`❌ Failed to write ${readmePath}`);
        console.error(err);
        process.exit(1);
    }
}

main();