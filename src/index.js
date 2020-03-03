require('dotenv').config()
const {getImbalance} = require('./blockchainServices/internalExchange')
const {checkAndApprove} = require('./blockchainServices/tokenServices')
const {RERUNTIME} = require('./configurations')

const main = async () => {
    await checkAndApprove()
    getImbalance()
}

main()
setInterval(main, RERUNTIME)