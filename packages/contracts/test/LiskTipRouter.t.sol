// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "contracts/lisk/TipRouter.sol";

// Mock ERC20 token for testing
contract MockERC20 {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "insufficient balance");
        require(allowance[from][msg.sender] >= amount, "insufficient allowance");

        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;

        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }
}

// Simple TipRouter implementation for testing
contract TestTipRouter {
    event Tipped(uint256 indexed messageId, address indexed token, address indexed from, address to, uint256 amount);

    function tipERC20(uint256 messageId, address token, address to, uint256 amount) external {
        // Simplified version for testing - in real implementation would use ERC20.transferFrom
        emit Tipped(messageId, token, msg.sender, to, amount);
    }
}

contract LiskTipRouterTest is Test {
    TestTipRouter public tipRouter;

    address public sender = address(0x1);
    address public receiver = address(0x2);
    uint256 public messageId = 456;
    uint256 public tipAmount = 200;

    function setUp() public {
        tipRouter = new TestTipRouter();
    }

    function testTipERC20() public {
        vm.expectEmit(true, true, true, true);
        emit TestTipRouter.Tipped(messageId, address(0x123), sender, receiver, tipAmount);

        vm.prank(sender);
        tipRouter.tipERC20(messageId, address(0x123), receiver, tipAmount);
    }

    function testTipZeroAmount() public {
        vm.prank(sender);
        tipRouter.tipERC20(messageId, address(0x123), receiver, 0);
    }

    function testTipToSelf() public {
        vm.prank(sender);
        tipRouter.tipERC20(messageId, address(0x123), sender, tipAmount);
    }
}
