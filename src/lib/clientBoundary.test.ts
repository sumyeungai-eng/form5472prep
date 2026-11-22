import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const file = join(dir, name);
    if (statSync(file).isDirectory()) return walk(file);
    return /\.tsx?$/.test(name) && !/\.test\./.test(name) ? [file] : [];
  });
}

// Preserve string literals (including URLs) while removing comments.
function withoutComments(source: string): string {
  return source.replace(
    /"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|`(?:\\[\s\S]|[^`\\])*`|\/\*[\s\S]*?\*\/|\/\/[^\r\n]*/g,
    (match) => match.startsWith("/") ? match.replace(/[^\r\n]/g, " ") : match,
  );
}

function isClient(source: string): boolean {
  return /^\s*(["'])use client\1(?:\s*;|[ \t]*(?:\r?\n|$))/.test(withoutComments(source));
}

function valueImports(source: string): { name: string; modulePath: string }[] {
  const imports: { name: string; modulePath: string }[] = [];
  const pattern = /^\s*import\s+(type\s+)?([^;"'`]+?)\s+from\s*["']([^"']+)["']/gm;
  for (const match of Array.from(withoutComments(source).matchAll(pattern))) {
    if (match[1]) continue;
    const clause = match[2].trim();
    const modulePath = match[3];
    const defaultName = clause.match(/^([\w$]+)/)?.[1];
    if (defaultName) imports.push({ name: defaultName, modulePath });
    const namespaceName = clause.match(/\*\s+as\s+([\w$]+)/)?.[1];
    if (namespaceName) imports.push({ name: namespaceName, modulePath });
    const named = clause.match(/\{([\s\S]*?)\}/)?.[1] ?? "";
    for (const item of named.split(",")) {
      const specifier = item.trim();
      if (!specifier || /^type\s+(?!as\b)/.test(specifier)) continue;
      // Check the exported name, so aliasing a constant as a component cannot hide it.
      imports.push({ name: specifier.split(/\s+as\s+/)[0].trim(), modulePath });
    }
  }
  return imports;
}

function resolveModule(file: string, modulePath: string): string | undefined {
  const base = modulePath.startsWith("@/")
    ? resolve(process.cwd(), "src", modulePath.slice(2))
    : modulePath.startsWith(".") ? resolve(dirname(file), modulePath) : undefined;
  if (!base) return undefined;
  return [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")]
    .find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
}

describe("React client boundary", () => {
  it("recognizes only a first-statement client directive, allowing leading comments", () => {
    expect(isClient('\n/* header */\n// comment\n"use client";\n')).toBe(true);
    expect(isClient("// header\n'use client'\nimport X from './x';")).toBe(true);
    expect(isClient('import X from "./x";\n"use client";')).toBe(false);
    expect(isClient('"use client" + value;')).toBe(false);
  });

  it("keeps original value names and exempts type-only imports", () => {
    expect(valueImports(`
      // import { ignored } from "./client";
      import type { Props } from "./client";
      import DefaultWidget, {
        Widget as RenamedWidget, SETTINGS as Settings, type Props, type as renamedType,
      } from "@/components/client";
      import helper from "./client";
    `)).toEqual([
      { name: "DefaultWidget", modulePath: "@/components/client" },
      { name: "Widget", modulePath: "@/components/client" },
      { name: "SETTINGS", modulePath: "@/components/client" },
      { name: "type", modulePath: "@/components/client" },
      { name: "helper", modulePath: "./client" },
    ]);
  });

  it("imports only PascalCase components from client modules into server files", () => {
    const files = [...walk(join(process.cwd(), "src/app")), ...walk(join(process.cwd(), "src/components"))];
    const violations: string[] = [];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      if (isClient(source)) continue;
      for (const { name, modulePath } of valueImports(source)) {
        const target = resolveModule(file, modulePath);
        if (target && isClient(readFileSync(target, "utf8")) && !/^[A-Z][a-z]/.test(name)) {
          violations.push(`${relative(process.cwd(), file)} -> ${name} -> ${modulePath}`);
        }
      }
    }
    expect(violations, violations.join("\n")).toEqual([]);
  });
});
