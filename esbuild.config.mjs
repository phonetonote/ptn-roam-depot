import esbuild from "esbuild";

const isWatch = process.argv.includes("--watch");

// Map external modules to Roam's global variables
const globals = {
  "react": "window.React",
  "react-dom": "window.ReactDOM",
  "react-dom/client": "window.ReactDOM",
  "@blueprintjs/core": "window.Blueprint.Core",
  "@blueprintjs/select": "window.Blueprint.Select",
  "@blueprintjs/datetime": "window.Blueprint.DateTime",
  "@blueprintjs/popover2": "window.Blueprint.Popover2",
  "chrono-node": "window.RoamLazy.Chrono",
  "marked": "window.RoamLazy.Marked",
  "cytoscape": "window.RoamLazy.Cytoscape",
  "idb": "window.RoamLazy.Idb",
};

// Escape special regex characters in module names
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\/@-]/g, "\\$&");

// Plugin to replace external imports with global references
const roamExternalsPlugin = {
  name: "roam-externals",
  setup(build) {
    Object.keys(globals).forEach((mod) => {
      const filter = new RegExp(`^${escapeRegex(mod)}$`);
      build.onResolve({ filter }, (args) => ({
        path: args.path,
        namespace: "roam-external",
      }));
      build.onLoad({ filter, namespace: "roam-external" }, () => ({
        contents: `module.exports = ${globals[mod]}`,
        loader: "js",
      }));
    });
  },
};

const buildOptions = {
  entryPoints: ["src/index.tsx"],
  bundle: true,
  outfile: "extension.js",
  format: "esm",
  platform: "browser",
  target: "es2020",
  plugins: [roamExternalsPlugin],
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  loader: {
    ".css": "text",
  },
  minify: !isWatch,
  sourcemap: isWatch,
};

if (isWatch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log("Watching for changes...");
} else {
  await esbuild.build(buildOptions);
  console.log("Build complete: extension.js");
}
