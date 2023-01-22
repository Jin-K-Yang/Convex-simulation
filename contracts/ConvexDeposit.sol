// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// staker.sol function
interface IStaker {
    function deposit(address, address) external;

    function withdraw(
        address,
        address,
        uint256
    ) external;
}

interface ITokenMinter {
    function mint(address, uint256) external;

    function burn(address, uint256) external;
}

interface IRewards {
    function stake(address, uint256) external;

    function stakeFor(address, uint256) external;

    function withdraw(address, uint256) external;
}

contract ConvexDeposit {
    using SafeERC20 for IERC20;

    address public curveGaugeAddress;
    address public curveLPTokenAddress;
    address public convexLPTokenAddress;
    address public stakerAddress;
    address public rewardAddress;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor(
        address _curveGaugeAddress,
        address _curveLPTokenAddress,
        address _convexLPTokenAddress,
        address _stakerAddress,
        address _rewardAddress
    ) {
        curveGaugeAddress = _curveGaugeAddress;
        curveLPTokenAddress = _curveLPTokenAddress;
        convexLPTokenAddress = _convexLPTokenAddress;
        stakerAddress = _stakerAddress;
        rewardAddress = _rewardAddress;
    }

    function deposit(uint256 _amount, bool _stake) public returns (bool) {
        // send to staker.sol
        IERC20(curveLPTokenAddress).safeTransferFrom(
            msg.sender,
            stakerAddress,
            _amount
        );

        //stake
        IStaker(stakerAddress).deposit(curveLPTokenAddress, curveGaugeAddress);

        if (_stake) {
            // mint token and send to reward contract
            ITokenMinter(convexLPTokenAddress).mint(address(this), _amount);
            IERC20(convexLPTokenAddress).safeApprove(rewardAddress, _amount);
            IRewards(rewardAddress).stakeFor(msg.sender, _amount);
        } else {
            // just mint token to user
            ITokenMinter(convexLPTokenAddress).mint(msg.sender, _amount);
        }

        emit Deposited(msg.sender, _amount);

        return true;
    }

    function withdrawTo(uint256 _amount, address _to) external returns (bool) {
        require(
            msg.sender == rewardAddress,
            "not authorized, caller must be reward contract."
        );

        _withdraw(_amount, msg.sender, _to);

        return true;
    }

    function _withdraw(
        uint256 _amount,
        address _from,
        address _to
    ) private {
        // burn Convex LP Token in reward.sol
        ITokenMinter(convexLPTokenAddress).burn(_from, _amount);

        // pull Curve LP token from Curve gauge to this contract
        IStaker(stakerAddress).withdraw(
            curveLPTokenAddress,
            curveGaugeAddress,
            _amount
        );

        // return Cure LP token from this contract to user
        IERC20(curveLPTokenAddress).safeTransfer(_to, _amount);

        emit Withdrawn(_to, _amount);
    }
}
