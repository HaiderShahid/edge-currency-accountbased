/* global */
// @flow

import type {
  EdgeCorePluginOptions,
  EdgeCurrencyInfo
} from 'edge-core-js/types'

import { makeSolanaPluginInner } from './solanaPlugin.js'
import type { SolanaSettings } from './solanaTypes.js'

const otherSettings: SolanaSettings = {
  rpcNodes: [
    // 'https://solana-api.projectserum.com', // Doesn't have full history
    'https://ssc-dao.genesysgo.net',
    'https://api.mainnet-beta.solana.com'
  ],
  commitment: 'confirmed', // confirmed is faster, finalized is safer. Even faster processed is unsupported for tx querys
  txQueryLimit: 1000, // RPC default is 1000
  derivationPath: "m/44'/501'/0'/0'",
  memoPublicKey: 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'
}

const defaultSettings: any = {
  otherSettings
}

export const currencyInfo: EdgeCurrencyInfo = {
  // Basic currency information:
  currencyCode: 'SOL',
  displayName: 'Solana',
  pluginId: 'solana',
  walletType: 'wallet:solana',

  defaultSettings,

  addressExplorer: 'https://blockchair.com/solana/address/%s?from=edgeapp',
  transactionExplorer:
    'https://blockchair.com/solana/transaction/%s?from=edgeapp',

  denominations: [
    // An array of Objects of the possible denominations for this currency
    {
      name: 'SOL',
      multiplier: '1000000000',
      symbol: '◎'
    }
  ],
  metaTokens: []
}

export const makeSolanaPlugin = (opts: EdgeCorePluginOptions) => {
  return makeSolanaPluginInner(opts, currencyInfo)
}
