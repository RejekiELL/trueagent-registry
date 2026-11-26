# TrueAgent Registry — Proof of Self-Operation for Agent ID Holders

**Binance Agent ID Hackathon submission (BNB Chain).**

## The problem nobody in this ecosystem is solving

Agent IDs are being **rented out**. Public offers circulate in the community:
*"Lend an Agent ID, earn ~1.9 USDT"* — claim an ID, hand a stranger a pairing
code with Developer Mode on, and let them operate your wallet. The renter then
farms Agent-ID-gated launches (per-ID free quotas, exclusive bonding curves)
with someone else's KYC-backed identity, in seconds, and sweeps the proceeds
out through pre-set approvals.

Every gated launch in this ecosystem allocates by **"does this address hold an
Agent ID?"** That check proves an identity *exists*. It says nothing about
**who operates it**. Rented-ID farming is invisible to the current gate.

## The product

TrueAgent is a public, voluntary **proof-of-self-operation registry**:

1. An Agent ID holder calls `pledgeSelfOperated()` — an on-chain pledge:
   *"I operate this Agent ID myself; it is not rented or lent."*
2. Other holders call `endorse(operator)` to vouch for operators they trust
   (holders only, never self, once per pair).
3. Any project queries **one view function** before allocating a per-ID quota:

```solidity
TrueAgentRegistry.isSelfOperated(address) → bool
```

It returns `true` only while the pledge is active **and** the address still
holds its Agent ID — lose the ID, lose the signal. Revoking a pledge is also
public: transparency cuts both ways.

## Why this is NOT another gated mint / badge / launchpad

The Agent ID ecosystem already has plenty of those — gated NFT mints, identity
cards, driver's-license NFTs, Agent-ID-exclusive bonding curves. TrueAgent
sells nothing, mints nothing, and gates nothing of its own. It is the missing
**trust layer underneath all of them**: infrastructure that the existing gated
projects can integrate with a single call to protect their allocations from
rented identities.

| | Gated mints / badges | Agent-ID launchpads | **TrueAgent** |
|---|---|---|---|
| Gives user an asset | Yes (NFT/token) | Yes (token) | **No asset at all** |
| Revenue / sale | Mint fees | Curve fees | **None — no payable functions** |
| Agent ID used as | Entry ticket | Entry ticket | **Operator-authenticity signal** |
| Customer | Minters | Traders | **Projects allocating per-ID quotas** |

## Contract

- `contracts/TrueAgentRegistry.sol` — BNB Chain (chainId 56)
- Registry: `0x0c085fd87e25DeDfCc65871FC4cC27177AA4f4c9` (CREATE2 via the
  ERC-2470 SingletonFactory, deployer rata.ai — deployment is permissionless
  by design, see below)
- Agent ID dependency: SPACE ID Agent ID `0x60b9262456de011f7d15a54cdd8c48baaa8b022f`
  (read-only `balanceOf` check)

### Permissions — stated plainly (hackathon red-line compliance)

- **No owner. No admin functions.** Nobody can pause, freeze, tax, mint, or
  change the rules after deployment.
- **No payable functions.** The contract can never receive or hold funds, so
  there is nothing to withdraw and no withdrawal function exists.
- **No approvals requested, ever.** Pledging/endorsing moves no assets.
- **No login of any kind on the website.** No QR codes, no pairing codes, no
  sessions — users sign normal transactions in their own wallet and confirm
  them themselves.
- **No return promises.** There is no token and nothing to earn; the pledge is
  a reputation signal, full stop.

## Run / verify

```bash
npm install
node scripts/compile.js   # solc 0.8.26, optimizer 200 runs
node test/test.js         # 16 behavioural tests on a local EVM (ganache)
node test/test-create2.js # CREATE2 deployment-path test (SingletonFactory flow)
```

## Website

**Live: https://trueagent.ayaforge.workers.dev**
**Demo video (57s): https://trueagent.ayaforge.workers.dev/demo.mp4**

`site/index.html` — a single static page: live registry stats read from BSC,
wallet connect (injected provider, BNB Chain), pledge / revoke / endorse, and
integration notes for projects.

## Status

- Contract compiled, 16/16 local tests pass, CREATE2 deploy path tested.
- **DEPLOYED 2026-11-18** — deploy tx
  `0xb0dcc22ac789d172835b4d849307ffa65c018e2b29ab4cba4bd1135940fd5c67`
  (block 134319828, gas used 428,938). On-chain verified by direct reads:
  `agentIdRegistry()` returns the SPACE ID Agent ID contract, and both
  project wallets are recognised by `isAgentIDHolder()`.
- Source verification: **Sourcify exact_match (creation + runtime)**,
  verified 2026-11-26 —
  https://sourcify.dev/#/lookup/0x0c085fd87e25DeDfCc65871FC4cC27177AA4f4c9
  (BscScan mirror inputs prepared in VERIFY_BSCSCAN.md).
