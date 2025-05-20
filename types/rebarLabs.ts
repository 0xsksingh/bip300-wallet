/**
 * Rebar Labs API Types for Bitcoin-native assets
 */

/**
 * Pagination response wrapper
 */
export interface PaginatedResponse<T> {
  limit: number;
  offset: number;
  total: number;
  results: T[];
}

/**
 * Transaction/block location
 */
export interface Location {
  block_hash: string;
  block_height: number;
  tx_id: string;
  tx_index: number;
  vout: number;
  output: string;
  timestamp: number;
}

/**
 * Rune etching information
 */
export interface RuneEtching {
  id: string;
  name: string;
  spaced_name: string;
  number: number;
  divisibility: number;
  symbol: string;
  turbo: boolean;
  mint_terms: {
    amount: string;
    cap: string;
    height_start: number;
    height_end: number;
    offset_start: number;
    offset_end: number;
  };
  supply: {
    current: string;
    minted: string;
    total_mints: string;
    mint_percentage: string;
    mintable: boolean;
    burned: string;
    total_burns: string;
    premine: string;
  };
  location: Location;
}

/**
 * Rune activity information
 */
export interface RuneActivity {
  address: string;
  receiver_address: string;
  amount: string;
  operation: 'etching' | 'transfer' | 'burn';
  location: Location;
}

/**
 * Rune activity with rune information
 */
export interface RuneAddressActivity extends RuneActivity {
  rune: {
    id: string;
    number: number;
    name: string;
    spaced_name: string;
  };
}

/**
 * Rune holder information
 */
export interface RuneHolder {
  address: string;
  balance: string;
}

/**
 * Inscription information
 */
export interface Inscription {
  id: string;
  number: number;
  address: string;
  genesis_address: string;
  genesis_block_height: number;
  genesis_block_hash: string;
  genesis_tx_id: string;
  genesis_fee: string;
  genesis_timestamp: number;
  tx_id: string;
  location: string;
  output: string;
  value: string;
  offset: string;
  sat_ordinal: string;
  sat_rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  sat_coinbase_height: number;
  mime_type: string;
  content_type: string;
  content_length: number;
  timestamp: number;
  curse_type: string | null;
  recursive: boolean;
  recursion_refs: string[];
  parent: string | null;
  parent_refs: string[];
  delegate: string | null;
  metadata: any;
  meta_protocol: string | null;
  charms: string[];
}

/**
 * Inscription transfer information
 */
export interface InscriptionTransfer {
  id: string;
  number: number;
  from: InscriptionLocation;
  to: InscriptionLocation;
}

/**
 * Inscription location information
 */
export interface InscriptionLocation {
  block_height: number;
  block_hash: string;
  address: string;
  tx_id: string;
  location: string;
  output: string;
  value: string;
  offset: string;
  timestamp: number;
}

/**
 * Satoshi information
 */
export interface Satoshi {
  coinbase_height: number;
  cycle: number;
  decimal: string;
  degree: string;
  inscription_id: string | null;
  epoch: number;
  name: string;
  offset: number;
  percentile: string;
  period: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
}

/**
 * BRC-20 token information
 */
export interface BRC20Token {
  id: string;
  number: number;
  block_height: number;
  tx_id: string;
  address: string;
  ticker: string;
  max_supply: string;
  mint_limit: string;
  decimals: number;
  deploy_timestamp: number;
  minted_supply: string;
  tx_count: number;
  self_mint: boolean;
}

/**
 * BRC-20 token detailed information
 */
export interface BRC20TokenDetails {
  token: BRC20Token;
  supply: {
    max_supply: string;
    minted_supply: string;
    holders: number;
  };
}

/**
 * BRC-20 holder information
 */
export interface BRC20Holder {
  address: string;
  overall_balance: string;
}

/**
 * BRC-20 balance information
 */
export interface BRC20Balance {
  ticker: string;
  available_balance: string;
  transferrable_balance: string;
  overall_balance: string;
}

/**
 * BRC-20 activity information
 */
export interface BRC20Activity {
  operation: 'deploy' | 'mint' | 'transfer' | 'transfer_send';
  ticker: string;
  inscription_id: string;
  block_height: number;
  block_hash: string;
  tx_id: string;
  location: string;
  address: string;
  timestamp: number;
  mint?: {
    amount: string;
  };
  deploy?: {
    max_supply: string;
    mint_limit: string;
    decimals: number;
  };
  transfer?: {
    amount: string;
    from_address: string;
  };
  transfer_send?: {
    amount: string;
    from_address: string;
    to_address: string;
  };
} 