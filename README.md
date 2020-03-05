# ELK bot 
* Our system requires similar values of asset and stable
* Thus as we seen an imbalance we allow for an exchange of tokens
* We pay slighltly more tokens then we would recieve
## requirements 
* NPM version 10 or greater

## .env file 
* a .env file is needed with your private key 
* recommended to remove after the bot spins up
```
PRIVATE_KEY=<your private key>

```
* If the Private key is not there the bot will not run
## configurations
* configurations are stored in the configuration.js file 
```
const FUTURESWAP_ADDRESS = "0xe0e4d3c894c31EBC0325ab2b59667286cE40582D"
const NETWORK = "rinekby"
const GAS_PRICE = 2000000000
const RERUNTIME = 180000
const GAS_PRICE_APPROVAL = 2000000000
const MIN_PROFIT = 1000000000000000000

```
* FUTURESWAP_ADDRESS 
    * Exchnage address
* NETWORK
    * target network (homestead for mainnet)
* GAS_PRICE
    * gas price in wei specifically for your trade (default 2 gwei) in wei
* GAS_PRICE_APPROVAL
    * gas price for your approval of tokens tx that is ran as the bot spins up (default 2 gwei) in wei
* RERUNTIME
    * Time between checks of exchange in ms default 3 min
* MIN_PROFIT
    * The minimium amount of profit you will make before you send a transaciton 1000000000000000000 = $1 USD
## Running
* put in desired configurations 
* put in .env file
```
$ npm install 
$ npm run start
```
* logs get written to log.txt and errors to errors.txt 
* to have a continuous view run 
```
$ tail -f log.txt
``` 