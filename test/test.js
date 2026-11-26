const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ganache = require("ganache");
const { ethers } = require("ethers");

(async () => {
  const provider = new ethers.BrowserProvider(ganache.provider({ logging: { quiet: true } }));
  const [deployer, holderA, holderB, stranger] = await Promise.all([0, 1, 2, 3].map((i) => provider.getSigner(i)));
  const load = (n) => JSON.parse(fs.readFileSync(path.join(__dirname, "..", "build", n + ".json"), "utf8"));

  const mockArt = load("MockAgentID");
  const mock = await new ethers.ContractFactory(mockArt.abi, mockArt.bytecode, deployer).deploy();
  await mock.waitForDeployment();

  const regArt = load("TrueAgentRegistry");
  const reg = await new ethers.ContractFactory(regArt.abi, regArt.bytecode, deployer).deploy(await mock.getAddress());
  await reg.waitForDeployment();
  console.log("deployed registry:", await reg.getAddress());

  const A = await holderA.getAddress(), B = await holderB.getAddress(), S = await stranger.getAddress();
  await mock.setBalance(A, 1); await mock.setBalance(B, 1); // stranger stays 0

  let pass = 0, fail = 0;
  const check = async (name, fn) => { try { await fn(); console.log("PASS", name); pass++; } catch (e) { console.log("FAIL", name, "-", e.message); fail++; } };
  const reverts = async (name, txPromise) => check(name, async () => {
    try { await (await txPromise).wait(); } catch { return; } throw new Error("did not revert");
  });

  await check("holder A can pledge", async () => { await (await reg.connect(holderA).pledgeSelfOperated()).wait(); });
  await check("isSelfOperated(A) = true", async () => assert.equal(await reg.isSelfOperated(A), true));
  await check("totalPledged = 1", async () => assert.equal(await reg.totalPledged(), 1n));
  await reverts("stranger cannot pledge (no Agent ID)", reg.connect(stranger).pledgeSelfOperated());
  await reverts("double pledge reverts", reg.connect(holderA).pledgeSelfOperated());
  await check("holder B pledges", async () => { await (await reg.connect(holderB).pledgeSelfOperated()).wait(); });
  await check("B endorses A", async () => { await (await reg.connect(holderB).endorse(A)).wait(); });
  await check("A endorsement count = 1", async () => { const p = await reg.pledgeOf(A); assert.equal(p[2], 1); });
  await reverts("self-endorse reverts", reg.connect(holderA).endorse(A));
  await reverts("double endorse reverts", reg.connect(holderB).endorse(A));
  await reverts("stranger cannot endorse", reg.connect(stranger).endorse(A));
  await check("A revokes pledge", async () => { await (await reg.connect(holderA).revokePledge()).wait(); });
  await check("isSelfOperated(A) = false after revoke", async () => assert.equal(await reg.isSelfOperated(A), false));
  await check("totalPledged back to 1 (only B)", async () => assert.equal(await reg.totalPledged(), 1n));
  await check("losing Agent ID kills the signal even if pledged", async () => {
    await mock.setBalance(B, 0); assert.equal(await reg.isSelfOperated(B), false); await mock.setBalance(B, 1);
  });
  await check("no payable / no owner surface", async () => {
    const names = regArt.abi.filter((x) => x.type === "function").map((x) => x.name);
    assert.ok(!names.includes("owner") && !names.includes("withdraw") && !names.includes("pause"));
    assert.ok(regArt.abi.filter((x) => x.type === "function").every((x) => x.stateMutability !== "payable"));
  });

  console.log(`\nRESULT: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
