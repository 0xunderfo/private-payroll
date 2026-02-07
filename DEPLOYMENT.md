# ZK Payroll - Plasma Testnet Deployment

**Network:** Plasma Testnet
**Chain ID:** 9746
**RPC:** https://testnet-rpc.plasma.to
**Explorer:** https://testnet.plasmascan.to
**Deployed:** 2026-02-07 (v2 with gasless relayer support)

## Contract Addresses

| Contract | Address | Verified |
|----------|---------|----------|
| ZKPayrollPrivate | [`0x20968f24Ce6A04fa90C7DF771d7FD3821372c68c`](https://testnet.plasmascan.to/address/0x20968f24Ce6A04fa90C7DF771d7FD3821372c68c) | ❌ |
| Groth16Verifier | [`0xD2220d2687A0C3227Bb13B23Ef45FE65b40133Fc`](https://testnet.plasmascan.to/address/0xD2220d2687A0C3227Bb13B23Ef45FE65b40133Fc) | ❌ |
| PoseidonT4 | [`0x98a2835830CAD052F75f07Ed9Ef7AB2F7C0ddD88`](https://testnet.plasmascan.to/address/0x98a2835830CAD052F75f07Ed9Ef7AB2F7C0ddD88) | ❌ |
| USDT0 | [`0x502012b361AebCE43b26Ec812B74D9a51dB4D412`](https://testnet.plasmascan.to/address/0x502012b361AebCE43b26Ec812B74D9a51dB4D412) | (external) |

## Escrow

| Role | Address |
|------|---------|
| Escrow EOA | [`0xdAA09B79D531649EAF80B968925F48FD6Dd6D6E3`](https://testnet.plasmascan.to/address/0xdAA09B79D531649EAF80B968925F48FD6Dd6D6E3) |

## Constructor Arguments

**ZKPayrollPrivate:**
- `verifier`: `0xD2220d2687A0C3227Bb13B23Ef45FE65b40133Fc`
- `usdt`: `0x502012b361AebCE43b26Ec812B74D9a51dB4D412`
- `poseidon`: `0x98a2835830CAD052F75f07Ed9Ef7AB2F7C0ddD88`
- `escrow`: `0xdAA09B79D531649EAF80B968925F48FD6Dd6D6E3`

## Post-Deployment Setup

Escrow must approve the ZKPayrollPrivate contract to spend USDT0:

```bash
cast send 0x502012b361AebCE43b26Ec812B74D9a51dB4D412 \
  'approve(address,uint256)' \
  0x20968f24Ce6A04fa90C7DF771d7FD3821372c68c \
  0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff \
  --rpc-url https://testnet-rpc.plasma.to \
  --private-key $ESCROW_PRIVATE_KEY
```

## Manual Verification

Plasmascan uses Etherscan V2 API. Verify manually via explorer UI at:
- https://testnet.plasmascan.to/address/0x20968f24Ce6A04fa90C7DF771d7FD3821372c68c#code
- https://testnet.plasmascan.to/address/0xD2220d2687A0C3227Bb13B23Ef45FE65b40133Fc#code

**Settings for verification:**
- Compiler: `0.8.24`
- Optimization: `Yes` (200 runs)
- License: MIT

## Transaction Details

Broadcast saved to: `contracts/broadcast/DeployTestnet.s.sol/9746/run-latest.json`
