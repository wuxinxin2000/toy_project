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
      const sendValue = ethers.utils.parseEther("1");
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
    });
