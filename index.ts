import { loadMarkdown, processMinutes, saveTex } from "./processMinutes";

const file = process.argv[2] || "";

const markdown = await loadMarkdown({ file });

let tex = await processMinutes({ markdown });

await saveTex({ file, tex });
