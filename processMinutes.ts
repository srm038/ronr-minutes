import { YAML } from "bun";
import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import remarkParseYAML from "remark-parse-yaml";
import { unified } from "unified";
import * as z from "zod";

interface LoadMarkdownProps {
  file: string;
}

export const loadMarkdown = async ({ file }: LoadMarkdownProps) => {
  let markdown = await Bun.file(file).text();
  let ast = unified().use(remarkParse).use(remarkFrontmatter).parse(markdown);
  return ast;
};

const FrontMatter = z.object({
  date: z.string().transform((val) => new Date(val)),
  present: z.array(z.string()),
  absent: z.array(z.string()).optional(),
  version: z.string().regex(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/),
});

interface ProcessMinutesProps {
  markdown: any;
}

export const processMinutes = async ({
  markdown,
}: ProcessMinutesProps): Promise<string> => {
  let tex = "";

  if (!markdown) return tex;

  // console.log(JSON.stringify(markdown, null, 2));

  switch (markdown.type) {
    case "yaml":
      // console.log(JSON.stringify(markdown, null, 2));
      let yaml = YAML.parse(markdown.value);
      let data = FrontMatter.parse(yaml);
      console.log(data);
      return tex;
    case "text": {
      let match = new RegExp(/^(.*?): (.*)/).exec(markdown.value);
      if (match) {
        return `${tex}\\item\\textbf{${match[1]}:} ${match[2]}`;
      }
      return tex;
    }
    case "list": {
      tex = `${tex}\\begin{enumerate}`;
      for (const child of markdown.children) {
        tex = `${tex}${await processMinutes({ markdown: child })}`;
      }
      return `${tex}\\end{enumerate}`;
    }
    default:
      for (const child of markdown.children) {
        tex = `${tex}${await processMinutes({ markdown: child })}`;
      }
      return tex;
  }
};

interface SaveTexProps {
  file: string;
  tex: string;
}

export const saveTex = async ({ file, tex }: SaveTexProps) => {
  await Bun.write(`${file.slice(0, -3)}.tex`, tex);
};
