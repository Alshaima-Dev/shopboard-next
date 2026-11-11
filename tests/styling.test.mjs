import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(file) : [file];
  });
}

test("globals.css is the only application stylesheet and its only import is the root layout", () => {
  const files = sourceFiles("src");
  assert.deepEqual(files.filter(file => /\.css$/i.test(file)).map(file => file.replaceAll("\\", "/")), ["src/app/globals.css"]);
  const imports = files.filter(file => /\.[jt]sx?$/.test(file)).flatMap(file => {
    const source = readFileSync(file, "utf8");
    return [...source.matchAll(/import\s+["']([^"']+\.css)["']/g)].map(match => [file.replaceAll("\\", "/"), match[1]]);
  });
  assert.deepEqual(imports, [["src/app/layout.tsx", "./globals.css"]]);
  const globals = readFileSync("src/app/globals.css", "utf8");
  assert.ok(globals.includes('@import "tailwindcss";'));
  assert.ok(globals.includes("@theme static"));
  assert.ok(globals.includes("@theme inline"));
  assert.ok(!globals.includes(".home-storefront"), "Home selectors must not be moved into globals.css");
});

test("Home and catalog do not replace stylesheet rules with inline styles or embedded CSS", () => {
  for (const file of ["src/app/page.tsx", "src/features/products/interactive-catalog.tsx"]) {
    const source = readFileSync(file, "utf8");
    assert.ok(!/\bstyle\s*=|<style\b/.test(source), file);
  }
});
