/**
 * ZK Proof generation route
 * Generates Groth16 proofs server-side (snarkjs doesn't work well in browser)
 */

import { Hono } from "hono";
import * as snarkjs from "snarkjs";
import { buildPoseidon } from "circomlibjs";
import { createHash } from "crypto";
import { join } from "path";

const proof = new Hono();

// Use absolute paths from working directory for production compatibility
const CIRCUIT_WASM_PATH = join(process.cwd(), "circuits/payroll_private.wasm");
const CIRCUIT_ZKEY_PATH = join(process.cwd(), "circuits/circuit_final.zkey");
const MAX_RECIPIENTS = 5;

// Poseidon instance cache
let poseidonInstance: any = null;
let poseidonF: any = null;

async function getPoseidon() {
  if (!poseidonInstance) {
    poseidonInstance = await buildPoseidon();
    poseidonF = poseidonInstance.F;
  }
  return { poseidon: poseidonInstance, F: poseidonF };
}

/**
 * Generate a random field element (31 bytes to stay within BN254 field)
 */
function generateRandomSalt(): bigint {
  const bytes = new Uint8Array(31);
  crypto.getRandomValues(bytes);
  let hex = "0x";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return BigInt(hex);
}

/**
 * Derive a deterministic salt from master secret + recipient + identifier
 */
async function deriveSalt(
  masterSecret: string,
  recipient: string,
  identifier: string
): Promise<bigint> {
  const { poseidon, F } = await getPoseidon();

  // Hash masterSecret
  const secretHash = createHash("sha256").update(masterSecret).digest("hex");
  const secretBigInt = BigInt("0x" + secretHash);

  // Hash identifier
  const idHash = createHash("sha256").update(identifier).digest("hex");
  const idBigInt = BigInt("0x" + idHash);

  // Poseidon(secret, recipient, identifier)
  const recipientBigInt = BigInt(recipient);
  const hash = poseidon([secretBigInt, recipientBigInt, idBigInt]);

  return F.toObject(hash);
}

interface ProofRequest {
  recipients: string[];
  amounts: string[];
  totalAmount: string;
  masterSecret?: string;
  payrollIdentifier?: string;
}

interface ClaimCredential {
  commitmentIndex: number;
  recipient: string;
  amount: string;
  salt: string;
  commitment: string;
}

proof.post("/generate", async (c) => {
  try {
    const body = await c.req.json<ProofRequest>();
    const { recipients, amounts, totalAmount, masterSecret, payrollIdentifier } = body;

    if (!recipients || !amounts || !totalAmount) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    if (recipients.length > MAX_RECIPIENTS) {
      return c.json({ error: `Max ${MAX_RECIPIENTS} recipients allowed` }, 400);
    }

    if (recipients.length !== amounts.length) {
      return c.json({ error: "Recipients and amounts must have same length" }, 400);
    }

    const activeCount = recipients.length;
    const { poseidon, F } = await getPoseidon();

    // Pad arrays
    const paddedRecipients: string[] = [...recipients];
    const paddedAmounts: string[] = [...amounts];
    let salts: bigint[] = [];

    // Generate or derive salts
    if (masterSecret && payrollIdentifier) {
      for (const recipient of recipients) {
        salts.push(await deriveSalt(masterSecret, recipient, payrollIdentifier));
      }
    } else {
      for (let i = 0; i < activeCount; i++) {
        salts.push(generateRandomSalt());
      }
    }

    // Pad with zeros
    while (paddedRecipients.length < MAX_RECIPIENTS) {
      paddedRecipients.push("0x0000000000000000000000000000000000000000");
      paddedAmounts.push("0");
      salts.push(0n);
    }

    // Convert addresses to field elements
    const recipientValues = paddedRecipients.map((addr) => BigInt(addr).toString());

    // Compute Poseidon commitments
    const commitments: string[] = [];
    for (let i = 0; i < MAX_RECIPIENTS; i++) {
      const hash = poseidon([
        BigInt(recipientValues[i]),
        BigInt(paddedAmounts[i]),
        salts[i],
      ]);
      commitments.push(F.toObject(hash).toString());
    }

    // Build circuit input (v2.1: no activeCount needed)
    const input = {
      totalAmount: totalAmount,
      commitments: commitments,
      recipients: recipientValues,
      amounts: paddedAmounts,
      salts: salts.map((s) => s.toString()),
    };

    console.log("Generating proof with input:", {
      totalAmount: input.totalAmount,
      commitmentsCount: commitments.length,
      usingDerivedSalts: !!(masterSecret && payrollIdentifier),
    });

    // Use single-threaded mode to avoid web-worker crash in Bun
    const { proof: zkProof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      CIRCUIT_WASM_PATH,
      CIRCUIT_ZKEY_PATH,
      undefined, // wtns (optional)
      undefined  // logger (optional)
    );

    console.log("Proof generated successfully");

    // Format proof for Solidity (swap B-point coordinates for BN254)
    const solidityProof: string[] = [
      zkProof.pi_a[0],
      zkProof.pi_a[1],
      zkProof.pi_b[0][1],
      zkProof.pi_b[0][0],
      zkProof.pi_b[1][1],
      zkProof.pi_b[1][0],
      zkProof.pi_c[0],
      zkProof.pi_c[1],
    ];

    // Build claim credentials
    const claimCredentials: ClaimCredential[] = [];
    for (let i = 0; i < activeCount; i++) {
      claimCredentials.push({
        commitmentIndex: i,
        recipient: recipients[i],
        amount: amounts[i],
        salt: salts[i].toString(),
        commitment: commitments[i],
      });
    }

    return c.json({
      proof: solidityProof,
      publicSignals,
      commitments,
      claimCredentials,
    });
  } catch (err: any) {
    console.error("Proof generation error:", err);
    return c.json({ error: err?.message || "Proof generation failed" }, 500);
  }
});

export default proof;
