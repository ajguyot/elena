import elenaSource from "../../../../packages/core/dist/bundle.js?raw";

// Strip the sourcemap comment so the browser doesn't try to fetch it from a null base URL.
const _cleanSource = elenaSource.replace(/\/\/# sourceMappingURL=.*$/m, "").trim();
const _elenaUrl =
  typeof Blob !== "undefined"
    ? URL.createObjectURL(new Blob([_cleanSource], { type: "text/javascript" }))
    : `data:text/javascript;charset=utf-8,${encodeURIComponent(_cleanSource)}`;
/**
 * Generate the full srcdoc HTML string for the preview iframe.
 *
 * The CSS panel content is available to examples via "./styles.css":
 *   - JS: import styles from "./styles.css" with { type: "css" };
 *   - HTML: <link rel="stylesheet" href="./styles.css">
 */
export function generateSrcdoc(js, css, htmlContent) {
  // Build a JS module that exports a CSSStyleSheet from the CSS panel content,
  // mirroring what @elenajs/bundler produces for CSS Module Script imports.
  const cssModuleCode = `const s=new CSSStyleSheet();s.replaceSync(${JSON.stringify(css)});export default s;`;
  const cssModuleUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(cssModuleCode)}`;
  const importMap = JSON.stringify({
    imports: { "@elenajs/core": _elenaUrl, "./styles.css": cssModuleUrl },
  });

  // Strip `with { type: "css" }` import assertions — the import map resolves
  // "./styles.css" to a JS module, so a CSS type assertion would be rejected.
  const processedJs = js.replace(/\s+(?:with|assert)\s*\{\s*type:\s*["']css["']\s*\}/g, "");

  // Replace href="./styles.css" in HTML with a CSS data URL so that
  // <link rel="stylesheet" href="./styles.css"> works inside Declarative Shadow DOM.
  const cssDataUrl = `data:text/css;charset=utf-8,${encodeURIComponent(css)}`;
  const processedHtml = htmlContent.replace(
    /href=["']\.\/styles\.css["']/g,
    `href="${cssDataUrl}"`
  );

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script type="importmap">${importMap}</script>
<style>
body {
  font-family: system-ui, -apple-system, sans-serif;
  margin: 1rem;
  color: #1a1a1a;
}
${css}
</style>
</head>
<body>
${processedHtml}
<script>
window.addEventListener("error", function (e) {
  document.body.innerHTML =
    '<pre style="color:#e53e3e;padding:1rem;font-size:13px;white-space:pre-wrap;font-family:ui-monospace,monospace">' +
    e.message + "\\n" + (e.filename ? "at " + e.filename + ":" + e.lineno : "") +
    "</pre>";
});
window.addEventListener("unhandledrejection", function (e) {
  document.body.innerHTML =
    '<pre style="color:#e53e3e;padding:1rem;font-size:13px;white-space:pre-wrap;font-family:ui-monospace,monospace">' +
    (e.reason?.message || String(e.reason)) +
    "</pre>";
});
</script>
<script type="module">
${processedJs}
</script>
</body>
</html>`;
}

/**
 * Find an example by its ID from the categories array.
 */
export function findExample(categories, id) {
  for (const category of categories) {
    const found = category.items.find(item => item.id === id);
    if (found) {
      return found;
    }
  }
  return null;
}

/**
 * Read the example ID from the URL hash.
 */
export function getHashId() {
  if (typeof window === "undefined") {
    return null;
  }
  const hash = window.location.hash.slice(1);
  return hash || null;
}

/**
 * Set the URL hash without triggering a scroll.
 */
export function setHash(id) {
  if (typeof window === "undefined") {
    return;
  }
  history.replaceState(null, "", "#" + id);
}

/**
 * Create a debounced version of a function.
 */
export function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Replace <link rel="stylesheet" href="./styles.css"> with inline <style> blocks
 * so exported HTML is self-contained.
 */
function inlineStylesheetLinks(html, css) {
  if (!css) {
    return html;
  }
  return html.replace(
    /<link\s+(?:rel=["']stylesheet["']\s+href=["']\.\/styles\.css["']|href=["']\.\/styles\.css["']\s+rel=["']stylesheet["'])\s*\/?>/g,
    `<style>\n${css}\n</style>`
  );
}

/**
 * Rewrite bare `@elenajs/core` imports to the unpkg CDN URL and
 * CSS Module Script imports to inline CSSStyleSheet construction.
 */
function rewriteImports(js, css) {
  const cdnUrl = "https://unpkg.com/@elenajs/core/bundle";
  let result = js
    .replace(/from\s+["']@elenajs\/core["']/g, `from "${cdnUrl}"`)
    .replace(/import\s*\(\s*["']@elenajs\/core["']\s*\)/g, `import("${cdnUrl}")`);

  // Replace CSS Module Script imports with inline CSSStyleSheet construction.
  if (css) {
    result = result.replace(
      /import\s+(\w+)\s+from\s+["']\.\/styles\.css["'](?:\s+(?:with|assert)\s*\{\s*type:\s*["']css["']\s*\})?\s*;?/g,
      `const $1 = (() => { const s = new CSSStyleSheet(); s.replaceSync(${JSON.stringify(css)}); return s; })();`
    );
  }

  return result;
}

/**
 * Download the current playground state as a standalone HTML file.
 */
export function downloadProject(title, js, css, html) {
  const rewrittenJs = rewriteImports(js, css);
  const rewrittenHtml = inlineStylesheetLinks(html, css);
  const cssBlock = css ? `<style>\n${css}\n</style>\n` : "";
  const file = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title || "Elena Component"}</title>
${cssBlock}</head>
<body>
${rewrittenHtml}
<script type="module">
${rewrittenJs}
</script>
</body>
</html>`;

  const slug = (title || "component")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const blob = new Blob([file], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `elena-${slug}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Save editor state for an example to localStorage.
 */
export function saveState(id, { js, css, html }) {
  try {
    localStorage.setItem(`elena-pg:${id}`, JSON.stringify({ js, css, html }));
  } catch {
    // Ignore quota or access errors (e.g. private browsing)
  }
}

/**
 * Load saved editor state for an example from localStorage.
 * Returns null if nothing is saved or the data is invalid.
 */
export function loadState(id) {
  try {
    const raw = localStorage.getItem(`elena-pg:${id}`);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.js === "string" && typeof parsed.html === "string") {
      return { js: parsed.js, css: parsed.css || "", html: parsed.html };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Remove saved editor state for an example from localStorage.
 */
export function clearState(id) {
  try {
    localStorage.removeItem(`elena-pg:${id}`);
  } catch {
    // Ignore access errors
  }
}

/**
 * Build the JSON data string for CodePen's prefill API.
 *
 * Rewrites bare `@elenajs/core` imports to the unpkg CDN URL so the code
 * works standalone in CodePen. JS goes in its own panel with module mode.
 */
export function buildCodePenData(title, js, css, html) {
  const rewrittenJs = rewriteImports(js, css);
  const rewrittenHtml = inlineStylesheetLinks(html, css);

  return JSON.stringify({
    title: `Elena | ${title || "Component"}`,
    html: rewrittenHtml || "",
    css: css || "",
    js: rewrittenJs || "",
    js_module: true,
    editors: "111",
  });
}
