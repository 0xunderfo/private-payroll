/**
 * Shared types for ZK Payroll frontend
 */

export interface ClaimCredential {
  payrollId?: number;
  commitmentIndex: number;
  recipient: string;
  amount: string; // raw units (6 decimals)
  salt: string;
  commitment: string;
}
