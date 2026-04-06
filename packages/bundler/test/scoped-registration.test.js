import { spawnSync } from "child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { beforeAll, afterAll, describe, test, expect } from "vitest";
import { CLI, COMPONENTS_SRC, setupBuild } from "./helpers.mjs";

describe('registration: "scoped"', () => {
  let tmpDir;
  let dist;

  beforeAll(() => {
    ({ tmpDir, dist } = setupBuild(`export default { registration: "scoped", analyze: false };`));
  });

  afterAll(() => {
    if (tmpDir) {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  describe("stripped output", () => {
    test("individual modules do not contain .define() calls", () => {
      const button = readFileSync(join(dist, "button.js"), "utf8");
      expect(button).not.toMatch(/\.define\(\)/);
    });

    test("individual modules do not contain component side-effect imports", () => {
      const button = readFileSync(join(dist, "button.js"), "utf8");
      const bareImports = button.match(/^\s*import\s+["'][^"']+["']\s*;/gm);
      expect(bareImports).toBeNull();
    });

    test("bundle.js does not contain .define() calls", () => {
      const bundle = readFileSync(join(dist, "bundle.js"), "utf8");
      expect(bundle).not.toMatch(/\.define\(\)/);
    });
  });

  describe("register.js", () => {
    test("register.js is generated", () => {
      expect(existsSync(join(dist, "register.js"))).toBe(true);
    });

    test("register.js exports defineAll function", () => {
      const register = readFileSync(join(dist, "register.js"), "utf8");
      expect(register).toContain("export function defineAll(registry)");
    });

    test("register.js imports component classes", () => {
      const register = readFileSync(join(dist, "register.js"), "utf8");
      expect(register).toContain("Button");
      expect(register).toContain("Spinner");
      expect(register).toContain("Stack");
    });

    test("register.js re-exports component classes", () => {
      const register = readFileSync(join(dist, "register.js"), "utf8");
      expect(register).toMatch(/export\s*\{/);
    });

    test("defineAll calls .define(registry) for each component", () => {
      const register = readFileSync(join(dist, "register.js"), "utf8");
      expect(register).toContain(".define(registry)");
    });
  });

  describe("build output still works", () => {
    test("individual modules exist", () => {
      expect(existsSync(join(dist, "button.js"))).toBe(true);
      expect(existsSync(join(dist, "stack.js"))).toBe(true);
    });

    test("bundle.js exists", () => {
      expect(existsSync(join(dist, "bundle.js"))).toBe(true);
    });

    test("CSS files are still generated", () => {
      expect(existsSync(join(dist, "button.css"))).toBe(true);
      expect(existsSync(join(dist, "bundle.css"))).toBe(true);
    });
  });
});

describe("scoped registration preserves non-component side-effect imports", () => {
  let tmpDir;
  let dist;

  beforeAll(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "elena-bundler-test-"));
    dist = join(tmpDir, "dist");

    cpSync(COMPONENTS_SRC, join(tmpDir, "src"), { recursive: true });
    writeFileSync(
      join(tmpDir, "package.json"),
      JSON.stringify({ name: "test-components", type: "module" })
    );
    writeFileSync(
      join(tmpDir, "elena.config.mjs"),
      `export default { registration: "scoped", analyze: false };`
    );

    // Add a non-component module with a side effect (no .define() call).
    writeFileSync(join(tmpDir, "src", "setup.js"), `globalThis.__ELENA_SETUP__ = true;\n`);

    // Import it as a bare side-effect import from the index.
    const indexPath = join(tmpDir, "src", "index.js");
    const indexContent = readFileSync(indexPath, "utf8");
    writeFileSync(indexPath, `import "./setup.js";\n${indexContent}`);

    const result = spawnSync("node", [CLI], {
      cwd: tmpDir,
      stdio: "pipe",
      encoding: "utf8",
    });

    if (result.status !== 0) {
      throw new Error(
        `elena exited with status ${result.status}:\n${result.stderr || result.stdout}`
      );
    }
  });

  afterAll(() => {
    if (tmpDir) {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test("non-component side-effect import is preserved in the output", () => {
    const index = readFileSync(join(dist, "index.js"), "utf8");
    expect(index).toContain("./setup.js");
  });

  test("non-component module content is not corrupted", () => {
    const setup = readFileSync(join(dist, "setup.js"), "utf8");
    expect(setup).toContain("__ELENA_SETUP__");
  });

  test("component .define() calls are still stripped", () => {
    const button = readFileSync(join(dist, "button.js"), "utf8");
    expect(button).not.toMatch(/\.define\(\)/);
  });
});
