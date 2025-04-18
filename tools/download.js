const fs = require("fs");
const path = require("path");
const https = require("https");

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(filepath);
    https
      .get(url, (response) => {
        if (response.statusCode === 200) {
          response.pipe(fileStream);
          fileStream.on("finish", () => {
            fileStream.close(resolve);
          });
        } else {
          reject(new Error(`Failed to fetch ${url}: ${response.statusCode}`));
        }
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}
async function main() {
  if (process.argv.length < 3) {
    console.error("Usage: node downloadimages.js <expansion name>");
    process.exit(1);
  }
  const name = process.argv[2];
  const manifestPath = path.join("images", name, "image_manifest.txt");
  if (!fs.existsSync(manifestPath)) {
    console.error(`Manifest file not found: ${manifestPath}`);
    process.exit(1);
  }
  const manifestContests = fs.readFileSync(manifestPath, "utf8");
  const manifestLines = manifestContests.trim().split("\n");
  for (const line of manifestLines) {
    const [uuid, filename] = line.split(" ");
    if (!uuid || !filename) {
      console.error(`Invalid line in manifest: ${line}`);
      return;
    }
    const url = `https://images.squarespace-cdn.com/content/v1/6246263c0f3d2738d79c971c/${uuid}/image.jpg`;
    const filepath = path.join("images", name, filename);
    if (fs.existsSync(filepath)) {
      console.log(`Skipping ${filename}, already exists.`);
      continue;
    }
    try {
      const dirname = path.dirname(filepath);
      if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
      }
      console.log(`Downloading ${filename}`);
      await downloadImage(url, filepath);
    } catch (err) {
      console.error(`Failed to download ${filename}: ${err.message}`);
    }
  }
}
main();
