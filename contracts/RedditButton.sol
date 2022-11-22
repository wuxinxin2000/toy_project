// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

contract RedditButton {
    uint256 totalAmountFunded;
    uint256 lastFundBlockNumber;
    bool public started;
    bool public ended;

    address payable private immutable owner;
    address private lastFunder;
    //mapping from funders to their funded amount
    // mapping(address => uint256) private addressToAmountFunded;

    event Start();
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event ClaimTreasure(address winner, uint amount);

    constructor() {
        // currentOrderNumber = 0;
        totalAmountFunded = 0;
        lastFundBlockNumber = block.number;
        owner = payable(msg.sender);
        lastFunder = address(0);
    }

    function start() external {
        require(!started, "started");
        require(msg.sender == owner, "not owner");

        started = true;
        emit Start();
    }

    function pressButton() external payable onlyStartedAndNotEnded returns(bool sufficient) {
        //if not, add to mapping and funders array
        require(msg.value >= 1e18, "Need at least 1 ETH.");
	      emit Transfer(msg.sender, owner, msg.value);
        // addressToAmountFunded[msg.sender] += msg.value;
        totalAmountFunded += msg.value;
        // currentOrderNumber += 1;
        // clickOrderToAddress[currentOrderNumber] = msg.sender;
        lastFunder = msg.sender;
        lastFundBlockNumber = block.number;

        return true;
    }
    //modifier: https://medium.com/coinmonks/solidity-tutorial-all-about-modifiers-a86cf81c14cb
    modifier onlyStartedAndNotEnded() {
        require(started, "not started");
        require(!ended, "ended");
        _;
    }
    modifier onlyLastFunder3BlocksAway() {
        // require(msg.sender == clickOrderToAddress[currentOrderNumber], "NOT the last funder of press_button");
        // require(block.number > lastFundBlockNumber + 3, "Wait not long enough");
        if (msg.sender != lastFunder) revert('RedditButton__NotLastFunder()');
        if (block.number <= lastFundBlockNumber + 3) revert('RedditButton__Not3BlocksAway()');
        _;
    }
    function claimTreasure() public payable onlyStartedAndNotEnded onlyLastFunder3BlocksAway {
        uint256 temp = totalAmountFunded;
        totalAmountFunded = 0;
        ended = true;
        payable(msg.sender).transfer(temp);
        emit ClaimTreasure(msg.sender, temp);
    }
    function getTotalAmountFunded() public view returns (uint256) {
      return totalAmountFunded;
    }
    function getLastFundBlockNumber() public view returns (uint256) {
      return lastFundBlockNumber;
    }
    function getOwner() public view returns (address) {
      return owner;
    }
    function getLastFunder() public view returns (address) {
      return lastFunder;
    }
}