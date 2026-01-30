import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const packagePath = path.join(rootDir, "package.json");
const jsPath = path.join(distDir, "grepo-modern.js");
const cssPath = path.join(distDir, "grepo-modern.css");
const outPath = path.join(rootDir, "GrepoBotModern.user.js");

if (!fs.existsSync(jsPath)) {
  throw new Error("Missing build output: " + jsPath);
}

const pkg = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
const jsBundle = fs.readFileSync(jsPath, "utf-8");
const cssBundle = fs.existsSync(cssPath)
  ? fs.readFileSync(cssPath, "utf-8")
  : "";

const header = [
  "// ==UserScript==",
  `// @name         ${pkg.name || "GrepoBot Modern"}`,
  "// @namespace    local.grepobot",
  `// @version      ${pkg.version || "0.0.1"}`,
  `// @description  ${pkg.description || "GrepoBot Modern userscript"}`,
  "// @match        https://*.grepolis.com/game/*",
  "// @exclude      https://classic.grepolis.com/game/*",
  "// @grant        none",
  "// @run-at       document-start",
  "// ==/UserScript==",
  "",
].join("\n");

const cssBlock = cssBundle
  ? `  var styleText = ${JSON.stringify(cssBundle)};\n` +
    "  if (styleText && !document.getElementById(\"grepobot-modern-style\")) {\n" +
    "    var style = document.createElement(\"style\");\n" +
    "    style.id = \"grepobot-modern-style\";\n" +
    "    style.textContent = styleText;\n" +
    "    (document.head || document.documentElement).appendChild(style);\n" +
    "  }\n"
  : "";

const body = [
  "(function () {",
  "  \"use strict\";",
  "  var process = window.process || { env: { NODE_ENV: \"production\" } };",
  "  if (window.__grepobot_modern_loaded) {",
  "    return;",
  "  }",
  "  window.__grepobot_modern_loaded = true;",
  cssBlock,
  jsBundle,
  "})();",
  "",
].join("\n");

fs.writeFileSync(outPath, header + body, "utf-8");
console.log("Userscript written to", outPath);
