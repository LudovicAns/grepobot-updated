#!/usr/bin/env python3
import base64
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
OUT = ROOT / "GrepoBotUpdated.user.js"

JS_DIR = SRC / "js"
CSS_FILE = SRC / "styles" / "GrepoBotUpdated.css"
IMAGES_DIR = SRC / "assets" / "images"

JS_FILES = [
    "GrepoBotUpdated.js",
    "ConsoleLog.js",
    "DataExchanger.js",
    "FormBuilder.js",
    "ModuleManager.js",
    "Assistant.js",
    "Redirect.js",
    "Autofarm.js",
    "Autoculture.js",
    "Autobuild.js",
    "Autoattack.js",
]


def b64_encode(data: bytes) -> str:
    return base64.b64encode(data).decode("ascii")


def inline_css_images(css_text: str) -> str:
    def repl(match: re.Match) -> str:
        path = match.group(2)
        normalized = path.lstrip("./")
        if not (
            normalized.startswith("images/")
            or normalized.startswith("assets/images/")
            or normalized.startswith("../assets/images/")
        ):
            return match.group(0)
        image_path = IMAGES_DIR / Path(path).name
        if not image_path.exists():
            return match.group(0)
        encoded = b64_encode(image_path.read_bytes())
        return f"url(data:image/png;base64,{encoded})"

    pattern = re.compile(r"url\((['\"]?)([^'\")]+)\1\)")
    return pattern.sub(repl, css_text)


def read_text(path: Path, encoding: str = "utf-8") -> str:
    return path.read_text(encoding=encoding)


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Missing source directory: {SRC}")

    css_text = read_text(CSS_FILE, encoding="latin-1")
    css_inlined = inline_css_images(css_text)
    css_b64 = b64_encode(css_inlined.encode("latin-1"))

    bundle = {}
    for name in JS_FILES:
        path = JS_DIR / name
        if not path.exists():
            raise SystemExit(f"Missing JS file: {path}")
        bundle[name] = b64_encode(path.read_bytes())

    userscript = []
    userscript.append("// ==UserScript==")
    userscript.append("// @name         GrepoBot Updated")
    userscript.append("// @namespace    local.grepobot")
    userscript.append("// @version      0.1.0")
    userscript.append("// @description  Local bundle for GrepoBot Updated")
    userscript.append("// @match        https://*.grepolis.com/game/*")
    userscript.append("// @exclude      https://classic.grepolis.com/game/*")
    userscript.append("// @grant        none")
    userscript.append("// ==/UserScript==")
    userscript.append("")
    userscript.append("const GREPOBOT_BUNDLE = {")
    for name in JS_FILES:
        userscript.append(f'  "{name}": "{bundle[name]}",')
    userscript.append("};")
    userscript.append(f'const GREPOBOT_CSS_B64 = "{css_b64}";')
    userscript.append("")
    userscript.append("function grepobotDecode(b64) {")
    userscript.append("  return atob(b64);")
    userscript.append("}")
    userscript.append("")
    userscript.append("function grepobotInjectScript(code) {")
    userscript.append("  const script = document.createElement(\"script\");")
    userscript.append("  script.textContent = code;")
    userscript.append("  document.documentElement.appendChild(script);")
    userscript.append("  script.remove();")
    userscript.append("}")
    userscript.append("")
    userscript.append("function grepobotRunScript(name) {")
    userscript.append("  const b64 = GREPOBOT_BUNDLE[name];")
    userscript.append("  if (!b64) {")
    userscript.append("    throw new Error(\"Missing script in bundle: \" + name);")
    userscript.append("  }")
    userscript.append("  const code = grepobotDecode(b64);")
    userscript.append("  grepobotInjectScript(code);")
    userscript.append("}")
    userscript.append("")
    userscript.append("function grepobotInjectCss() {")
    userscript.append("  if (document.getElementById(\"grepobot-local-css\")) {")
    userscript.append("    return;")
    userscript.append("  }")
    userscript.append("  const style = document.createElement(\"style\");")
    userscript.append("  style.id = \"grepobot-local-css\";")
    userscript.append("  style.textContent = grepobotDecode(GREPOBOT_CSS_B64);")
    userscript.append("  document.head.appendChild(style);")
    userscript.append("}")
    userscript.append("")
    userscript.append("function grepobotParseAjaxOptions(args) {")
    userscript.append("  if (!args.length) {")
    userscript.append("    return null;")
    userscript.append("  }")
    userscript.append("  const first = args[0];")
    userscript.append("  if (typeof first === \"string\") {")
    userscript.append("    const opts = args[1] ? Object.assign({}, args[1]) : {};")
    userscript.append("    opts.url = first;")
    userscript.append("    return opts;")
    userscript.append("  }")
    userscript.append("  if (first && typeof first === \"object\") {")
    userscript.append("    return first;")
    userscript.append("  }")
    userscript.append("  return null;")
    userscript.append("}")
    userscript.append("")
    userscript.append("function grepobotBundleNameFromUrl(url) {")
    userscript.append("  if (!url) {")
    userscript.append("    return null;")
    userscript.append("  }")
    userscript.append("  const last = url.split(\"/\").pop();")
    userscript.append("  return last ? last.split(\"?\")[0] : null;")
    userscript.append("}")
    userscript.append("")
    userscript.append("function grepobotInstallAjaxHook() {")
    userscript.append("  if (!window.jQuery || window.__grepobot_ajax_hooked) {")
    userscript.append("    return;")
    userscript.append("  }")
    userscript.append("  const $ = window.jQuery;")
    userscript.append("  const originalAjax = $.ajax;")
    userscript.append("")
    userscript.append("  $.ajax = function () {")
    userscript.append("    const options = grepobotParseAjaxOptions(arguments);")
    userscript.append("    if (options && options.dataType) {")
    userscript.append("      const dataType = String(options.dataType).toLowerCase();")
    userscript.append("      if (dataType === \"script\") {")
    userscript.append("        const name = grepobotBundleNameFromUrl(options.url);")
    userscript.append("        if (name && GREPOBOT_BUNDLE[name]) {")
    userscript.append("          const d = $.Deferred();")
    userscript.append("          try {")
    userscript.append("            grepobotRunScript(name);")
    userscript.append("            if (typeof options.success === \"function\") {")
    userscript.append("              options.success();")
    userscript.append("            }")
    userscript.append("            if (typeof options.complete === \"function\") {")
    userscript.append("              options.complete();")
    userscript.append("            }")
    userscript.append("            d.resolve();")
    userscript.append("          } catch (err) {")
    userscript.append("            console.error(\"[Grepolis] Script load failed:\", name, err);")
    userscript.append("            if (typeof options.error === \"function\") {")
    userscript.append("              options.error(err);")
    userscript.append("            }")
    userscript.append("            if (typeof options.complete === \"function\") {")
    userscript.append("              options.complete();")
    userscript.append("            }")
    userscript.append("            d.reject(err);")
    userscript.append("          }")
    userscript.append("          return d;")
    userscript.append("        }")
    userscript.append("      }")
    userscript.append("    }")
    userscript.append("    return originalAjax.apply(this, arguments);")
    userscript.append("  };")
    userscript.append("")
    userscript.append("  window.__grepobot_ajax_hooked = true;")
    userscript.append("}")
    userscript.append("")
    userscript.append("function grepobotWaitForReady() {")
    userscript.append("  const timer = setInterval(function () {")
    userscript.append("    if (window.__grepobot_local_loaded) {")
    userscript.append("      clearInterval(timer);")
    userscript.append("      return;")
    userscript.append("    }")
    userscript.append("    if (!document.head || !window.jQuery) {")
    userscript.append("      return;")
    userscript.append("    }")
    userscript.append("    window.__grepobot_local_loaded = true;")
    userscript.append("    grepobotInstallAjaxHook();")
    userscript.append("    grepobotInjectCss();")
    userscript.append("    grepobotRunScript(\"GrepoBotUpdated.js\");")
    userscript.append("  }, 250);")
    userscript.append("}")
    userscript.append("")
    userscript.append("grepobotWaitForReady();")
    userscript.append("")

    OUT.write_text("\n".join(userscript), encoding="utf-8")
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
