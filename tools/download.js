const fs = require("fs");
const path = require("path");
const https = require("https");
const sharp = require("sharp");

let baseDir = path.resolve(__dirname, "..");

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
  const tempFilePath = path.join(baseDir, ".temp.png");
  await downloadImage(url, tempFilePath);

  await sharp(tempFilePath)
    .jpeg({ quality: 80 })
    .toFile(path.join(baseDir, name));

  fs.unlinkSync(tempFilePath);
}
async function downloadBabyHope(name) {
  const url = 'https://cf.geekdo-images.com/8NfNlZem7zNAcSkVpmrPpw__original/img/hO41KhqmTaggcPnX5AR5WSNMbdg=/0x0/filters:format(png)/pic8032301.png';
  const tempFilePath = path.join(baseDir, ".temp.png");
  await downloadImage(url, tempFilePath);
  await sharp(tempFilePath).jpeg({ quality: 80 }).toFile(path.join(baseDir, name));
}

async function downloadCity(name) {
  const url = 'https://cf.geekdo-images.com/gJyZ8n9b6efkP7IeTl_LQg__original/img/KlmV3qEK-dgaY8BjGEwzadhYNMs=/0x0/filters:format(jpeg)/pic1430758.jpg';
  const tempFilePath = path.join(baseDir, ".temp_city.jpg");
  await downloadImage(url, tempFilePath);

  await sharp(tempFilePath)
    .extract({ width: 1057, height: 296, left: 389, top: 675 })
    .png()
    .toFile(path.join(baseDir, name));

  fs.unlinkSync(tempFilePath);
}

function downloadMatrixFont(name) {
  const url = 'https://raw.githubusercontent.com/LegendarySoloPlay/Legendary-Solo-Play/f1daa5f23a9da2c67da700ce6eb0ec4fc642cd89/Fonts/MatrixBoldSmallCaps.otf';
  downloadImage(url, path.join(baseDir, name));
}

function downloadParcolatorFont(name) {
  // const url = 'https://db.onlinewebfonts.com/t/c89bbcb900554090a06a5dadaa54ace3.ttf'
  const url = 'https://raw.githubusercontent.com/LegendarySoloPlay/Legendary-Solo-Play/f1daa5f23a9da2c67da700ce6eb0ec4fc642cd89/Fonts/Percolator.otf';
  console.warn("Percolator expert font is not available, using a placeholder.");
  console.warn("You can download the correct font at https://fontzone.net/font-details/percolator-expert and save as " + name);
  downloadImage(url, path.join(baseDir, name));
}

function downloadSidekick(name) {
  const url = 'https://thecatholicgeeks.com/wp-content/uploads/2016/05/legendary-sidekick.jpg';
  downloadImage(url, path.join(baseDir, name));
}

async function downloadOthers(progressCallback) {
  const file = [
    { name: "images/back.jpg", func: downloadBack },
    { name: "images/cityscape.png", func: downloadCity },
    { name: "images/secret_wars_volume_1/sidekicks/sidekick.jpg", func: downloadSidekick },
    { name: "fonts/MatrixBoldSmallCaps.ttf", func: downloadMatrixFont },
    { name: "fonts/percolatorexpert.ttf", func: downloadParcolatorFont },
    { name: "images/dark_city/tokens/baby_hope.jpg", func: downloadBabyHope },
  ];
  progressCallback?.(0, file.length);
  let count = 0;
  for (const entry of file) {
    const fullPath = path.join(baseDir, entry.name);
    if (!fs.existsSync(fullPath)) {
      try {
        const dirname = path.dirname(fullPath);
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
    progressCallback?.(++count, file.length);
  }
}

async function main(name, baseDirOverride, progressCallback) {
  if (baseDirOverride) {
    baseDir = path.resolve(baseDirOverride);
  }
  if (name === "Others") {
    await downloadOthers(progressCallback);
    return;
  }
  const manifestPath = path.join(baseDir, "images", name, "image_manifest.txt");
  if (!fs.existsSync(manifestPath)) {
    console.error(`Manifest file not found: ${manifestPath}`);
    process.exit(1);
  }
  const manifestContests = fs.readFileSync(manifestPath, "utf8");
  const manifestLines = manifestContests.trim().split("\n");
  progressCallback?.(0, manifestLines.length);
  let count = 0;
  manifestLines.shift();
  for (const line of manifestLines) {
    const [uuid, filename] = line.split(" ");
    if (!uuid || !filename) {
      console.error(`Invalid line in manifest: ${line}`);
      return;
    }
    const url = `https://images.squarespace-cdn.com/content/v1/6246263c0f3d2738d79c971c/${uuid}/image.jpg`;
    const filepath = path.join(baseDir, "images", name, filename);
    if (fs.existsSync(filepath)) {
      progressCallback?.(++count, manifestLines.length);
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
    progressCallback?.(++count, manifestLines.length);
  }
}
function getAssestGroups(baseDirOverride) {
  const imagesDir = path.join(baseDirOverride || baseDir, "images");
  if (!fs.existsSync(imagesDir)) return [];
  return fs.readdirSync(imagesDir).filter((name) => fs.existsSync(path.join(imagesDir, name, "image_manifest.txt")));
}
function checkAssets(baseDirOverride, progressCallback) {
  const imagesDir = path.join(baseDirOverride || baseDir, "images");
  if (!fs.existsSync(imagesDir)) return [];
  const assetGroups = fs.readdirSync(imagesDir).filter((name) => fs.existsSync(path.join(imagesDir, name, "image_manifest.txt")));
  const missingAssets = {};
  progressCallback?.(0, assetGroups.length);
  let count = 0;
  for (const group of assetGroups) {
    const manifestPath = path.join(imagesDir, group, "image_manifest.txt");
    const manifestContests = fs.readFileSync(manifestPath, "utf8");
    const manifestLines = manifestContests.trim().split("\n");
    const name = manifestLines.shift()
    missingAssets[group] = { name, missing: 0, total: manifestLines.length };
    for (const line of manifestLines) {
      const [uuid, filename] = line.split(" ");
      if (!uuid || !filename) {
        console.error(`Invalid line in manifest: ${line}`);
        continue;
      }
      const filepath = path.join(imagesDir, group, filename);
      if (!fs.existsSync(filepath)) {
        missingAssets[group].missing++;
      }
    }
    progressCallback?.(++count, assetGroups.length);
  }
  return missingAssets;
}
if (require.main === module) {
  if (process.argv.length < 3) {
    console.error("Usage: node downloadimages.js [list|<expansion name>]");
    process.exit(1);
  }
  const name = process.argv[2];
  if (name === "list") {
    const assetGroups = checkAssets();
    console.log("Available asset groups:");
    for (const group of Object.keys(assetGroups)) {
      const g = assetGroups[group];
      console.log(`- ${group}` + (g.missing ? g.missing < g.total ? " (partial)" : "" : " (complete)"));
    }
    process.exit(0);
  }
  main(name);
} else {
  module.exports = {
    main,
    getAssestGroups,
    checkAssets,
  };
}
