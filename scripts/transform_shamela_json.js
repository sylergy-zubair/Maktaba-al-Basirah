import { readFile, writeFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = dirname(__filename);

/**
 * Transform shamela_crawler JSON format to our expected format
 *
 * Shamela crawler typically outputs:
 * - Array of items with structure like {title, author, content, chapters, etc.}
 * - Or a single object with nested structure
 *
 * We need: {title, author?, description?, category?, language?, units: [{index, heading?, text}]}
 */
function transformShamelaData(rawData) {
    let bookData = null;

    // Handle array format (multiple books or items)
    if (Array.isArray(rawData)) {
        if (rawData.length === 0) {
            throw new Error("Empty JSON array");
        }
        // Take first book if array
        bookData = rawData[0];
    } else if (typeof rawData === "object" && rawData !== null) {
        bookData = rawData;
    } else {
        throw new Error("Invalid JSON format");
    }

    // Extract book metadata (handle info object structure from shamela_crawler)
    const info = bookData.info || bookData;
    const transformed = {
        title: info.title || bookData.title || bookData.name || "Untitled Book",
        author: info.author || bookData.author || bookData.writer || null,
        description: info.about || info.description || bookData.description || bookData.summary || null,
        category: info.category || bookData.category || bookData.type || null,
        language: info.language || bookData.language || "ar",
        units: [],
    };

    // Extract units from various possible structures
    let units = [];

    // Structure 1: Direct units array
    if (bookData.units && Array.isArray(bookData.units)) {
        units = bookData.units;
    }
    // Structure 2: Chapters with content
    else if (bookData.chapters && Array.isArray(bookData.chapters)) {
        units = bookData.chapters.flatMap((chapter, chapterIdx) => {
            if (chapter.content && Array.isArray(chapter.content)) {
                return chapter.content.map((item, itemIdx) => ({
                    index: itemIdx + 1,
                    heading: chapter.title || chapter.name || null,
                    text: item.text || item.content || item || "",
                }));
            } else if (chapter.text || chapter.content) {
                return [{
                    index: chapterIdx + 1,
                    heading: chapter.title || chapter.name || null,
                    text: chapter.text || chapter.content || "",
                }, ];
            }
            return [];
        });
    }
    // Structure 3: Volumes -> Chapters -> Content
    else if (bookData.volumes && Array.isArray(bookData.volumes)) {
        let unitIndex = 1;
        bookData.volumes.forEach((volume) => {
            if (volume.chapters && Array.isArray(volume.chapters)) {
                volume.chapters.forEach((chapter) => {
                    if (chapter.content && Array.isArray(chapter.content)) {
                        chapter.content.forEach((item) => {
                            units.push({
                                index: unitIndex++,
                                heading: chapter.title || chapter.name || null,
                                text: item.text || item.content || item || "",
                            });
                        });
                    } else if (chapter.text || chapter.content) {
                        units.push({
                            index: unitIndex++,
                            heading: chapter.title || chapter.name || null,
                            text: chapter.text || chapter.content || "",
                        });
                    }
                });
            }
        });
    }
    // Structure 4: Direct content array
    else if (bookData.content && Array.isArray(bookData.content)) {
        units = bookData.content.map((item, idx) => ({
            index: idx + 1,
            heading: item.title || item.heading || null,
            text: item.text || item.content || item || "",
        }));
    }
    // Structure 5: Hadiths array (common in Islamic books)
    else if (bookData.hadiths && Array.isArray(bookData.hadiths)) {
        units = bookData.hadiths.map((hadith, idx) => ({
            index: idx + 1,
            heading: hadith.chapter || hadith.section || null,
            text: hadith.text ||
                hadith.content ||
                hadith.narrator + ": " + hadith.text ||
                "",
        }));
    }
    // Structure 6: Items array
    else if (bookData.items && Array.isArray(bookData.items)) {
        units = bookData.items.map((item, idx) => ({
            index: idx + 1,
            heading: item.title || item.heading || null,
            text: item.text || item.content || item || "",
        }));
    }
    // Structure 7: Pages array (shamela_crawler format)
    else if (bookData.pages && Array.isArray(bookData.pages)) {
        units = bookData.pages.map((page, idx) => ({
            index: page.page_number || page.page || idx + 1,
            heading: null,
            text: page.text || page.content || "",
        }));
    }
    // Structure 8: Single text content
    else if (bookData.text || bookData.content) {
        // Split by paragraphs or newlines
        const text = bookData.text || bookData.content;
        const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
        units = paragraphs.map((para, idx) => ({
            index: idx + 1,
            heading: null,
            text: para.trim(),
        }));
    }

    // Clean and validate units
    transformed.units = units
        .map((unit, idx) => ({
            index: unit.index !== undefined ? unit.index : idx + 1,
            heading: unit.heading || null,
            text: String(unit.text || "").trim(),
        }))
        .filter((unit) => unit.text.length > 0); // Remove empty units

    if (transformed.units.length === 0) {
        throw new Error("No units found in book data. Check JSON structure.");
    }

    return transformed;
}

async function transformFile(inputPath, outputPath) {
    try {
        console.log(`Reading: ${inputPath}`);
        const rawContent = await readFile(inputPath, "utf-8");
        const rawData = JSON.parse(rawContent);

        console.log("Transforming data...");
        const transformed = transformShamelaData(rawData);

        console.log(`Writing: ${outputPath}`);
        await writeFile(outputPath, JSON.stringify(transformed, null, 2), "utf-8");

        console.log(
            `✓ Transformed: ${transformed.title} (${transformed.units.length} units)`
        );
        return transformed;
    } catch (error) {
        console.error(`Error transforming ${inputPath}:`, error.message);
        throw error;
    }
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log(
            "Usage: node scripts/transform_shamela_json.js <input-file> [output-file]"
        );
        console.log(
            "Example: node scripts/transform_shamela_json.js ../data/book_1157.json ../data/book_1157_transformed.json"
        );
        process.exit(1);
    }

    const dataDir = join(__dirname, "../data");
    const projectRoot = join(__dirname, "..");

    // Check if path is absolute (Windows or Unix) or relative
    const isAbsolutePath = (path) => {
        return path.startsWith("/") ||
            /^[A-Za-z]:/.test(path) || // Windows absolute path (C:\, D:\, etc.)
            path.startsWith("..") ||
            path.startsWith(".");
    };

    // Resolve path: if absolute, use as-is; if relative, resolve from project root
    const resolvePath = (path) => {
        if (isAbsolutePath(path)) {
            return path;
        }
        // Relative paths are resolved from project root
        return join(projectRoot, path);
    };

    const inputPath = resolvePath(args[0]);
    const outputPath = args[1] ? resolvePath(args[1]) : inputPath.replace(".json", "_transformed.json");

    try {
        await transformFile(inputPath, outputPath);
        console.log("\n✓ Transformation complete!");
        console.log(`Output file: ${outputPath}`);
    } catch (error) {
        console.error("\n✗ Transformation failed:", error.message);
        process.exit(1);
    }
}

main();