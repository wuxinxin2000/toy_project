const { assert, expect } = require("chai");
const { network, ethers } = require("hardhat");
const { developmentChains } = require("../hardhat.config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("RedditButton", function () {
      let redditButton;
      let owner;
      const sendValue = ethers.utils.parseEther("0.001");
      let accounts;
      beforeEach(async () => {
        accounts = await ethers.getSigners();
        owner = accounts[0];
        // const RedditButton = await ethers.getContractFactory("RedditButton");
        // redditButton = await RedditButton.deploy();
        redditButton = await (
          await ethers.getContractFactory("RedditButton")
        ).deploy();
        // await redditButton.deployed();
      });
      describe("start", function () {
        it("Emit Start", async () => {
          await expect(redditButton.start()).to.emit(redditButton, "Start");
        });
        it("Fails if start again", async () => {
          await redditButton.start();
          await expect(redditButton.start()).to.be.revertedWith("started");
        });
        it("Fails if not owner", async () => {
          const redditButtonConnectedContract = await redditButton.connect(
            accounts[1]
          );
          await expect(
            redditButtonConnectedContract.start()
          ).to.be.revertedWith("not owner");
        });
        it("Claim treasure before start", async () => {
          await expect(redditButton.claimTreasure()).to.be.revertedWith(
            "not started"
          );
        });
      });
      describe("pressButton", function () {
        beforeEach(async () => {
          await redditButton.start();
        });
        // https://ethereum-waffle.readthedocs.io/en/latest/matchers.html
        // could also do assert.fail
        it("Fails if you don't send enough ETH", async () => {
          await expect(
            redditButton.pressButton({ value: 1000 })
          ).to.be.revertedWith("Need at least 1000 gwei.");
        });
        it("Updates the amount funded data structure", async () => {
          const redditButtonConnectedContract = await redditButton.connect(
            accounts[1]
          );
          let res = await redditButtonConnectedContract.pressButton({
            value: sendValue,
          });
          await expect(res)
            .to.emit(redditButtonConnectedContract, "Transfer")
            .withArgs(accounts[1].address, redditButton.address, sendValue);
          const afterPressButtonBalance =
            await redditButton.provider.getBalance(redditButton.address);
          assert.equal((await redditButton.owner()).toString(), owner.address);
          assert.equal(
            afterPressButtonBalance.toString(),
            sendValue.toString()
          );
          const lastFunder = await redditButton.lastFunder();
          assert.equal(lastFunder.toString(), accounts[1].address);
        });
      });
      describe("claimTreasure", function () {
        const fundersNumber = 3;
        let redditButtonConnectedContract;
        let lastFundBlockNumber;
        beforeEach(async () => {
          // Arrange
          await redditButton.start();
          const accounts = await ethers.getSigners();
          for (i = 1; i <= fundersNumber; i++) {
            redditButtonConnectedContract = await redditButton.connect(
              accounts[i]
            );
            await redditButtonConnectedContract.pressButton({
              value: sendValue,
            });
          }
          lastFundBlockNumber =
            await redditButtonConnectedContract.lastFundBlockNumber();
        });
        it("Not last funder", async () => {
          await expect(redditButton.claimTreasure()).to.be.revertedWith(
            // "NOT the last funder calling press_button"
            "RedditButton__NotLastFunder()"
          );
        });
        it("Wait not long enough", async () => {
          const redditButtonConnectedContract = await redditButton.connect(
            accounts[fundersNumber]
          );
          await expect(
            redditButtonConnectedContract.claimTreasure()
          ).to.be.revertedWith(
            // "Wait not long enough"
            "RedditButton__Not3BlocksAway()"
          );
        });
        it("Last funder claims treasure after 3 blocks away", async () => {
          let latestBlock = await hre.ethers.provider.getBlock("latest");
          console.log(latestBlock.number);
          assert.equal(lastFundBlockNumber.toString(), latestBlock.number);
          for (let index = 0; index < 4; index++) {
            await ethers.provider.send("evm_mine");
          }
          latestBlock = await hre.ethers.provider.getBlock("latest");
          console.log(latestBlock.number);

          const startingBalance = await redditButton.provider.getBalance(
            redditButton.address
          );
          console.log(`startingBalance: ${startingBalance}`);
          const startingLastFunderBalance =
            await redditButton.provider.getBalance(
              accounts[fundersNumber].address
            );
          console.log(
            `startingLastFunderBalance: ${startingLastFunderBalance}`
          );

          const transactionResponse =
            await redditButtonConnectedContract.claimTreasure();
          await expect(transactionResponse)
            .to.emit(redditButtonConnectedContract, "ClaimTreasure")
            .withArgs(
              accounts[fundersNumber].address,
              sendValue.mul(fundersNumber).toString()
            );
          const transactionReceipt = await transactionResponse.wait();
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          console.log(`GasCost: ${gasCost}`);
          console.log(`GasUsed: ${gasUsed}`);
          console.log(`GasPrice: ${effectiveGasPrice}`);

          const endingBalance = await redditButton.provider.getBalance(
            redditButton.address
          );
          console.log(`endingBalance: ${endingBalance}`);
          const endingLastFunderBalance =
            await redditButton.provider.getBalance(
              accounts[fundersNumber].address
            );
          console.log(`endingLastFunderBalance: ${endingLastFunderBalance}`);

          // Assert
          assert.equal(endingBalance, 0);
          assert.equal(
            startingBalance.add(startingLastFunderBalance).toString(),
            endingLastFunderBalance.add(gasCost).toString()
          );

          await expect(
            redditButtonConnectedContract.start()
          ).to.be.revertedWith("not owner");
          await expect(
            redditButtonConnectedContract.claimTreasure()
          ).to.be.revertedWith("not started");
          await expect(
            redditButtonConnectedContract.pressButton({
              value: sendValue,
            })
          ).to.be.revertedWith("not started");
          redditButton.start();
          await expect(
            redditButtonConnectedContract.claimTreasure()
          ).to.be.revertedWith("RedditButton__NotHaveEnoughFund()");
        });
      });

      describe("fallback", function () {
        it("Transfering money acts as pressButton", async () => {
          await redditButton.start();
          // Transfer sendValue from accounts[1] to redditButton contract, to act like pressButton
          const res = await accounts[1].sendTransaction({
            to: redditButton.address,
            value: sendValue,
            gasLimit: (await ethers.provider.getBlock("latest")).gasLimit,
          });
          expect(
            await redditButton.provider.getBalance(redditButton.address)
          ).to.equal(sendValue);
          // const afterPressButtonBalance =
          //   await redditButton.provider.getBalance(redditButton.address);
          // assert.equal(
          //   afterPressButtonBalance.toString(),
          //   sendValue.toString()
          // );
          await expect(res)
            .to.emit(redditButton, "Transfer")
            .withArgs(accounts[1].address, redditButton.address, sendValue);
          const lastFunder = await redditButton.lastFunder();
          assert.equal(lastFunder.toString(), accounts[1].address);
        });
        it("Calling non-existing function acts as pressButton", async () => {
          const nonExistentFuncSignature = "nonExistentFunction()";
          const fakeRedditButton = new ethers.Contract(
            redditButton.address,
            [
              ...redditButton.interface.fragments,
              `function ${nonExistentFuncSignature} external payable`,
            ],
            owner
          );
          await redditButton.start();
          const res = await (await fakeRedditButton.connect(accounts[1]))[
            nonExistentFuncSignature
          ]({
            value: sendValue,
          });
          expect(
            await redditButton.provider.getBalance(redditButton.address)
          ).to.equal(sendValue);
          await expect(res)
            .to.emit(redditButton, "Transfer")
            .withArgs(accounts[1].address, redditButton.address, sendValue);
          const lastFunder = await redditButton.lastFunder();
          assert.equal(lastFunder.toString(), accounts[1].address);
        });
      });
    });
