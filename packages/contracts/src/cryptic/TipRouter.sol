// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
interface IERC20 { function transferFrom(address,address,uint256) external returns (bool); }
contract TipRouter {
    event Tipped(uint256 indexed messageId, address indexed token, address indexed from, address to, uint256 amount);
    function tipERC20(uint256 messageId, address token, address to, uint256 amount) external {
        require(IERC20(token).transferFrom(msg.sender, to, amount), "transfer failed");
        emit Tipped(messageId, token, msg.sender, to, amount);
    }
}
