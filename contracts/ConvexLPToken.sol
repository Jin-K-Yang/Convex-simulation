// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ConvexLPToken is ERC20("ConvexLPToken", "CLPT"), AccessControl {
    bytes32 public constant OPERATOR = keccak256("OPERATOR");

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    function mint(address _to, uint256 _amount) external {
        require(hasRole(OPERATOR, msg.sender), "not authorized!");

        _mint(_to, _amount);
    }

    function burn(address _from, uint256 _amount) external {
        require(hasRole(OPERATOR, msg.sender), "not authorized!");

        _burn(_from, _amount);
    }
}
