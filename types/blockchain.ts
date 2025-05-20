/**
 * BIP300 Types for Sidechain and Withdrawal Management
 */

/**
 * Bitcoin Networks
 */
export enum BitcoinNetwork {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
  REGTEST = 'regtest',
}

/**
 * Sidechain information as stored in D1 database (The Sidechain List)
 */
export interface SidechainInfo {
  escrowNumber: number;
  version: number;
  name: string;
  description: string;
  tarballHash: string;
  gitCommitHash: string;
  isActive: boolean;
  activationStatus?: {
    age: number;
    fails: number;
  };
  ctip: {
    txid: string;
    vout: number;
  };
}

/**
 * Withdrawal Bundle entry as stored in D2 database (The Withdrawal List)
 */
export interface WithdrawalBundle {
  sidechainNumber: number;
  bundleHash: string;
  workScore: number; // ACKs count
  blocksRemaining: number;
}

/**
 * Transaction input
 */
export interface TxInput {
  txid: string;
  vout: number;
  scriptSig?: string;
  sequence?: number;
}

/**
 * Transaction output
 */
export interface TxOutput {
  value: number;
  scriptPubKey: string;
  address?: string;
}

/**
 * A basic transaction structure
 */
export interface Transaction {
  txid: string;
  hash: string;
  version: number;
  size: number;
  vsize: number;
  weight: number;
  locktime: number;
  inputs: TxInput[];
  outputs: TxOutput[];
  time?: number;
  blockHash?: string;
  blockHeight?: number;
  confirmations?: number;
}

/**
 * Deposit (M5) transaction details
 */
export interface DepositTransaction extends Transaction {
  sidechainNumber: number;
  depositAmount: number;
}

/**
 * Withdrawal (M6) transaction details with bundle information
 */
export interface WithdrawalTransaction extends Transaction {
  sidechainNumber: number;
  withdrawalAmount: number;
  bundleHash: string;
  recipients: {
    address: string;
    amount: number;
  }[];
}

/**
 * UTXO (Unspent Transaction Output)
 */
export interface UTXO {
  txid: string;
  vout: number;
  address: string;
  scriptPubKey: string;
  amount: number;
  confirmations: number;
  spendable: boolean;
}

/**
 * Wallet account information
 */
export interface WalletAccount {
  id: string;
  name: string;
  type: 'hd' | 'imported';
  network: BitcoinNetwork;
  balance: {
    confirmed: number;
    unconfirmed: number;
    total: number;
  };
  sidechainBalances: {
    [sidechainNumber: number]: {
      confirmed: number;
      unconfirmed: number;
      total: number;
    };
  };
}

/**
 * HD Wallet specific information
 */
export interface HDWalletInfo {
  mnemonic?: string; // Only stored encrypted or in memory
  seed?: string; // Only stored encrypted or in memory
  passphrase?: string; // Only stored in memory
  derivationPath: string;
  accountIndex: number;
}

/**
 * Response structure for blockchain operations
 */
export interface BlockchainResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
} 