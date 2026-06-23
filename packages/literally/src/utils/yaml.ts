/**
 * Simple YAML parser to avoid external sandboxed npm/dependency issues.
 * Supports basic key-value pairs, nesting by indentation, and comments.
 */
export function parseYaml(yamlText: string): any {
  const result: any = {};
  const lines = yamlText.split(/\r?\n/);
  const stack: { indent: number; obj: any }[] = [{ indent: -1, obj: result }];

  for (let line of lines) {
    // Remove comments
    const hashIdx = line.indexOf('#');
    if (hashIdx !== -1) {
      const beforeHash = line.substring(0, hashIdx);
      const quoteCount =
        (beforeHash.match(/"/g) || []).length +
        (beforeHash.match(/'/g) || []).length;
      if (quoteCount % 2 === 0) {
        line = beforeHash;
      }
    }

    const trimmed = line.trim();
    if (!trimmed) continue;

    // Measure indentation
    const indent = line.length - line.trimStart().length;

    // Match key: value or key:
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const key = trimmed
      .substring(0, colonIdx)
      .trim()
      .replace(/^['"]|['"]$/g, '');
    let valStr = trimmed.substring(colonIdx + 1).trim();

    // Check if value is a string with quotes or other primitive type
    let val: any = valStr;
    if (valStr.startsWith('"') && valStr.endsWith('"')) {
      val = valStr.slice(1, -1);
    } else if (valStr.startsWith("'") && valStr.endsWith("'")) {
      val = valStr.slice(1, -1);
    } else if (valStr === 'true') {
      val = true;
    } else if (valStr === 'false') {
      val = false;
    } else if (valStr === 'null') {
      val = null;
    } else if (valStr !== '' && !isNaN(Number(valStr))) {
      val = Number(valStr);
    }

    // Adjust stack based on indentation
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].obj;
    if (valStr === '') {
      const newObj = {};
      parent[key] = newObj;
      stack.push({ indent, obj: newObj });
    } else {
      parent[key] = val;
    }
  }

  return result;
}
