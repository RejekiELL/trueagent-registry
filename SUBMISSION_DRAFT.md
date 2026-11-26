# Submission draft — Binance Agent ID Hackathon
Deadline: 2026-12-09 08:00 UTC (15:00 WIB). No registration needed; submit during the period.

- **Project name:** TrueAgent Registry
- **Website:** TODO after hosting (GitHub Pages: https://rejekiell.github.io/trueagent-registry/ — repo must be created/uploaded by user; assistant has no GitHub login in VM)
- **Contract address(es):** 0x0c085fd87e25DeDfCc65871FC4cC27177AA4f4c9 (TrueAgentRegistry, BNB Chain) — after deployment + BscScan verification
- **Source code:** GitHub repo (public, MIT) — TODO user creates repo `trueagent-registry` and uploads this bundle; then verify source on BscScan (compiler v0.8.26+commit, optimizer 200 runs, constructor arg = Agent ID registry address)
- **Agent ID usage description:**
  TrueAgent integrates Agent ID at its core: the SPACE ID Agent ID registry
  (0x60b9262456de011f7d15a54cdd8c48baaa8b022f) is the contract's only external
  dependency and its reason to exist. Only addresses whose balanceOf on the
  Agent ID registry is > 0 can pledge or endorse, and the public signal
  isSelfOperated(address) — designed for other projects to call before
  allocating per-Agent-ID quotas — re-checks Agent ID ownership on every read.
  Agent ID is used here not as an entry ticket but as an operator-authenticity
  layer: it distinguishes self-operated Agent IDs from rented ones, a real
  abuse pattern (paid "lend your Agent ID" offers) that the standard
  balanceOf gate cannot see.
- **Reward receiving address:** TODO confirm with user (suggest mamana.ai BSC 0x0a0357898F563230B4C38B60A31cE5cE82b9484e)
- **Eligibility push (Innovation Award needs >=30 Agent ID addresses interacting):**
  pledge from mamana + rata first, then outreach: Boltbook community post,
  X post with demo, direct invites to Agent ID holders met via free-mint
  hunts. Track count via totalPledged + unique interactors on BscScan.
- **Promotion award (separate, optional):** X post about TrueAgent with
  #BinanceWalletHackathon #AgenticWallet + submit link via official survey.
