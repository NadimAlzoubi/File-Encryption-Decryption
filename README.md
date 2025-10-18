# 🔐 File Encryption & Decryption

A simple web tool to **encrypt and decrypt files** directly in your browser using the **Web Crypto API (AES-GCM 256-bit)**.  
No uploads, no servers — everything happens locally on your device.

---

## ⚙️ How it works

1. Choose a file and click **Encrypt File**.  
   → The tool will create:
   - `<filename>.enc` — your encrypted file  
   - `<filename>.key` — the secret key (keep it safe)

2. To decrypt:  
   Upload the `.enc` file and its `.key`, then click **Decrypt File**.

---

## 🧩 Tech

- **HTML + CSS + JavaScript**
- **AES-GCM 256-bit encryption**
- 100% client-side, private, and offline.
