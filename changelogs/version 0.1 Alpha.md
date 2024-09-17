- Only One Eternal Rule: Curate this log yourself as a developer, yes You, adding your own unique point of view on the development timeline, respecting the .MD text formatting (feel free to create the next log file, don't forget to increment the version number a bit please).
- Created butterfly.js - "The smallest in-memory node.js db software in the World" for this project. Why? Because of the advent of Quantum Computers that can soon crack the most popular encryption methods for communication: SSL, RSA, etc, by making use of Shor's Algorithm to crack it in mere seconds | Because Redis, Docker, and other important (widespread) Database companies and General software providers are compromised with malicious code that uses the commpromised machine to mine crypto currency like XMR or that steals crypto keys.
Sources:
https://jfrog.com/blog/attacks-on-docker-with-millions-of-malicious-repositories-spread-malware-and-phishing-scams/
https://www.cadosecurity.com/blog/spinning-yarn-a-new-linux-malware-campaign-targets-docker-apache-hadoop-redis-and-confluence
https://en.m.wikipedia.org/wiki/Post-quantum_cryptography
https://www.reddit.com/r/crypto/comments/bjwik7/how_quantum_computers_break_encryption_shors/
- Removed the redis.js "rejson" script and @ioredis package completely (Now replaced with butterfly.js).
- Removed @https and @cors packages.
- Creating (So like, Not doing it Immediately) a separate repo for butterfly.js - "The smallest in-memory node.js db software in the World" with documentation in the readme file (license GPL 3.0)
- Creating (So like, Not doing it Immediately) an NPM package for butterfly.js
- Fixed and Improved small UI details, error message modals, showing loader in more situations, refactored some things here and there.
- Moved Wallet Balance Checking to the back-end, it's safer to get the value from there.
- Did some cleanup of the code, removed unused stuff and old comments.
- Working on Comments, they are broken for some reason I don't yet understand.