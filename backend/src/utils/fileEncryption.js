const crypto = require("crypto");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");

const algorithm = "aes-256-cbc";
const secretKey = crypto
  .createHash("sha256")
  .update(process.env.JWT_SECRET)
  .digest();

async function encryptFile(inputPath, outputPath) {
  console.log("input ",inputPath," ooutput ",outputPath);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  
  const input = fs.readFileSync(inputPath);
  console.log("file length before ",input.length);
  const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);

  // Save IV + encrypted content
  const finalData = Buffer.concat([iv, encrypted]);
  console.log("file length after ",finalData.length);
  const tempEncrypted = `${inputPath}.enc`;
  console.log("sending starting")
  fs.writeFileSync(tempEncrypted, finalData);
  console.log("Temp file:", tempEncrypted);
  console.log("File exists:", fs.existsSync(tempEncrypted));
  const result=await cloudinary.uploader.upload(tempEncrypted, {
    resource_type: "raw",
    public_id: `rental-vehicle/${outputPath}`,
    overwrite: true
  });
  console.log("sending complete ",result.public_id);
  fs.unlinkSync(inputPath);
  fs.unlinkSync(tempEncrypted);
}

async function decryptFile(publicPath) {
  try {
    console.log(publicPath);
  const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/rental-vehicle/${publicPath}.enc`;

  const response = await fetch(url);
  if (!response.ok) {
      const err = new Error("FILE_NOT_FOUND");
      err.status = 404;
      throw err;
    }
    
  const fileData = Buffer.from(await response.arrayBuffer());
    console.log("file before decryption length ",fileData.length);
  const iv = fileData.slice(0, 16);
  const encryptedData = fileData.slice(16);
console.log("IV length:", iv.length);
console.log("Encrypted length:", encryptedData.length);

const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final()
  ]);

console.log("Decrypted length:",decrypted.length);

  return decrypted;
}catch (error) {
    throw error;
  }
}

module.exports = { encryptFile, decryptFile };