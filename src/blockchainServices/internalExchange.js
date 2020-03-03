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
    const [imbalanceAmount, isAssetImbalance] = await futreSwapInstance.calculateImbalance()
    console.log(imbalanceAmount.toString())
    console.log(isAssetImbalance)
    // const constants = await futreSwapInstance.constants()
    // console.log({constants})
    const imbalanceMultiplier = ethers.utils.bigNumberify("101")
    const {amountToPay, profitAmount} = await calculateImbalanceAmount(imbalanceAmount, isAssetImbalance, imbalanceMultiplier)
    if (profitAmount >= MIN_PROFIT) {
    if (isAssetImbalance) {
        await tradeInStable(amountToPay)
    } else {
        await tradeInAsset(amountToPay)
    }
    } else {
        logger.log("info", "Check Ran Not enough imbalance")
    }
  }

  const tradeInStable = async (amountToPay) => {
      const balanceOfStable = await getBalanceStable()
      const amount = balanceOfStable < amountToPay ? balanceOfStable : amountToPay
      const tx = await futreSwapInstance.internalExchange(amount, false, {
          gasPrice: GAS_PRICE
      })
      logger.log("info", {message: "traded in stable", tx})
  }

  const tradeInAsset = async (amountToPay) => {
      const balanceOfAsset = await getBalanceAsset()
      const amount = balanceOfAsset < amountToPay ? balanceOfAsset : amountToPay
      const tx = await futreSwapInstance.internalExchange(amount, true, {
        gasPrice: GAS_PRICE
      })
      logger.log("info", {message: "traded in asset", tx})

  }

  const calculateImbalanceAmount = async (imbalanceAmount, isAssetImbalance, imbalanceMultiplier) => {
    const traderPays = imbalanceAmount.mul(imbalanceMultiplier).div(100).div(2)
    const traderProfit = imbalanceAmount.sub(traderPays.mul(2))
    const traderRecieves = traderPays.add(traderProfit)
    const oneEther = ethers.utils.bigNumberify("1000000000000000000")
    const buyAssetRatio = traderRecieves.mul(oneEther).div(traderPays)
    const amountToPay = imbalanceAmount.sub(imbalanceAmount.mul(buyAssetRatio).div(oneEther)).mul(15)
    const imbalanceSide = isAssetImbalance ? false : true
    const recieveAmount = await futreSwapInstance.getImbalance(imbalanceSide, amountToPay)
    const profitAmount = recieveAmount.sub(amountToPay)
    return {amountToPay, profitAmount}

  }

  module.exports = {
      getImbalance
  }