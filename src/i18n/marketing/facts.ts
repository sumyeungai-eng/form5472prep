// Extract factual tokens from the existing code-owned English strings. The
// catalog supplies prose, while changes to the source values flow through.
export function messageFacts(text: string) {
  const values: Record<string, string> = {};
  let amount = 0;
  let days = 0;
  const template = text.replace(/\$\d+(?:,\d{3})*(?:\.\d+)?k?/g, value => {
    const key = `amount${++amount}`;
    values[key] = value;
    return `{${key}}`;
  }).replace(/\bUSD\b/g, value => {
    values.currency = value;
    return "{currency}";
  }).replace(/\b\d+(?:[–-]\d+)?(?=[\s-]*(?:business\s+)?days?\b)/g, value => {
    const key = `days${++days}`;
    values[key] = value;
    return `{${key}}`;
  });
  let result = template;
  for (const unit of ["hours", "weeks"] as const) {
    let count = 0;
    const pattern = new RegExp(`\\b\\d+(?:[–-]\\d+)?(?=\\s*${unit}?\\b)`, "g");
    result = result.replace(pattern, value => {
      const key = `${unit}${++count}`;
      values[key] = value;
      return `{${key}}`;
    });
  }
  return { template: result, values };
}
