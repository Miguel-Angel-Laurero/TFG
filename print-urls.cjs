const waitOn = require("wait-on");

waitOn(
  {
    resources: ["tcp:localhost:3000", "tcp:localhost:5173"],
    timeout: 30000,
  },
  (err) => {
    if (err) return;
    console.log("\n");
    console.log("\x1b[32m  ✅ Servidores listos!\x1b[0m");
    console.log("\x1b[35m  Frontend : http://localhost:5173\x1b[0m");
    console.log("\x1b[36m  Backend  : http://localhost:3000\x1b[0m");
    console.log("\n");
  },
);
