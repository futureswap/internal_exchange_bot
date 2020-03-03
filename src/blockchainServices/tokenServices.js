const { ethers } = require("ethers");
const {
    FUTURESWAP_ADDRESS,
    NETWORK,
    GAS_PRICE_APPROVAL,
  } = require("../configurations");
const { ERC20_ABI } = require("../ABI")
const {ASSET_ADDRESS, STABLE_ADDRESS} = require("../constants")
const {logger} = require("../logging")

const provider = new ethers.getDefaultProvider(NETWORK);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const stableContract = new ethers.Contract(STABLE_ADDRESS, ERC20_ABI, provider);
const assetContract = new ethers.Contract(ASSET_ADDRESS, ERC20_ABI, provider);
const stableInstance = stableContract.connect(wallet);
const assetInstance = assetContract.connect(wallet)

const ALOT_OF_TOKENS = "100000000000000000000000000000000000000000000000000000000000";
const SMALL_AMOUNT = 10000000000000000000

const checkAndApprove = async () => {
    const Stableallowance = await stableInstance.allowance(wallet.address, FUTURESWAP_ADDRESS);
    const assetAllowance = await assetInstance.allowance(wallet.address, FUTURESWAP_ADDRESS)
    if (Stableallowance < SMALL_AMOUNT) {
        logger.log('info', "starting approve stable transaction")
        const tx = await stableInstance.approve(FUTURESWAP_ADDRESS, ethers.utils.bigNumberify(ALOT_OF_TOKENS), {
            gasPrice: GAS_PRICE_APPROVAL
        })
        await provider.waitForTransaction(tx.hash)
        logger.log('info', tx)
    }
    if (assetAllowance.toString() < SMALL_AMOUNT) {
        logger.log('info', "starting approve asset transaction")
        const tx = await assetInstance.approve(FUTURESWAP_ADDRESS, ethers.utils.bigNumberify(ALOT_OF_TOKENS), {
            gasPrice: GAS_PRICE_APPROVAL
        })
        await provider.waitForTransaction(tx.hash)
        logger.log('info', tx)
    }
    
}

const getBalanceStable = async () => {
    const balanceStable = await stableInstance.balanceOf(wallet.address)
    return balanceStable
}
    
const getBalanceAsset = async () => {
    const balanceAsset = await assetInstance.balanceOf(wallet.address)
    return balanceAsset
    
}



module.exports = {
    checkAndApprove,
    getBalanceStable, 
    getBalanceAsset
}