require('dotenv').config()
const {getImbalance} = require('./blockchainServices/internalExchange')
const {checkAndApprove} = require('./blockchainServices/tokenServices')
const {RERUNTIME} = require('./configurations')

if (!process.env.PRIVATE_KEY) {
    throw new Error('No private key detected')
  }    
  
const main = async () => {
    await checkAndApprove()
    getImbalance()
}

main()
setInterval(main, RERUNTIME)