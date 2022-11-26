// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

contract RedditButton {
    // uint256 public totalAmountFunded;  // the same as contract balance
    uint256 public lastFundBlockNumber;
    // The owner can use started to control whether start a new round of game.
    bool public started;

    address payable public immutable owner;
    address public lastFunder;

    event Start();
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event ClaimTreasure(address winner, uint amount);

    constructor() {
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
    //modifier: https://medium.com/coinmonks/solidity-tutorial-all-about-modifiers-a86cf81c14cb
    modifier onlyStarted() {
        require(started, "not started");
        _;
    }
    modifier onlyLastFunder3BlocksAway() {
        // require(msg.sender == clickOrderToAddress[currentOrderNumber], "NOT the last funder of press_button");
        // require(block.number > lastFundBlockNumber + 3, "Wait not long enough");
        if (msg.sender != lastFunder) revert('RedditButton__NotLastFunder()');
        if (block.number <= lastFundBlockNumber + 3) revert('RedditButton__Not3BlocksAway()');
        _;
    }

    function _pressButton() private onlyStarted returns(bool sufficient) {
        require(msg.value >= 1e12, "Need at least 1000 gwei.");
	      emit Transfer(msg.sender, address(this), msg.value);
        lastFunder = msg.sender;
        lastFundBlockNumber = block.number;
        return true;
    }

    function pressButton() external payable returns(bool sufficient) {
        return _pressButton();
    }

    function claimTreasure() public payable onlyStarted onlyLastFunder3BlocksAway {
        uint256 contractBalance = address(this).balance;
        if (contractBalance == 0) revert('RedditButton__NotHaveEnoughFund()');
        payable(msg.sender).transfer(contractBalance);
        emit ClaimTreasure(msg.sender, contractBalance);
        started = false;
    }
    receive () external payable {
        // React to receiving ether
        _pressButton();
    }
    fallback () external payable {
        // React to receiving ether
        _pressButton();
    }
}