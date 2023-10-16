// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Inheritance {
    uint public withdrawTime;
    address payable public owner;
    address payable public heir;

    event Withdrawal(uint amount, uint when, address to);
    event WithdrawalTimeIncrease(uint newWithdrawTime);
    event HeirChange(address newheir);

    constructor(address _heir) payable {
        owner = payable(msg.sender);
        heir = payable(_heir);
        withdrawTime = block.timestamp + 30 days;
    }

    function deposit() public payable {}

    function withdraw(uint _amount) public {
        require(msg.sender == owner, "You aren't the owner");

        require(
            _amount <= address(this).balance,
            "You can't withdraw more than the contract has"
        );

        withdrawTime = block.timestamp + 30 days;
        emit WithdrawalTimeIncrease(withdrawTime);
        emit Withdrawal(_amount, block.timestamp, owner);
        owner.transfer(_amount);
    }

    function takeControl(address _heir) public payable {
        require(msg.sender == heir, "You aren't the heir");
        require(withdrawTime < block.timestamp, "You can't take control yet");
        require(_heir != heir, "Owner can't be heir");
        owner = payable(heir);
        heir = payable(_heir);
        withdrawTime = block.timestamp + 30 days;
        emit WithdrawalTimeIncrease(withdrawTime);
        emit HeirChange(heir);
    }
}
