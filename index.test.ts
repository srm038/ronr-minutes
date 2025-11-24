import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  mock,
  spyOn,
  test,
} from "bun:test";
import { processMinutes } from "./processMinutes";
import remarkParse from "remark-parse";
import { unified } from "unified";

let createFileSpy = () => spyOn(Bun, "file");

afterEach(() => {
  mock.clearAllMocks();
  mock.restore();
});

describe("markdown to tex", async () => {
  let fileSpy: ReturnType<typeof createFileSpy>;
  beforeEach(() => {
    mock.clearAllMocks();
    mock.restore();
    fileSpy = createFileSpy();
  });

  test("markdown should convert to tex properly", async () => {
    let markdown = unified()
      .use(remarkParse)
      .parse("- Action: Action 1\n- Action: Action 2");
    let tex = await processMinutes({ markdown });
    expect(tex).toBe(
      String.raw`\begin{enumerate}\item\textbf{Action:} Action 1\item\textbf{Action:} Action 2\end{enumerate}`,
    );
  });
});
