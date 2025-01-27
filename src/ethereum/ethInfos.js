// @flow

import { makeAvalanchePlugin } from './info/avaxInfo'
import { makeBinanceSmartChainPlugin } from './info/bscInfo.js'
import { makeCeloPlugin } from './info/celoInfo.js'
import { makeEthereumClassicPlugin } from './info/etcInfo.js'
import { makeEthereumPlugin } from './info/ethInfo.js'
import { makeFantomPlugin } from './info/ftminfo.js'
import { makePolygonPlugin } from './info/maticInfo'
import { makeRskPlugin } from './info/rskInfo.js'

export const ethPlugins = {
  binancesmartchain: makeBinanceSmartChainPlugin,
  ethereum: makeEthereumPlugin,
  ethereumclassic: makeEthereumClassicPlugin,
  fantom: makeFantomPlugin,
  rsk: makeRskPlugin,
  polygon: makePolygonPlugin,
  celo: makeCeloPlugin,
  avalanche: makeAvalanchePlugin
}
