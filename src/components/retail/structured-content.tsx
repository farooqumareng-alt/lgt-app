// Shared prose renderer for both ContentPage ([slug]) and BlogPost detail —
// a "## " prefixed paragraph renders as a real section heading, a block
// whose every line starts with "- " renders as a real bullet list, and
// everything else is a plain paragraph. Extracted here once both content
// types needed the same convention, rather than duplicating the parse logic.
export function StructuredContent({ content }: { content: string }) {
  const blocks = content.split(/\n\s*\n/).filter((p) => p.trim());

  return (
    <div className="prose space-y-4 text-ink/80">
      {blocks.map((block, i) => {
        const trimmed = block.trim();

        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={i} className="!mb-2 font-display text-xl text-ink">
              {trimmed.slice(3).trim()}
            </h2>
          );
        }

        const lines = trimmed.split("\n").map((line) => line.trim());
        if (lines.length > 0 && lines.every((line) => line.startsWith("- "))) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5 leading-relaxed">
              {lines.map((line, j) => (
                <li key={j}>{line.slice(2).trim()}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} className="whitespace-pre-line leading-relaxed">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}
