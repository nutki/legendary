const fs = require("fs");
const path = require("path");

function findManifestFiles(dir) {
  const manifestFiles = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      manifestFiles.push(...findManifestFiles(fullPath));
    } else if (entry.isFile() && entry.name === "image_manifest.txt") {
      manifestFiles.push(fullPath);
    }
  }

  return manifestFiles;
}

function compareFiles(manifestPath) {
  const manifestDir = path.dirname(manifestPath);
  const expectedFiles = fs
    .readFileSync(manifestPath, "utf-8")
    .split("\n")
    .map((line) => line.replace(/^.* /, "").trim())
    .filter((line) => line.length > 0);

  const actualFiles = fs
    .readdirSync(manifestDir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? fs
            .readdirSync(path.join(manifestDir, entry.name))
            .map((subFile) => path.join(entry.name, subFile))
        : entry.name
    )
    .filter((file) => file.endsWith(".jpg"));

  const missingFiles = expectedFiles.filter(
    (file) => !actualFiles.includes(file)
  );
  const extraFiles = actualFiles.filter(
    (file) => !expectedFiles.includes(file)
  );

  console.log(`\nIn directory: ${manifestDir}`);
  if (missingFiles.length > 0) {
    console.log("Missing files:");
    missingFiles.forEach((file) => console.log(`  ${file}`));
  }

  if (extraFiles.length > 0) {
    console.log("Extra files:");
    extraFiles.forEach((file) => console.log(`  ${file}`));
  }
}

findManifestFiles("images").forEach(compareFiles);
