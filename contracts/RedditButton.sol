// SPDX-License-Identifier: MIT

pragma solidity >=0.6.6 <0.9.0;

/**
Write a contract in Solidity that is similar to The Button on reddit (r/thebutton),
 where participants pay a fixed amount of ether to call ​press_button​, and then
  if 3 blocks pass without someone calling ​press_button​, whoever pressed the button
   last can call claim_treasure​ and get the other participants’ deposits.
 */
contract RedditButton {
    uint256 currentOrderNumber;
    uint256 totalAmountFunded;
    uint256 lastCallBlockNumber;

    address payable owner;
    // // array of addresses who deposited
    // address[] public funders;
    //mapping to store which address depositeded how much ETH
    mapping(address => uint256) public addressToAmountFunded;
    //mapping to store which address depositeded how much ETH
    mapping(uint256 => address) public clickOrderToAddress;

	event Transfer(address indexed _from, address indexed _to, uint256 _value);

    constructor() {
        currentOrderNumber = 0;
        totalAmountFunded = 0;
        lastCallBlockNumber = block.number;
        owner = payable(msg.sender);
    }
    function press_button() public payable returns(bool sufficient) {
        //if not, add to mapping and funders array
        require(msg.value >= 1e18);
        addressToAmountFunded[msg.sender] += msg.value;
        totalAmountFunded += msg.value;
        currentOrderNumber += 1;
        clickOrderToAddress[currentOrderNumber] = msg.sender;
        lastCallBlockNumber = block.number;

		    emit Transfer(msg.sender, owner, msg.value);
        return true;
    }
    //modifier: https://medium.com/coinmonks/solidity-tutorial-all-about-modifiers-a86cf81c14cb
    modifier onlyLastCall3BlocksAway() {
        //is the message sender owner of the contract?
        require(block.number > lastCallBlockNumber + 3, "not long enough");
        require(msg.sender == clickOrderToAddress[currentOrderNumber], "");
        _;
    }
    function claim_treasure() public payable onlyLastCall3BlocksAway {
        uint256 temp = totalAmountFunded;
        totalAmountFunded = 0;
        for (uint256 i = 1; i <= currentOrderNumber; i++) {
            addressToAmountFunded[clickOrderToAddress[i]] = 0;
        }
        currentOrderNumber = 0;
        payable(msg.sender).transfer(temp);

        // //funders array will be initialized to 0
        // funders = new address[](0);
    }
    function get_totalAmountFunded() public view returns (uint256) {
      return totalAmountFunded;
    }
    function get_currentOrderNumber() public view returns (uint256) {
      return currentOrderNumber;
    }
    function get_lastCallBlockNumber() public view returns (uint256) {
      return lastCallBlockNumber;
    }
}