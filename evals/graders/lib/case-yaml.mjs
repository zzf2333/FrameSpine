/**
 * Minimal YAML subset used by FrameSpine eval cases.
 * Supports maps, lists, scalars, nested indentation, and | block scalars.
 * No external dependency.
 */

export function parseMinimalYaml(text) {
  const lines = text.replace(/\t/g, '  ').split(/\r?\n/);
  const root = {};
  const stack = [{ indent: -1, value: root, kind: 'map' }];
  let i = 0;

  function current() {
    return stack[stack.length - 1];
  }

  while (i < lines.length) {
    const line = lines[i];
    i += 1;
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const indent = line.match(/^ */)[0].length;
    const trimmed = line.trim();

    while (stack.length > 1 && indent <= current().indent) {
      stack.pop();
    }

    const ctx = current();

    if (trimmed.startsWith('- ')) {
      const itemText = trimmed.slice(2);
      if (!Array.isArray(ctx.value)) {
        throw new Error(`list item without list context near: ${line}`);
      }

      // Nested map list item: "- key: value" or "- key:"
      const objMatch = itemText.match(/^([^:]+):(.*)$/);
      if (objMatch && !itemText.startsWith('"') && !itemText.startsWith("'")) {
        const obj = {};
        const k = objMatch[1].trim();
        const rest = objMatch[2].trim();
        if (!rest) {
          // may be nested under this list item
          obj[k] = null;
          ctx.value.push(obj);
          stack.push({ indent, value: obj, kind: 'map' });
        } else if (rest === '|' || rest === '>') {
          const collected = collectBlock(lines, i, indent);
          i = collected.next;
          obj[k] = collected.text;
          ctx.value.push(obj);
        } else {
          obj[k] = parseScalar(rest);
          ctx.value.push(obj);
        }
        continue;
      }

      ctx.value.push(parseScalar(itemText));
      continue;
    }

    const m = trimmed.match(/^([^:]+):(.*)$/);
    if (!m) {
      throw new Error(`cannot parse line: ${line}`);
    }
    const key = m[1].trim();
    const rest = m[2].trim();

    if (!rest) {
      const next = lines[i];
      const nextIndent = next ? next.match(/^ */)[0].length : 0;
      const nextTrim = next ? next.trim() : '';
      let child;
      if (nextTrim.startsWith('- ')) {
        child = [];
      } else if (next && nextTrim && nextIndent > indent) {
        child = {};
      } else {
        child = null;
      }
      if (Array.isArray(ctx.value)) {
        throw new Error(`map key inside list unsupported: ${key}`);
      }
      ctx.value[key] = child;
      if (child && typeof child === 'object') {
        stack.push({
          indent,
          value: child,
          kind: Array.isArray(child) ? 'list' : 'map',
        });
      }
      continue;
    }

    if (rest === '|' || rest === '>') {
      const collected = collectBlock(lines, i, indent);
      i = collected.next;
      ctx.value[key] = collected.text;
      continue;
    }

    ctx.value[key] = parseScalar(rest);
  }

  return root;
}

function collectBlock(lines, start, parentIndent) {
  const collected = [];
  let i = start;
  while (i < lines.length) {
    const nl = lines[i];
    if (!nl.trim()) {
      collected.push('');
      i += 1;
      continue;
    }
    const nIndent = nl.match(/^ */)[0].length;
    if (nIndent <= parentIndent) break;
    collected.push(nl.slice(parentIndent + 2));
    i += 1;
  }
  return {
    next: i,
    text: collected.join('\n').replace(/\s+$/, ''),
  };
}

export function parseScalar(v) {
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    return v.slice(1, -1);
  }
  return v;
}

export function loadCaseFile(file, readFileSync) {
  const raw = readFileSync(file, 'utf8');
  if (file.endsWith('.json')) {
    try {
      return JSON.parse(raw);
    } catch (err) {
      throw new Error(`invalid JSON in ${file}: ${err.message}`);
    }
  }
  return parseMinimalYaml(raw);
}
