# A toy Hardhat Project

This project demonstrates a toy project developed in Hardhat. It comes with a contract, a test for that contract, and a script that deploys that contract to hardhat node.

The contract is similar to The Button on reddit (r/thebutton):
Participants pay an amount of ether(at least 1 ETH) to call "pressButton";
if 3 blocks pass without someone calling "pressButton", whoever pressed the button
last can call "claimTreasure" and get the other participants’ deposits.


Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```
