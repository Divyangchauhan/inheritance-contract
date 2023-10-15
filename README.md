# Inheritance Smart Contract

This project implements an inheritance smart contract using solidity. Currently it has configuration to run tests and deploy to local hardhat network and interact with it using scripts in scripts folder.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
npx hardhat run scripts/deposit-ether.ts
npx hardhat run scripts/withdraw-ether.ts
```

Before running deposit-ether.ts or withdraw-ether.ts, make sure to update the contract address in the .env file.
