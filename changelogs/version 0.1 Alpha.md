# Changelog v0.1 🦋

> _"Only One Eternal Rule: Curate this log yourself as a developer, yes You, adding your own unique point of view on the development timeline, respecting the .MD text formatting (just use chatGPT with this prompt formula: "Format this changelog with creative .MD formatting, reply only with the code")."_

## 🌟 Highlights

- **Created `butterfly.js`** - Introducing: "The smallest in-memory Node.js DB software in the World." 🦋 Why did we embark on this seemingly small but mighty journey?  
  - 🌌 Because **Quantum Computers** are on the horizon, ready to **shatter** our most popular encryption methods (like SSL, RSA, etc.) using Shor's Algorithm. Just imagine: cracking codes in mere seconds! 
  - 🔍 Because **Redis, Docker, and other widespread Database solutions** might already be compromised! 🕵️‍♂️ 🚨 Malicious code is spreading like wildfire, mining cryptocurrency, or stealing precious crypto keys.  
    - **Sources:**
      - [JFrog Blog on Malicious Docker Repositories](https://jfrog.com/blog/attacks-on-docker-with-millions-of-malicious-repositories-spread-malware-and-phishing-scams/)
      - [CADo Security: New Linux Malware Campaign](https://www.cadosecurity.com/blog/spinning-yarn-a-new-linux-malware-campaign-targets-docker-apache-hadoop-redis-and-confluence)
      - [Wikipedia: Post-Quantum Cryptography](https://en.m.wikipedia.org/wiki/Post-quantum_cryptography)
      - [Reddit: How Quantum Computers Break Encryption](https://www.reddit.com/r/crypto/comments/bjwik7/how_quantum_computers_break_encryption_shors/)

- **Removed** `redis.js "rejson"` script and `@ioredis` package – we’ve waved goodbye to these old pals and replaced them with the sleeker, lighter `butterfly.js`. ✌️

- **Removed** `@https` and `@cors` packages – because who needs extra baggage?

## ✍️ Upcoming Adventures

- **Creating (soon, not just yet)** a separate repo for `butterfly.js` – "The smallest in-memory Node.js DB software in the World" complete with documentation in the README file.  
  - License: **GPL 3.0**

- **Creating (eventually, but it’s on the radar)** an NPM package for `butterfly.js`. 📦

## 🔧 Improvements & Fixes

- **Enhanced UI Details**: Tweaked and improved error message modals and added loading indicators for more situations. Minor refactoring sprinkled throughout. ✨

- **Moved Wallet Balance Checking to the Back-end** – It's safer there. Trust us. 🔐

- **Code Cleanup**: Removed the cruft – unused code, outdated comments, and general untidiness be gone!

## 🛠️ Work in Progress

- **Comments are Broken** – and we don't yet know why. It's like a mystery novel, and we're still reading Chapter One… 🔍

---

## 🎨 Additional Changes

- **Username Magic!** 🪄 The username in the index page posts now scales to **2x** when hovering. Ready to show off those names in style!

- **Simplified Filenames:** Changed butterfly index file names from `index_${index}.txt` to `${index}.txt` for easier management.

- **Cleaned Up Node Packages**: Now running the latest Node with **zero security issues** (woohoo!) and just one pesky deprecation warning: _"The `punycode` module is deprecated"_. Who even uses that anymore, right?

  - **Pro Tip**: Use `npm run go` to suppress the warning or go all out with:  
  `"node --no-deprecation app.js"`

- **Error Modals Overhaul**: Moved error modals as `overlayMSG` in `utilities.ts`. Updated front-end errors for bans and other critical actions. No more confusion, just clarity!

- **Improved Error Handling & UI**: Polished up error handling throughout. The UI got some love too, with smoother transitions and better feedback.

- **Flexible Profile Updates**: You can now update your username and avatar independently! No more “all-or-nothing” – choose your updates freely.

- **Username Uniqueness Check**: Added robust checks for username uniqueness. If the username is already taken or forbidden, you’ll know. Otherwise, it’s all yours!

---

**Next Version?** Sure thing, but remember to bump that version number up just a little next time. 😉  
Stay tuned for more exciting updates, coming your way soon! 🚀
