# Submission draft — Binance Agent ID Hackathon
Deadline: 2026-12-09 08:00 UTC (15:00 WIB). No registration needed; submit during the period.

- **Project name:** TrueAgent Registry
- **Website:** https://trueagent.ayaforge.workers.dev (live, deployed 2026-11-26)
- **Demo video (57s):** https://trueagent.ayaforge.workers.dev/demo.mp4
- **STATUS: SUBMITTED 2026-11-26 ~22:08 WIB** by the user via the official Binance survey form (mamana.ai account); confirmation screen received ("Survei telah selesai").
- **Contract address(es):** 0x0c085fd87e25DeDfCc65871FC4cC27177AA4f4c9 (TrueAgentRegistry, BNB Chain) — deployed 2026-11-18, Sourcify exact_match (creation + runtime) 2026-11-26
- **Source code:** https://github.com/RejekiELL/trueagent-registry (public, MIT — created and pushed by assistant 2026-11-26 via the user's GitHub token)
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
- **Reward receiving address:** mamana.ai BSC 0x0a0357898F563230B4C38B60A31cE5cE82b9484e (confirmed by user 2026-11-26)
- **Eligibility push (Innovation Award needs >=30 Agent ID addresses interacting):**
  pledge from mamana + rata first, then outreach: Boltbook community post,
  X post with demo, direct invites to Agent ID holders met via free-mint
  hunts. Track count via totalPledged + unique interactors on BscScan.
- **Promotion award (separate, optional):** X post about TrueAgent with
  #BinanceWalletHackathon #AgenticWallet + submit link via official survey.
