function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function encryptFile() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (!file) return alert("Please select a file to encrypt.");

  const fileData = await file.arrayBuffer();

  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);

  const exportedKey = await crypto.subtle.exportKey("raw", key);
  const base64Key = arrayBufferToBase64(exportedKey);

  const keyBlob = new Blob([base64Key], { type: "text/plain" });
  const keyFile = new File([keyBlob], `${file.name}.key`);
  const keyLink = document.getElementById("downloadKey");
  keyLink.href = URL.createObjectURL(keyFile);
  keyLink.download = keyFile.name;
  keyLink.style.display = "block";

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedData = await crypto.subtle.encrypt({ name: "AES-GCM", iv, tagLength: 128 }, key, fileData);

  const combinedData = new Uint8Array(iv.byteLength + encryptedData.byteLength);
  combinedData.set(iv);
  combinedData.set(new Uint8Array(encryptedData), iv.byteLength);

  const encryptedBlob = new Blob([combinedData], { type: "application/x-binary" });
  const encryptedFile = new File([encryptedBlob], `${file.name}.enc`, { type: "application/x-binary" });

  const downloadLink = document.getElementById("downloadEncrypted");
  downloadLink.href = URL.createObjectURL(encryptedFile);
  downloadLink.download = encryptedFile.name;
  downloadLink.style.display = "block";

  alert("✅ Encryption successful.\nDownload the key and encrypted file now.");
}

async function decryptFile() {
  const fileInput = document.getElementById("encryptedFileInput");
  const keyFileInput = document.getElementById("keyFileInput");
  const file = fileInput.files[0];
  const keyFile = keyFileInput.files[0];

  if (!file || !keyFile) return alert("Please select the encrypted file and key file.");

  const keyText = await keyFile.text();
  const keyBuffer = base64ToArrayBuffer(keyText.trim());

  const key = await crypto.subtle.importKey("raw", keyBuffer, { name: "AES-GCM" }, false, ["decrypt"]);

  const fileData = await file.arrayBuffer();
  const iv = new Uint8Array(fileData.slice(0, 12));
  const encryptedContent = fileData.slice(12);

  try {
    const decryptedData = await crypto.subtle.decrypt({ name: "AES-GCM", iv, tagLength: 128 }, key, encryptedContent);

    const decryptedBlob = new Blob([decryptedData]);
    const decryptedFile = new File([decryptedBlob], file.name.replace(/\.enc$/, ""));
    const downloadLink = document.getElementById("downloadDecrypted");
    downloadLink.href = URL.createObjectURL(decryptedFile);
    downloadLink.download = decryptedFile.name;
    downloadLink.style.display = "block";

    alert("✅ Decryption successful.");
  } catch (e) {
    console.error(e);
    alert("❌ Decryption failed. Please check the key and file.");
  }
}

const MAX_SIZE = 300 * 1024 * 1024; // 300MB

function formatMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(1);
}

document.getElementById("fileInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file && file.size > MAX_SIZE) {
    alert(`⚠️ The file "${file.name}" is too large (${formatMB(file.size)} MB).\nMaximum allowed size is ${formatMB(MAX_SIZE)} MB.`);
    e.target.value = "";
  }
});

document.getElementById("encryptedFileInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file && file.size > MAX_SIZE) {
    alert(`⚠️ The encrypted file "${file.name}" is too large (${formatMB(file.size)} MB).\nMaximum allowed size is ${formatMB(MAX_SIZE)} MB.`);
    e.target.value = "";
  }
});
