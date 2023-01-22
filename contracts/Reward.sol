// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

interface IDeposit {
    function withdrawTo(uint256, address) external;
}

contract Reward is AccessControlEnumerable {
    using SafeERC20 for IERC20;

    bytes32 public constant OPERATOR = keccak256("OPERATOR");
    mapping(address => uint256) private _balances;
    address public ConvexLPToken;

    event Staked(address indexed _for, uint256 _amount);
    event Withdraw(address indexed _for, uint256 _amount);

    constructor(address _ConvexLPToken) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        ConvexLPToken = _ConvexLPToken;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function stakeFor(address _for, uint256 _amount) public returns (bool) {
        _balances[_for] += _amount;

        IERC20(ConvexLPToken).safeTransferFrom(
            msg.sender,
            address(this),
            _amount
        );

        emit Staked(_for, _amount);

        return true;
    }

    function withdraw(uint256 amount) public returns (bool) {
        _balances[msg.sender] -= amount;

        address operator = getRoleMember(OPERATOR, 0);
        IDeposit(operator).withdrawTo(amount, msg.sender);

        emit Withdraw(msg.sender, amount);

        return true;
    }
}
