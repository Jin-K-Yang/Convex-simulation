// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "hardhat/console.sol";

// Curve Gauge function
interface ICurveGauge {
    function deposit(uint256) external;

    function balanceOf(address) external view returns (uint256);

    function withdraw(uint256) external;
}

contract Staker is AccessControl {
    using SafeERC20 for IERC20;

    bytes32 public constant OPERATOR = keccak256("OPERATOR");

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    function deposit(address _token, address _gauge) external returns (bool) {
        require(hasRole(OPERATOR, msg.sender), "not authorized!");

        uint256 balance = IERC20(_token).balanceOf(address(this));
        console.log(balance);
        if (balance > 0) {
            // IERC20(_token).safeApprove(_gauge, 0);
            IERC20(_token).safeApprove(_gauge, balance);
            ICurveGauge(_gauge).deposit(balance);
        }

        return true;
    }

    function withdraw(
        address _curveLPToken,
        address _gauge,
        uint256 _amount
    ) public returns (bool) {
        require(hasRole(OPERATOR, msg.sender), "not authorized!");

        uint256 _balance = IERC20(_curveLPToken).balanceOf(address(this));
        if (_balance < _amount) {
            _amount = _withdraw(_gauge, _amount - _balance);
            _amount += _balance;
        }
        IERC20(_curveLPToken).transfer(msg.sender, _amount);

        return true;
    }

    function _withdraw(address _gauge, uint256 _amount)
        private
        returns (uint256)
    {
        ICurveGauge(_gauge).withdraw(_amount);
        return _amount;
    }
}
