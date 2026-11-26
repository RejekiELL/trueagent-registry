const fs = require("fs");
const path = require("path");
const solc = require("solc");

const root = path.join(__dirname, "..");
const sources = {
  "TrueAgentRegistry.sol": { content: fs.readFileSync(path.join(root, "contracts/TrueAgentRegistry.sol"), "utf8") },
  "MockAgentID.sol": { content: fs.readFileSync(path.join(root, "contracts/MockAgentID.sol"), "utf8") },
};
const input = {
  language: "Solidity",
  sources,
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object", "evm.gasEstimates"] } },
  },
};
const out = JSON.parse(solc.compile(JSON.stringify(input)));
if (out.errors) {
  for (const e of out.errors) {
    console.log(e.severity.toUpperCase(), e.formattedMessage);
    if (e.severity === "error") process.exitCode = 1;
  }
}
if (process.exitCode) process.exit(1);
fs.mkdirSync(path.join(root, "build"), { recursive: true });
for (const name of ["TrueAgentRegistry", "MockAgentID"]) {
  const c = out.contracts[name + ".sol"][name];
  fs.writeFileSync(path.join(root, "build", name + ".json"), JSON.stringify({ abi: c.abi, bytecode: "0x" + c.evm.bytecode.object, gasEstimates: c.evm.gasEstimates }, null, 2));
  console.log(name, "bytecode bytes:", c.evm.bytecode.object.length / 2, "creation gas est:", c.evm.gasEstimates?.creation?.executionCost);
}
