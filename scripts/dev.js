const { spawn } = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const commands = [
  {
    name: "backend",
    cwd: path.join(root, "backend"),
    args: ["run", "dev"],
  },
  {
    name: "frontend",
    cwd: path.join(root, "frontend"),
    args: ["run", "dev"],
  },
];

const children = commands.map(({ name, cwd, args }) => {
  const child = spawn(npmCommand, args, {
    cwd,
    stdio: "inherit",
    shell: false,
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      console.log(`${name} exited with signal ${signal}`);
      return;
    }

    if (code && code !== 0) {
      console.error(`${name} exited with code ${code}`);
      shutdown(code);
    }
  });

  return child;
});

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill();
  }

  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
