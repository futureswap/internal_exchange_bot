const { ethers } = require("ethers");
const {
    FUTURESWAP_ADDRESS,
    NETWORK,
    GAS_PRICE,
    MIN_PROFIT
  } = require("../configurations");
const { FUTURESWAP_ABI } = require("../ABI")
const {logger} = require('../logging')
const {getBalanceAsset, getBalanceStable} = require('./tokenServices')

  const provider = new ethers.getDefaultProvider(NETWORK);

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const futreSwap = new ethers.Contract(FUTURESWAP_ADDRESS, FUTURESWAP_ABI, provider)
  const futreSwapInstance = futreSwap.connect(wallet)


  const getImbalance = async () => {
    const [amountToPay, poolNeedsAsset] = await futreSwapInstance.calculateImbalance()
    const constants = await futreSwapInstance.constants()
    const imbalanceMultiplier = constants.imbalanceMultiplier
    const stablePrice = await futreSwapInstance.getStableTokenPrice()
    const assetPrice = await futreSwapInstance.getAssetTokenPrice()
    const profitAmount = await calculateImbalanceAmount(amountToPay, poolNeedsAsset, imbalanceMultiplier, stablePrice, assetPrice)
    console.log({profitAmount})
    if (profitAmount >= MIN_PROFIT) {
    if (poolNeedsAsset) {
      await tradeInAsset(amountToPay)
    } else {
      await tradeInStable(amountToPay)
    }
    } else {
        logger.log("info", "Check Ran Not enough imbalance")
    }
  }

  const tradeInStable = async (amountToPay) => {
      const balanceOfStable = await getBalanceStable()
      const amount = Number(balanceOfStable) < Number(amountToPay) ? balanceOfStable : amountToPay
      const tx = await futreSwapInstance.internalExchange(amount, false, {
          gasPrice: GAS_PRICE
      })
      logger.log("info", {message: "traded in stable", tx})
  }

  const tradeInAsset = async (amountToPay) => {
      const balanceOfAsset = await getBalanceAsset()
      const amount = Number(balanceOfAsset) < Number(amountToPay) ? balanceOfAsset : amountToPay
      const tx = await futreSwapInstance.internalExchange(amount, true, {
        gasPrice: GAS_PRICE
      })
      logger.log("info", {message: "traded in asset", tx})

  }

  const calculateImbalanceAmount = async (amountToPay, poolNeedsAsset, imbalanceMultiplier, stablePrice, assetPrice) => {
    let valueReturned
    let valueToPay 
    if (poolNeedsAsset) {
     valueReturned =
      (amountToPay * assetPrice * (imbalanceMultiplier / 1000) / 1e18);
      valueToPay = amountToPay * assetPrice / 1e18
    } else {
      valueReturned =
        (amountToPay * stablePrice * (imbalanceMultiplier / 1000) / 1e18);
          valueToPay = amountToPay * stablePrice / 1e18
    }
    const profitAmount = valueReturned - valueToPay
    return profitAmount

  }

  module.exports = {
      getImbalance
  }