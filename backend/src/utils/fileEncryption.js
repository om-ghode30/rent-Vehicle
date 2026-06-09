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

async function encryptAndUploadFile(inputPath,fileName) {

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm,secretKey,iv);

  // read original file
  const input = fs.readFileSync(inputPath);

  // encrypt
  const encrypted = Buffer.concat([cipher.update(input),cipher.final()]);

  // prepend IV
  const finalData = Buffer.concat([iv,encrypted]);

  // temp encrypted file
  const tempEncrypted = `${inputPath}.enc`;

  fs.writeFileSync(
    tempEncrypted,
    finalData
  );

  // upload
  const result =
    await cloudinary.uploader.upload(
      tempEncrypted,
      {
        resource_type: "raw",
        public_id:
          `rental-vehicle/${fileName}`,
        overwrite: true
      }
    );

  // cleanup
  fs.unlinkSync(inputPath);
  fs.unlinkSync(tempEncrypted);

  // RETURN URL
  return {
    secure_url: result.secure_url,
    public_id: result.public_id
  };
}

async function downloadAndDecryptFile(fileUrl) {

  const response = await fetch(fileUrl);
  if (!response.ok) {
    const err = new Error("FILE_NOT_FOUND");
    err.status = 404;
    throw err;
  }

  // file buffer
  const fileData = Buffer.from(
    await response.arrayBuffer()
  );

  // IV
  const iv = fileData.slice(0, 16);

  // encrypted data
  const encryptedData = fileData.slice(16);

  // decrypt
  const decipher = crypto.createDecipheriv(algorithm,secretKey,iv);

  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final()
  ]);

  return decrypted;
}

module.exports = { encryptFile, decryptFile, encryptAndUploadFile, downloadAndDecryptFile };