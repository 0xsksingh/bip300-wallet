import { BlockchainResponse } from '@/types/blockchain';

/**
 * API key for Rebar Labs (would need to be stored securely in a production app)
 */
const API_KEY = ''; // Request from https://rebarlabs.io/contact
const BASE_URL = 'https://api.rebarlabs.io';

/**
 * Service for interacting with Rebar Labs API to access Bitcoin-native assets
 * and metaprotocol activity on Bitcoin L1.
 */
class RebarLabsService {
  /**
   * Headers for authenticated requests
   */
  private getHeaders() {
    return {
      'Accept': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    };
  }

  /**
   * Fetch data from Rebar Labs API
   */
  private async fetchData<T>(endpoint: string, params?: Record<string, any>): Promise<BlockchainResponse<T>> {
    try {
      // Build URL with query parameters
      const url = new URL(`${BASE_URL}${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach(v => url.searchParams.append(key, v.toString()));
          } else if (value !== undefined) {
            url.searchParams.append(key, value.toString());
          }
        });
      }

      // Make request
      const response = await fetch(url.toString(), {
        method: 'GET',
        // headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: `Error fetching data: ${error}`,
      };
    }
  }

  /**
   * Get a list of Rune etchings
   */
  async getRuneEtchings(offset = 0, limit = 20): Promise<BlockchainResponse<any>> {
    return this.fetchData('/runes/v1/etchings', { offset , limit });
  }

  /**
   * Get details about a specific Rune etching
   */
  async getRuneEtching(etching: string): Promise<BlockchainResponse<any>> {
    return this.fetchData(`/runes/v1/etchings/${etching}`);
  }

  /**
   * Get activity for a specific Rune etching
   */
  async getRuneActivity(etching: string, offset = 0, limit = 20): Promise<BlockchainResponse<any>> {
    return this.fetchData(`/runes/v1/etchings/${etching}/activity`, { offset, limit });
  }

  /**
   * Get activity for a specific address and Rune etching
   */
  async getRuneAddressActivity(etching: string, address: string, offset = 0, limit = 20): Promise<BlockchainResponse<any>> {
    return this.fetchData(`/runes/v1/etchings/${etching}/activity/${address}`, { offset, limit });
  }

  /**
   * Get a list of holders for a specific Rune etching
   */
  async getRuneHolders(etching: string, offset = 0, limit = 20): Promise<BlockchainResponse<any>> {
    return this.fetchData(`/runes/v1/etchings/${etching}/holders`, { offset, limit });
  }

  /**
   * Get balance for a specific address and Rune etching
   */
  async getRuneAddressBalance(etching: string, address: string): Promise<BlockchainResponse<any>> {
    return this.fetchData(`/runes/v1/etchings/${etching}/holders/${address}`);
  }

  /**
   * Get all Rune balances for an address
   */
  async getAddressRuneBalances(address: string, offset = 0, limit = 20): Promise<BlockchainResponse<any>> {
    return this.fetchData(`/runes/v1/addresses/${address}/balances`, { offset, limit });
  }

  /**
   * Get Ordinal inscriptions with optional filters
   */
  async getInscriptions(params?: {
    offset?: number;
    limit?: number;
    mimeType?: string[];
    address?: string[];
  }): Promise<BlockchainResponse<any>> {
    return this.fetchData('/ordinals/v1/inscriptions', {
      offset: params?.offset || 0,
      limit: params?.limit || 20,
      mime_type: params?.mimeType,
      address: params?.address,
    });
  }

  /**
   * Get a specific inscription by ID or number
   */
  async getInscription(id: string | number): Promise<BlockchainResponse<any>> {
    return this.fetchData(`/ordinals/v1/inscriptions/${id}`);
  }

  /**
   * Get inscription content
   */
  async getInscriptionContent(id: string | number): Promise<BlockchainResponse<any>> {
    return this.fetchData(`/ordinals/v1/inscriptions/${id}/content`);
  }

  /**
   * Get inscription transfer history
   */
  async getInscriptionTransfers(id: string | number, offset = 0, limit = 20): Promise<BlockchainResponse<any>> {
    return this.fetchData(`/ordinals/v1/inscriptions/${id}/transfers`, { offset, limit });
  }

  /**
   * Get satoshi information by ordinal number
   */
  async getSatoshi(ordinal: number): Promise<BlockchainResponse<any>> {
    return this.fetchData(`/ordinals/v1/sats/${ordinal}`);
  }

  /**
   * Get BRC-20 tokens
   */
  async getBRC20Tokens(params?: {
    ticker?: string[];
    offset?: number;
    limit?: number;
  }): Promise<BlockchainResponse<any>> {
    return this.fetchData('/ordinals/v1/brc-20/tokens', {
      ticker: params?.ticker,
      offset: params?.offset || 0,
      limit: params?.limit || 20,
    });
  }

  /**
   * Get details about a specific BRC-20 token
   */
  async getBRC20Token(ticker: string): Promise<BlockchainResponse<any>> {
    return this.fetchData(`/ordinals/v1/brc-20/tokens/${ticker}`);
  }

  /**
   * Get holders of a specific BRC-20 token
   */
  async getBRC20TokenHolders(ticker: string, offset = 0, limit = 20): Promise<BlockchainResponse<any>> {
    return this.fetchData(`/ordinals/v1/brc-20/tokens/${ticker}/holders`, { offset, limit });
  }

  /**
   * Get BRC-20 balances for an address
   */
  async getBRC20Balances(address: string, params?: {
    ticker?: string[];
    offset?: number;
    limit?: number;
  }): Promise<BlockchainResponse<any>> {
    return this.fetchData(`/ordinals/v1/brc-20/balances/${address}`, {
      ticker: params?.ticker,
      offset: params?.offset || 0,
      limit: params?.limit || 20,
    });
  }

  /**
   * Get BRC-20 activity
   */
  async getBRC20Activity(params?: {
    ticker?: string[];
    address?: string;
    offset?: number;
    limit?: number;
  }): Promise<BlockchainResponse<any>> {
    return this.fetchData('/ordinals/v1/brc-20/activity', {
      ticker: params?.ticker,
      address: params?.address,
      offset: params?.offset || 0,
      limit: params?.limit || 20,
    });
  }
}

// Export a singleton instance
export const rebarLabsService = new RebarLabsService(); 