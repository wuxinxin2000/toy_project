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
        // redditButton = await RedditButton.attach("0xf4637bf2e66b1c3f560bb6420e9ef1be900b3331");
        redditButton = await (
          await ethers.getContractFactory("RedditButton")
        ).deploy();
      });
      it("allows people to press button and claim treasure", async function () {
        await redditButton.start();
        for (i = 1; i <= fundersNumber; i++) {
          redditButtonConnectedContract = await redditButton.connect(
            accounts[i]
          );
          await redditButtonConnectedContract.pressButton({
            value: sendValue,
          });
        }
        for (let index = 0; index < 4; index++) {
          await ethers.provider.send("evm_mine");
        }
        const transactionResponse =
          await redditButtonConnectedContract.claimTreasure();
        const endingBalance = await redditButton.provider.getBalance(
          redditButton.address
        );
        // Assert
        assert.equal(endingBalance, 0);
      });
      // it("allows people to send money acting like press button", async function () {
      //   await redditButton.start();

      //   // Transfer sendValue from accounts[1] to redditButton contract, to act like pressButton
      //   await redditButton
      //     .connect(accounts[1])
      //     .transfer(redditButton.address, sendValue);
      //   expect(await redditButton.balanceOf(redditButton.address)).to.equal(
      //     sendValue
      //   );
      //   await expect(res)
      //     .to.emit(redditButton, "Transfer")
      //     .withArgs(accounts[1].address, redditButton.address, sendValue);
      //   const afterPressButtonBalance =
      //     await redditButton.provider.getBalance(redditButton.address);
      //   assert.equal(
      //     afterPressButtonBalance.toString(),
      //     sendValue.toString()
      //   );
      //   const lastFunder = await redditButton.lastFunder();
      //   assert.equal(lastFunder.toString(), accounts[1].address);
      // });
    });
