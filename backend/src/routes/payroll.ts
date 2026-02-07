/**
 * Payroll API Routes
 * Handles gasless payroll creation via Plasma relayer + EIP-3009
 */

import { Hono } from "hono";
import type { Address, Hex } from "viem";
import { createPayrollRelayed } from "../lib/contract";
import { getEscrowAddress } from "../lib/escrow";
import { submitZeroFeeTransfer, waitForConfirmation } from "../lib/relayer";
import type { EIP3009Authorization } from "../lib/escrow";

const payroll = new Hono();

// Types for API
interface ClaimCredential {
  commitmentIndex: number;
  recipient: string;
  amount: string;
  salt: string;
  commitment: string;
}

interface CreatePayrollRequest {
  recipients: Address[];
  amounts: string[];
  totalAmount: string;
  proof: string[];
  commitments: string[];
  claimCredentials: ClaimCredential[];
  employer: Address;
  authorization: {
    from: Address;
    to: Address;
    value: string;
    validAfter: string;
    validBefore: string;
    nonce: Hex;
  };
  signature: Hex;
}

/**
 * Get client IP from request headers
 */
function getClientIp(c: { req: { header: (name: string) => string | undefined } }): string {
  return (
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
    c.req.header("x-real-ip") ||
    "127.0.0.1"
  );
}

/**
 * Build claim URLs for frontend display
 */
function buildClaimUrls(
  payrollId: number,
  claimCredentials: ClaimCredential[],
  baseUrl: string
): Array<ClaimCredential & { claimUrl: string }> {
  return claimCredentials.map((cred) => {
    const params = new URLSearchParams({
      payrollId: payrollId.toString(),
      commitmentIndex: cred.commitmentIndex.toString(),
      recipient: cred.recipient,
      amount: cred.amount,
      salt: cred.salt,
    });
    return {
      ...cred,
      claimUrl: `${baseUrl}/claim?${params.toString()}`,
    };
  });
}

/**
 * GET /api/payroll/escrow
 * Returns the escrow address for frontend to build EIP-3009 authorization
 */
payroll.get("/escrow", (c) => {
  try {
    const escrowAddress = getEscrowAddress();
    return c.json({ address: escrowAddress });
  } catch (error) {
    console.error("Get escrow error:", error);
    return c.json({ error: "Failed to get escrow address" }, 500);
  }
});

/**
 * POST /api/payroll/create
 * Create payroll via gasless flow:
 * 1. Submit employer's EIP-3009 signature to Plasma relayer (USDT -> escrow)
 * 2. Wait for USDT transfer confirmation
 * 3. Call createPayrollRelayed() as escrow
 * 4. Return payrollId and claim URLs
 */
payroll.post("/create", async (c) => {
  try {
    const body = await c.req.json() as CreatePayrollRequest;
    const {
      recipients,
      amounts,
      totalAmount,
      proof,
      commitments,
      claimCredentials,
      employer,
      authorization,
      signature,
    } = body;

    // Validate inputs
    if (!recipients?.length || !amounts?.length || !totalAmount || !proof?.length || !commitments?.length) {
      return c.json({ error: "Missing required payroll data" }, 400);
    }
    if (!employer || !authorization || !signature) {
      return c.json({ error: "Missing authorization data" }, 400);
    }

    const escrowAddress = getEscrowAddress();

    // Validate authorization.to === escrowAddress
    if (authorization.to.toLowerCase() !== escrowAddress.toLowerCase()) {
      return c.json({ error: "Authorization must be to escrow address" }, 400);
    }

    // Validate authorization.value matches totalAmount
    if (authorization.value !== totalAmount) {
      return c.json({ error: "Authorization value must match totalAmount" }, 400);
    }

    // Convert authorization to EIP3009Authorization format
    const eip3009Auth: EIP3009Authorization = {
      from: authorization.from,
      to: authorization.to,
      value: BigInt(authorization.value),
      validAfter: BigInt(authorization.validAfter),
      validBefore: BigInt(authorization.validBefore),
      nonce: authorization.nonce,
    };

    // Step 1: Submit EIP-3009 to Plasma relayer
    console.log("[payroll/create] Submitting EIP-3009 to Plasma relayer...");
    const userIp = getClientIp(c);
    const relayerResult = await submitZeroFeeTransfer(userIp, eip3009Auth, signature);
    console.log("[payroll/create] Relayer submitted:", relayerResult.authorizationId);

    // Step 2: Wait for USDT transfer confirmation
    console.log("[payroll/create] Waiting for transfer confirmation...");
    const transferResult = await waitForConfirmation(userIp, relayerResult.authorizationId);

    if (transferResult.status !== "confirmed") {
      console.error("[payroll/create] Transfer failed:", transferResult.error);
      return c.json({
        error: "USDT transfer failed",
        details: transferResult.error
      }, 400);
    }
    console.log("[payroll/create] Transfer confirmed:", transferResult.txHash);

    // Step 3: Call createPayrollRelayed as escrow
    console.log("[payroll/create] Creating payroll on contract...");

    // Pad recipients to 5
    const paddedRecipients = [...recipients] as Address[];
    while (paddedRecipients.length < 5) {
      paddedRecipients.push("0x0000000000000000000000000000000000000000" as Address);
    }

    const { txHash, payrollId } = await createPayrollRelayed(
      employer,
      proof.map((p) => BigInt(p)),
      BigInt(totalAmount),
      commitments.map((c) => BigInt(c)),
      paddedRecipients
    );
    console.log("[payroll/create] Payroll created:", payrollId, "tx:", txHash);

    // Step 4: Build claim URLs
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const credentialsWithUrls = buildClaimUrls(Number(payrollId), claimCredentials, frontendUrl);

    return c.json({
      success: true,
      payrollId: Number(payrollId),
      txHash,
      transferTxHash: transferResult.txHash,
      claimCredentials: credentialsWithUrls,
    });
  } catch (error) {
    console.error("[payroll/create] Error:", error);
    return c.json({
      error: "Payroll creation failed",
      details: String(error)
    }, 500);
  }
});

export default payroll;
