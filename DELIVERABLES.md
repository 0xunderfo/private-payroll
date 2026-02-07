# ZK Payroll — ETH Oxford 2026 Deliverables Checklist

> **Deadline:** Sunday 8 Feb 2026, 12:00 (noon)
> **Tracks:** Programmable Cryptography (Main) + Plasma Bounty

---

## Submission Requirements

### Programmable Cryptography Main Track ($10K SAFE)

| Status | Deliverable | Notes |
|--------|-------------|-------|
| [ ] | **Pitch video** | 2-3 min explaining the project, problem, solution, and commercial upside |
| [ ] | **Public code repo** | GitHub link with clean README |
| [ ] | **Live demo ready** | For judge deep-dive session (Sun 14:00-16:00) |

**Judging criteria to emphasize:**
1. **Novelty** — ZK proofs for payroll privacy (amounts hidden, total verified)
2. **Technical sophistication** — Groth16 + Poseidon commitments + two-phase claim model
3. **Commercial upside** — DAO treasury management, enterprise payroll, HR privacy

---

### Plasma Payments Bounty ($5K)

| Status | Deliverable | Notes |
|--------|-------------|-------|
| [ ] | **Public GitHub repository** | Same repo, ensure Plasma deployment docs |
| [ ] | **Demo video** | Can be terminal recording, show full flow |
| [ ] | **Written explanation** | Add to README or separate doc |
| [ ] | **Live/deployed demo** | Plus, not required — target Plasma testnet |

**Focus area alignment:**
- [x] Privacy and confidentiality in onchain payments ✓ (core feature)
- [ ] Speed/efficiency of stablecoin settlement
- [ ] Stablecoin accessibility

**Judging criteria:**
1. Relevance to payments ✓
2. Quality of execution
3. Clarity of user experience
4. Originality of the idea ✓

---

## Technical Deliverables

### Smart Contracts

| Status | Item | Details |
|--------|------|---------|
| [x] | ZKPayrollPrivate.sol | Core contract with createPayroll + claimPayment |
| [x] | Groth16 Verifier | Generated from snarkjs, B-point swapped |
| [x] | PoseidonT4 | Deployed from circomlibjs bytecode |
| [x] | MockUSDT | For testing (6 decimals) |
| [x] | Forge tests passing | 8/8 tests ✓ |
| [ ] | Deploy to Plasma testnet | Chain 9746, RPC: testnet-rpc.plasma.to |
| [ ] | Verify contracts on explorer | If Plasma has verification |

### ZK Circuits

| Status | Item | Details |
|--------|------|---------|
| [x] | payroll_private.circom | 5 recipients max, 6 public signals |
| [x] | Powers of Tau ceremony | Using hez_final_12.ptau |
| [x] | Trusted setup complete | circuit.zkey generated |
| [x] | Verification key exported | verification_key.json |
| [x] | Document circuit constraints | 1320 non-linear + 1710 linear — see `deliverables/docs/architecture.md` |

### Frontend

| Status | Item | Details |
|--------|------|---------|
| [x] | Landing page | Beautiful, explains the value prop |
| [x] | /create page | Payroll creation form |
| [x] | /claim page | Recipient claim flow |
| [x] | Wallet connection | wagmi integration |
| [x] | Client-side proof generation | snarkjs in browser |
| [ ] | Connect to Plasma testnet | Update wagmi config |
| [ ] | Error handling polish | User-friendly messages |
| [ ] | Loading states | During proof generation |
| [ ] | Mobile responsive check | Quick audit |

### Backend/Relayer (if applicable)

| Status | Item | Details |
|--------|------|---------|
| [ ] | Relayer service | For gasless claims (optional) |
| [ ] | Claim link generation | Encode salt + payrollId in URL |

---

## Content Deliverables

### README.md

| Status | Item |
|--------|------|
| [x] | Project overview (1 paragraph) |
| [x] | Problem statement |
| [x] | Solution description |
| [x] | Architecture diagram |
| [x] | Tech stack list |
| [x] | Local setup instructions |
| [ ] | Deployment instructions |
| [ ] | Demo video embed/link |
| [x] | Team members |
| [x] | **Plasma feedback section** (required for Plasma bounty) — see `deliverables/docs/plasma-feedback.md` |

### Technical Documentation

| Status | Item |
|--------|------|
| [x] | Architecture deep-dive | `deliverables/docs/architecture.md` |
| [x] | Plasma developer feedback | `deliverables/docs/plasma-feedback.md` |

### Pitch Video (2-3 min)

> **Script:** `deliverables/scripts/pitch-video-script.md`

| Status | Section | Duration |
|--------|---------|----------|
| [x] | Hook — "Your payroll is public" | 15s |
| [x] | Problem — DAO salary transparency issue | 30s |
| [x] | Solution — ZK proofs hide amounts, verify total | 45s |
| [x] | Demo — Show the flow | 45s |
| [x] | Tech — Groth16, Poseidon, Plasma | 20s |
| [x] | Commercial upside — Market size, future | 25s |

### Demo Video (for Plasma)

> **Script:** `deliverables/scripts/demo-video-script.md`

| Status | Item |
|--------|------|
| [x] | Show landing page |
| [x] | Create payroll with 3 recipients |
| [x] | Show proof generation |
| [x] | Show on-chain transaction |
| [x] | Show claim flow for one recipient |
| [x] | Show privacy (amounts hidden on explorer) |

---

## Pre-Submission Checklist

### Code Quality

| Status | Item |
|--------|------|
| [ ] | Remove console.logs |
| [ ] | Remove hardcoded localhost addresses |
| [ ] | Update contract addresses for Plasma |
| [ ] | Clean up unused files |
| [ ] | Add .env.example |
| [ ] | Ensure .gitignore is complete |

### Testing

| Status | Item |
|--------|------|
| [x] | Forge tests pass (8/8) |
| [ ] | E2E test on Plasma testnet |
| [ ] | Test claim flow end-to-end |
| [ ] | Test with real wallet (not Anvil) |

### Repository

| Status | Item |
|--------|------|
| [ ] | Public visibility |
| [ ] | LICENSE file (MIT) |
| [ ] | Clean commit history |
| [ ] | No secrets in repo |
| [ ] | GitHub repo link updated in landing page |

---

## DoraHacks Submission Form

| Status | Field |
|--------|-------|
| [ ] | Project name: **ZK Payroll** |
| [ ] | Track: **Programmable Cryptography** (main) |
| [ ] | Track: **Plasma** (bounty) |
| [ ] | Pitch video URL |
| [ ] | GitHub repo URL |
| [ ] | Demo URL (if deployed) |
| [ ] | Team members |
| [ ] | Project description |

---

## Timeline

| Time | Task |
|------|------|
| **Sat PM** | Deploy to Plasma testnet |
| **Sat PM** | Polish frontend UX |
| **Sat Night** | Record demo video |
| **Sun AM** | Record pitch video |
| **Sun AM** | Finalize README |
| **Sun 11:00** | Submit on DoraHacks |
| **Sun 11:30** | Buffer for issues |
| **Sun 12:00** | 🚨 DEADLINE |

---

## Quick Links

- Plasma Testnet RPC: `https://testnet-rpc.plasma.to`
- Plasma Chain ID: `9746`
- DoraHacks submission: *(add link when available)*
- GitHub repo: *(update with public URL)*

---

## Notes

- Use `node` not `bun` for snarkjs (bun crashes with web-worker issue)
- USDT uses 6 decimals
- Salt derivation: `deriveSalt(masterSecret, recipient, identifier)`
