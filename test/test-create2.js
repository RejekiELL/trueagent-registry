const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ganache = require("ganache");
const { ethers } = require("ethers");

(async () => {
  const solc = require("solc");
  const root = path.join(__dirname, "..");
  const src = fs.readFileSync(path.join(root, "contracts/MockFactory.sol"), "utf8");
  const input = { language: "Solidity", sources: { "MockFactory.sol": { content: src } },
    settings: { optimizer: { enabled: true, runs: 200 }, outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } } } };
  const out = JSON.parse(solc.compile(JSON.stringify(input)));
  const mf = out.contracts["MockFactory.sol"].MockFactory;

  const provider = new ethers.BrowserProvider(ganache.provider({ logging: { quiet: true } }));
  const deployer = await provider.getSigner(0);
  const holder = await provider.getSigner(1);
  const load = (n) => JSON.parse(fs.readFileSync(path.join(root, "build", n + ".json"), "utf8"));

  const mock = await new ethers.ContractFactory(load("MockAgentID").abi, load("MockAgentID").bytecode, deployer).deploy();
  await mock.waitForDeployment();
  const factory = await new ethers.ContractFactory(mf.abi, "0x" + mf.evm.bytecode.object, deployer).deploy();
  await factory.waitForDeployment();

  const regArt = load("TrueAgentRegistry");
  const initCode = ethers.concat([regArt.bytecode, ethers.AbiCoder.defaultAbiCoder().encode(["address"], [await mock.getAddress()])]);
  const salt = ethers.keccak256(ethers.toUtf8Bytes("TrueAgentRegistry.v1"));
  const predicted = ethers.getCreate2Address(await factory.getAddress(), salt, ethers.keccak256(initCode));
  const tx = await factory.deploy(initCode, salt);
  const rc = await tx.wait();
  console.log("deploy gas used:", rc.gasUsed.toString());
  const code = await provider.getCode(predicted);
  assert.ok(code.length > 2, "no code at predicted address");
  const reg = new ethers.Contract(predicted, regArt.abi, holder);
  const H = await holder.getAddress();
  await mock.setBalance(H, 1);
  await (await reg.pledgeSelfOperated()).wait();
  assert.equal(await reg.isSelfOperated(H), true);
  console.log("PASS create2 deploy at predicted address:", predicted);
  console.log("PASS pledge works on create2-deployed registry");
})().catch((e) => { console.error(e); process.exit(1); });
