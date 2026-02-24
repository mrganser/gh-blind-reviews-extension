const fs = require("fs");
const path = require("path");

const type = process.argv[2];
if (!["patch", "minor", "major"].includes(type)) {
  console.error("Usage: node scripts/bump.js <patch|minor|major>");
  process.exit(1);
}

const pkgPath = path.join(__dirname, "../package.json");
const manifestPath = path.join(__dirname, "../src/manifest.json");

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const [major, minor, patch] = pkg.version.split(".").map(Number);
const next = {
  major: `${major + 1}.0.0`,
  minor: `${major}.${minor + 1}.0`,
  patch: `${major}.${minor}.${patch + 1}`,
}[type];

pkg.version = next;
manifest.version = next;

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

console.log(`Bumped ${type}: ${next}`);
