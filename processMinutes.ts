import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import { unified } from "unified";

interface LoadMarkdownProps {
  file: string;
}

export const loadMarkdown = async ({ file }: LoadMarkdownProps) => {
  let markdown = await Bun.file(file).text();
  let ast = unified().use(remarkParse).use(remarkFrontmatter).parse(markdown);
  return ast;
};

interface ProcessMinutesProps {
  markdown: any;
}

export const processMinutes = async ({
  markdown,
}: ProcessMinutesProps): Promise<string> => {
  let tex = "";

  switch (markdown.type) {
    case "text": {
      let match = new RegExp(/^(.*?): (.*)/).exec(markdown.value);
      if (match?.[0]) {
        return `${tex}\\item\\textbf{${match[1]}:} ${match[2]}`;
      }
      break;
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
        return `${tex}${await processMinutes({ markdown: child })}`;
      }
  }
  return tex;
};

interface SaveTexProps {
  file: string;
  tex: string;
}

export const saveTex = async ({ file, tex }: SaveTexProps) => {
  await Bun.write(`${file.slice(0, -3)}.tex`, tex);
};
