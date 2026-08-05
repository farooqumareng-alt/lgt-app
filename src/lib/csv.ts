/**
 * Minimal RFC 4180-ish CSV parser — handles quoted fields (with embedded
 * commas/newlines) and escaped quotes ("") without pulling in a dependency.
 * Good enough for admin-authored spreadsheets; not meant for arbitrary
 * untrusted CSV from the open internet.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && next === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  }

  return rows;
}

/** Parses CSV text with a header row into an array of column-keyed objects. */
export function parseCsvWithHeader(text: string): Record<string, string>[] {
  const rows = parseCsv(text);
  if (rows.length === 0) return [];
  const [header, ...body] = rows;
  const keys = header.map((h) => h.trim());
  return body.map((row) => Object.fromEntries(keys.map((key, i) => [key, (row[i] ?? "").trim()])));
}
