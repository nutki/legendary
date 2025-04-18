const fs = require("fs");
const path = require("path");
const https = require("https");
const sharp = require("sharp");

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
async function downloadBack(name) {
  const url = 'https://raw.githubusercontent.com/LegendarySoloPlay/Legendary-Solo-Play/f1daa5f23a9da2c67da700ce6eb0ec4fc642cd89/Visual%20Assets/CardBack.png';
  const tempFilePath = ".temp.png";
  await downloadImage(url, tempFilePath);

  await sharp(tempFilePath)
    .jpeg({ quality: 80 })
    .toFile(name);

  fs.unlinkSync(tempFilePath);
};
async function downloadCity(name) {
  const url = 'https://cf.geekdo-images.com/gJyZ8n9b6efkP7IeTl_LQg__original/img/KlmV3qEK-dgaY8BjGEwzadhYNMs=/0x0/filters:format(jpeg)/pic1430758.jpg';
  const tempFilePath = ".temp_city.jpg";
  await downloadImage(url, tempFilePath);

  await sharp(tempFilePath)
    .extract({ width: 1057, height: 296, left: 389, top: 675 })
    .png()
    .toFile(name);

  fs.unlinkSync(tempFilePath);
}
function downloadMatrixFont(name) {
  // const url = 'https://raw.githubusercontent.com/ShandalarMagic/Shandalar/868a7c5b0cc373c531197edd0a130c4d36cd7a1d/MatrixBoldSmallCaps.ttf';
  const url = 'https://raw.githubusercontent.com/LegendarySoloPlay/Legendary-Solo-Play/f1daa5f23a9da2c67da700ce6eb0ec4fc642cd89/Fonts/MatrixBoldSmallCaps.otf'
  downloadImage(url, name);
}
function downloadParcolatorFont(name) {
  const url = 'https://raw.githubusercontent.com/LegendarySoloPlay/Legendary-Solo-Play/f1daa5f23a9da2c67da700ce6eb0ec4fc642cd89/Fonts/Percolator.otf';
  console.warn("Percolator expert font is not available, using a placeholder.");
  console.warn("You can download the correct font at https://fontzone.net/font-details/percolator-expert and save as " + name);
  downloadImage(url, name);
}
function downloadSidekick(name) {
  const url = 'https://thecatholicgeeks.com/wp-content/uploads/2016/05/legendary-sidekick.jpg';
  downloadImage(url, name);
}
async function downloadOthers() {
  const file = [
    { name: "images/back.jpg", func: downloadBack },
    { name: "images/cityscape.png", func: downloadCity },
    { name: "images/Secret Wars Volume 1/sidekicks/sidekick.jpg", func: downloadSidekick },
    { name: "fonts/MatrixBoldSmallCaps.ttf", func: downloadMatrixFont },
    { name: "fonts/percolatorexpert.ttf", func: downloadParcolatorFont },
  ];
  for (const entry of file) {
    if (!fs.existsSync(entry.name)) {
      try {
        const dirname = path.dirname(entry.name);
        if (!fs.existsSync(dirname)) {
          fs.mkdirSync(dirname, { recursive: true });
        }
        await entry.func(entry.name);
      } catch (err) {
        console.error(`Failed to process ${entry.name}: ${err.message}`);
      }
    } else {
      console.log(`Skipping ${entry.name}, already exists.`);
    }
  }
}
async function main() {
  if (process.argv.length < 3) {
    console.error("Usage: node downloadimages.js <expansion name>");
    process.exit(1);
  }
  const name = process.argv[2];
  if (name === "Others") {
    await downloadOthers();
    return;
  }
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
