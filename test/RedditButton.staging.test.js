const { assert, expect } = require("chai");
const { network, ethers } = require("hardhat");
const { developmentChains } = require("../hardhat.config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("RedditButton staging tests", async function () {
      let redditButton;
      let owner;
      let accounts;
      let redditButtonConnectedContract;
      const fundersNumber = 3;
      const sendValue = ethers.utils.parseEther("0.0001");
      beforeEach(async function () {
        accounts = await ethers.getSigners();
        owner = accounts[0];
        const RedditButton = await ethers.getContractFactory("RedditButton");
        // redditButton = await RedditButton.attach(
        //   "0x36f8dc68a16f318EA1d392Dc4588a4D0A760350c"
        // );
        redditButton = await RedditButton.deploy();
        await redditButton.deployed();
        console.log(
          `RedditButton contract is deployed to ${redditButton.address}`
        );
      });
      it("allows people to press button and claim treasure", async function () {
        await redditButton.start();
        // const gasLimit = (await ethers.provider.getBlock("latest")).gasLimit;
        // console.log(`gasLimit: ${gasLimit}`);
        for (i = 1; i <= fundersNumber; i++) {
          redditButtonConnectedContract = await redditButton.connect(
            accounts[i]
          );
          console.log(`accounts[${i}]: ${accounts[i].address}`);
          const transactionResponse =
            await redditButtonConnectedContract.pressButton({
              value: sendValue, // sendValue.toNumber(),
              gasLimit: 210000,
            });
          const transactionReceipt = await transactionResponse.wait();
          console.log(
            "-------accounts[" +
              i +
              "].sendTransaction transactionReceipt:" +
              transactionReceipt
          );
          let latestBlock = await hre.ethers.provider.getBlock("latest");
          console.log(latestBlock.number);
        }
        const afterPressBalance = await redditButton.provider.getBalance(
          redditButton.address
        );
        assert.equal(afterPressBalance, sendValue.mul(3).toNumber());
        // Needed when testing in Ganache
        // for (let index = 0; index < 4; index++) {
        //   await ethers.provider.send("evm_mine");
        // }
        let afterPressBlock = await hre.ethers.provider.getBlock("latest");
        console.log(`afterPressBlock.number = ${afterPressBlock.number}`);

        function timeout(ms) {
          return new Promise((resolve) => setTimeout(resolve, ms));
        }
        await timeout(60000);
        console.log("Waited 60s");

        let afterWaitBlock = await hre.ethers.provider.getBlock("latest");
        console.log(`afterWaitBlock.number = ${afterWaitBlock.number}`);
        const transactionResponse =
          await redditButtonConnectedContract.claimTreasure({
            gasLimit: 210000,
          });
        const transactionReceipt = await transactionResponse.wait();
        console.log(
          "-------accounts[3].claimTreasure transactionReceipt:" +
            transactionReceipt
        );
        const endingBalance = await redditButton.provider.getBalance(
          redditButton.address
        );
        // Assert
        assert.equal(endingBalance, 0);
      });
      it("allows people to send money acting like press button", async function () {
        await redditButton.start();
        // Transfer sendValue from accounts[1] to redditButton contract, to act like pressButton
        // const gasLimit = (await ethers.provider.getBlock("latest")).gasLimit;
        // console.log(`gasLimit: ${gasLimit}`);
        const transactionResponse = await accounts[1].sendTransaction({
          to: redditButton.address,
          value: sendValue,
          // nonce: await ethers.provider.getTransactionCount(accounts[1].address),
          gasLimit: 210000,
        });
        const transactionReceipt = await transactionResponse.wait();
        console.log(
          "-------accounts[1].sendTransaction transactionReceipt:" +
            transactionReceipt
        );
        expect(
          await redditButton.provider.getBalance(redditButton.address)
        ).to.equal(sendValue);
        await expect(transactionResponse)
          .to.emit(redditButton, "Transfer")
          .withArgs(accounts[1].address, redditButton.address, sendValue);
        const lastFunder = await redditButton.lastFunder();
        assert.equal(lastFunder.toString(), accounts[1].address);
      });
    });
