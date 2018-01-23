/**
 * Created by paul on 8/26/17.
 * @flow
 */

import type { EthereumFees, EthereumFee, EthereumCalcedFees } from './ethTypes.js'
import type { AbcSpendInfo } from 'airbitz-core-types'
import { normalizeAddress } from './ethUtils.js'
import { bns } from 'biggystring'

export const ES_FEE_LOW = 'low'
export const ES_FEE_STANDARD = 'standard'
export const ES_FEE_HIGH = 'high'
export const ES_FEE_CUSTOM = 'custom'

export function calcMiningFee (spendInfo: AbcSpendInfo, networkFees: EthereumFees): EthereumCalcedFees {
  if (spendInfo.spendTargets && spendInfo.spendTargets.length && spendInfo.spendTargets[0].publicAddress) {
    const { customNetworkFee } = spendInfo.customNetworkFee || {}
    if (spendInfo.networkFeeOption === ES_FEE_CUSTOM && customNetworkFee) {
      const { gasLimit, gasPrice } = customNetworkFee
      if (gasLimit && bns.gt(gasLimit, '0') && gasPrice && bns.gt(gasPrice, '0')) return { gasLimit, gasPrice }
    }
    const targetAddress = normalizeAddress(spendInfo.spendTargets[0].publicAddress)
    let networkFeeForGasPrice:EthereumFee = networkFees['default']
    let networkFeeForGasLimit:EthereumFee = networkFees['default']

    if (typeof networkFees[targetAddress] !== 'undefined') {
      networkFeeForGasLimit = networkFees[targetAddress]
      if (typeof networkFeeForGasLimit.gasPrice !== 'undefined') {
        networkFeeForGasPrice = networkFeeForGasLimit
      }
    }

    let useLimit = 'regularTransaction'
    if (spendInfo.currencyCode && spendInfo.currencyCode !== 'ETH') {
      useLimit = 'tokenTransaction'
    }

    let networkFeeOption = 'standard'
    if (typeof spendInfo.networkFeeOption === 'string') {
      networkFeeOption = spendInfo.networkFeeOption
    }

    const gasLimit = networkFeeForGasLimit.gasLimit[useLimit]
    let gasPrice = ''
    if (!spendInfo.spendTargets[0].nativeAmount) {
      throw new Error('ErrorInvalidNativeAmount')
    }
    let nativeAmount = spendInfo.spendTargets[0].nativeAmount
    if (useLimit === 'tokenTransaction') {
      // Small hack. Abctimate the relative value of token to ethereum as 10%
      nativeAmount = bns.div(nativeAmount, '10')
    }
    if (!networkFeeForGasPrice.gasPrice) {
      throw new Error('ErrorInvalidGasPrice')
    }
    const gasPriceObj = networkFeeForGasPrice.gasPrice
    switch (networkFeeOption) {
      case ES_FEE_LOW:
        gasPrice = gasPriceObj.lowFee
        break
      case ES_FEE_STANDARD:
        if (bns.gte(nativeAmount, networkFeeForGasPrice.gasPrice.standardFeeHighAmount)) {
          gasPrice = gasPriceObj.standardFeeHigh
          break
        }
        if (bns.lte(nativeAmount, gasPriceObj.standardFeeLowAmount)) {
          if (!networkFeeForGasPrice.gasPrice) {
            throw new Error('ErrorInvalidGasPrice')
          }
          gasPrice = networkFeeForGasPrice.gasPrice.standardFeeLow
          break
        }

        // Scale the fee by the amount the user is sending scaled between standardFeeLowAmount and standardFeeHighAmount
        const lowHighAmountDiff = bns.sub(gasPriceObj.standardFeeHighAmount, gasPriceObj.standardFeeLowAmount)
        const lowHighFeeDiff = bns.sub(gasPriceObj.standardFeeHigh, gasPriceObj.standardFeeLow)

        // How much above the lowFeeAmount is the user sending
        const amountDiffFromLow = bns.sub(nativeAmount, gasPriceObj.standardFeeLowAmount)

        // Add this much to the low fee = (amountDiffFromLow * lowHighFeeDiff) / lowHighAmountDiff)
        const temp1 = bns.mul(amountDiffFromLow, lowHighFeeDiff)
        const addFeeToLow = bns.div(temp1, lowHighAmountDiff)
        gasPrice = bns.add(gasPriceObj.standardFeeLow, addFeeToLow)
        break
      case ES_FEE_HIGH:
        gasPrice = networkFeeForGasPrice.gasPrice.highFee
        break
      default:
        throw new Error(`Invalid networkFeeOption: ${networkFeeOption}, And/Or customNetworkFee: ${customNetworkFee}`)
    }
    const out: EthereumCalcedFees = { gasLimit, gasPrice }
    return out
  } else {
    throw new Error('ErrorInvalidSpendInfo')
  }
}
