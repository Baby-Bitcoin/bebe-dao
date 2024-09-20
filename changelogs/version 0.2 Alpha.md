# Changelog v0.2 🦋

> _"Only One Eternal Rule: Curate this log yourself as a developer, yes You, adding your own unique point of view on the development timeline, respecting the .MD text formatting (just use chatGPT with this prompt formula: "Format this changelog with creative .MD formatting, reply only with the code")."_

## 🛠️ Work in Progress

- **Fixed commenting, but replies are still broken** – After this we might be ready for 0.2v and another attempt at public testing.

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
