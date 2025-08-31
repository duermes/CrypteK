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

contract TipRouterTest is Test {
    TipRouter public tipRouter;
    MockERC20 public mockToken;

    address public sender = address(0x1);
    address public receiver = address(0x2);
    uint256 public messageId = 123;
    uint256 public tipAmount = 100;

    function setUp() public {
        tipRouter = new TipRouter();
        mockToken = new MockERC20();

        // Mint tokens to sender
        mockToken.mint(sender, 1000);

        // Approve TipRouter to spend tokens
        vm.prank(sender);
        mockToken.approve(address(tipRouter), 1000);
    }

    function testTipERC20() public {
        uint256 initialBalanceSender = mockToken.balanceOf(sender);
        uint256 initialBalanceReceiver = mockToken.balanceOf(receiver);

        vm.expectEmit(true, true, true, true);
        emit TipRouter.Tipped(messageId, address(mockToken), sender, receiver, tipAmount);

        vm.prank(sender);
        tipRouter.tipERC20(messageId, address(mockToken), receiver, tipAmount);

        assertEq(mockToken.balanceOf(sender), initialBalanceSender - tipAmount);
        assertEq(mockToken.balanceOf(receiver), initialBalanceReceiver + tipAmount);
    }

    function testTipWithoutApproval() public {
        // Create new token without approval
        MockERC20 newToken = new MockERC20();
        newToken.mint(sender, 1000);

        vm.prank(sender);
        vm.expectRevert("insufficient allowance");
        tipRouter.tipERC20(messageId, address(newToken), receiver, tipAmount);
    }

    function testTipInsufficientBalance() public {
        uint256 largeAmount = 2000; // More than sender has

        vm.prank(sender);
        vm.expectRevert("insufficient balance");
        tipRouter.tipERC20(messageId, address(mockToken), receiver, largeAmount);
    }

    function testTipZeroAmount() public {
        vm.prank(sender);
        tipRouter.tipERC20(messageId, address(mockToken), receiver, 0);

        // Should not revert and emit event
        assertEq(mockToken.balanceOf(sender), 1000);
        assertEq(mockToken.balanceOf(receiver), 0);
    }

    function testTipToSelf() public {
        vm.prank(sender);
        tipRouter.tipERC20(messageId, address(mockToken), sender, tipAmount);

        // Balance should remain the same
        assertEq(mockToken.balanceOf(sender), 1000);
    }

    function testMultipleTips() public {
        vm.prank(sender);
        tipRouter.tipERC20(messageId, address(mockToken), receiver, 50);

        vm.prank(sender);
        tipRouter.tipERC20(messageId + 1, address(mockToken), receiver, 30);

        assertEq(mockToken.balanceOf(sender), 1000 - 50 - 30);
        assertEq(mockToken.balanceOf(receiver), 50 + 30);
    }
}
