export type Block =
  | { type: "p"; text: string }
  | { type: "ol" | "ul"; items: string[] };

type ListBlock = Extract<Block, { type: "ol" | "ul" }>;

const blankLinePattern = /\n[ \t]*\n+/;
const orderedItemPattern = /^\s*\d+\.\s+(.+)$/;
const unorderedItemPattern = /^\s*[•\-–]\s+(.+)$/;

function collapseItem(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

export function parseLandingBody(body: string): Block[] {
  const blocks: Block[] = [];
  const chunks = body
    .split(blankLinePattern)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  for (const chunk of chunks) {
    const paragraphLines: string[] = [];
    let currentList: ListBlock | undefined;

    const flushParagraph = () => {
      if (paragraphLines.length === 0) return;
      blocks.push({ type: "p", text: paragraphLines.join("\n") });
      paragraphLines.length = 0;
    };

    const flushList = () => {
      if (!currentList) return;
      currentList.items = currentList.items.map(collapseItem).filter(Boolean);
      if (currentList.items.length > 0) blocks.push(currentList);
      currentList = undefined;
    };

    for (const line of chunk.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const orderedItem = line.match(orderedItemPattern);
      const unorderedItem = line.match(unorderedItemPattern);
      const itemType = orderedItem ? "ol" : unorderedItem ? "ul" : undefined;
      const itemText = orderedItem?.[1] ?? unorderedItem?.[1];

      if (unorderedItem && currentList?.type === "ol") {
        const lastIndex = currentList.items.length - 1;
        currentList.items[lastIndex] = `${currentList.items[lastIndex]} ${trimmed}`;
      } else if (itemType && itemText) {
        flushParagraph();
        if (currentList?.type !== itemType) {
          flushList();
          currentList = { type: itemType, items: [] };
        }
        currentList.items.push(itemText);
      } else if (currentList) {
        const lastIndex = currentList.items.length - 1;
        currentList.items[lastIndex] = `${currentList.items[lastIndex]} ${trimmed}`;
      } else {
        paragraphLines.push(trimmed);
      }
    }

    flushList();
    flushParagraph();
  }

  return blocks;
}

export function orderedListItems(body: string): string[] {
  return parseLandingBody(body).flatMap((block) => (block.type === "ol" ? block.items : []));
}
