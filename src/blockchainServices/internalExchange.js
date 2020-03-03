const { ethers } = require("ethers");
const {
    FUTURESWAP_ADDRESS,
    NETWORK,
    GAS_PRICE,
    MIN_PROFIT
  } = require("../configurations");
//   const { DAI_ADDRESS, CHAINLINK_ADDRESS} = require("../constants")
  const { FUTURESWAP_ABI } = require("../ABI")
  const {logger} = require('../logging')

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
        await tradeInAsset(amountToPay)
    } else {
        await tradeInStable(amountToPay)
    }
    } else {
        logger.log("info", "Check Ran Not enough imbalance")
    }
  }

  const tradeInAsset = async (imbalanceAmount) => {
      console.log("tradeinasset")
      const tx = await futreSwapInstance.internalExchange(imbalanceAmount, false, {
          gasPrice: GAS_PRICE
      })
      logger.log("info", tx)

  }

  const tradeInStable = async (imbalanceAmount) => {
      console.log("trade instable")
      const tx = await futreSwapInstance.internalExchange(imbalanceAmount, true, {
        gasPrice: GAS_PRICE
      })
      logger.log("info", tx)

  }

  const calculateImbalanceAmount = async (imbalanceAmount, isAssetImbalance, imbalanceMultiplier) => {
    const traderPays = imbalanceAmount.mul(imbalanceMultiplier).div(100).div(2)
    const traderProfit = imbalanceAmount.sub(traderPays.mul(2))
    const traderRecieves = traderPays.add(traderProfit)
    const oneEther = ethers.utils.bigNumberify("1000000000000000000")
    const buyAssetRatio = traderRecieves.mul(oneEther).div(traderPays)
    console.log({buyAssetRatio: buyAssetRatio.toString()})
    const amountToPay = imbalanceAmount.sub(imbalanceAmount.mul(buyAssetRatio).div(oneEther)).mul(15)
    console.log({amountToPay: amountToPay.toString()})
    const imbalanceSide = isAssetImbalance ? false : true
    const recieveAmount = await futreSwapInstance.getImbalance(imbalanceSide, amountToPay)
    const profitAmount = recieveAmount.sub(amountToPay)
    console.log({profitAmount: profitAmount.toString()})
    return {amountToPay, profitAmount}

  }

  module.exports = {
      getImbalance
  }