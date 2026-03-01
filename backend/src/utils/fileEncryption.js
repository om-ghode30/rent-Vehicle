const crypto = require("crypto");
const fs = require("fs");

const algorithm = "aes-256-cbc";
const secretKey = crypto
  .createHash("sha256")
  .update(process.env.JWT_SECRET)
  .digest();

function encryptFile(inputPath, outputPath) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  const input = fs.readFileSync(inputPath);
  const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);

  // Save IV + encrypted content
  const finalData = Buffer.concat([iv, encrypted]);

  fs.writeFileSync(outputPath, finalData);
  fs.unlinkSync(inputPath); // delete original
}

function decryptFile(inputPath) {
  const fileData = fs.readFileSync(inputPath);

  const iv = fileData.slice(0, 16);
  const encryptedData = fileData.slice(16);

  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);

  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final()
  ]);

  return decrypted;
}

module.exports = { encryptFile, decryptFile };