require('dotenv').config()
const {getImbalance} = require('./blockchainServices/internalExchange')
const {checkAndApprove} = require('./blockchainServices/approval')

const main = async () => {
    await checkAndApprove()
    getImbalance()
}

main()