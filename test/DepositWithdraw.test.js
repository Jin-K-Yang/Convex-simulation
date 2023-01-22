const { expect } = require("chai");
const { ethers } = require("hardhat");
const curveLPTokenABI = require("../utils/curveLPToken.json");
const curveGaugeABI = require("../utils/curveGauge.json");

describe("ConvexDeposit", function () {
  const curveGaugeAddress = "0xbFcF63294aD7105dEa65aA58F8AE5BE2D9d0952A";
  const curveLPTokenAddress = "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490";
  const userAddress = "0x88De931417d4bfB7571930C3060e74905A3C3cD1";

  const MAX_INT = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
  var OPERATOR = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("OPERATOR"));

  describe("Deposit and Withdraw", function () {
    it("Deposit and Withdraw", async function () {
      user = await ethers.getImpersonatedSigner(userAddress);

      let ConvexDeposit, convexDeposit;
      let Staker, staker;
      let ConvexLPToken, convexLPToken;
      let Reward, reward;

      // contract setup
      let curveGaugeContract = await ethers.getContractAt(curveGaugeABI, curveGaugeAddress, user);
      let curveLPTokenContract = await ethers.getContractAt(curveLPTokenABI, curveLPTokenAddress, user);

      Staker = await ethers.getContractFactory("Staker");
      staker = await Staker.deploy();
      await staker.deployed();
      console.log("Staker.sol deployed at : ", staker.address);

      ConvexLPToken = await ethers.getContractFactory("ConvexLPToken");
      convexLPToken = await ConvexLPToken.deploy();
      await convexLPToken.deployed();
      console.log("convexLPToken.sol deployed at : ", convexLPToken.address);

      Reward = await ethers.getContractFactory("Reward");
      reward = await Reward.deploy(convexLPToken.address);
      await reward.deployed();
      console.log("reward.sol deployed at : ", reward.address);

      ConvexDeposit = await ethers.getContractFactory("ConvexDeposit");
      convexDeposit = await ConvexDeposit.deploy(curveGaugeAddress, curveLPTokenAddress, convexLPToken.address, staker.address, reward.address);
      await convexDeposit.deployed();
      console.log("convexDeposit.sol deployed at : ", convexDeposit.address);

      // set authorization
      await staker.grantRole(OPERATOR, convexDeposit.address);
      await convexLPToken.grantRole(OPERATOR, convexDeposit.address);
      await reward.grantRole(OPERATOR, convexDeposit.address);

      // approve convexDeposit.sol transfer user's Curve LP tokens
      await curveLPTokenContract.approve(convexDeposit.address, ethers.BigNumber.from(MAX_INT));
      console.log("approve convexDeposit use user's money: ", await curveLPTokenContract.allowance(userAddress, convexDeposit.address));
      console.log("Curve LP Token in user account : ", await curveLPTokenContract.balanceOf(userAddress));

      // test deposit(uint256 _amount, bool_stake) in covexDeposit.sol
      console.log("\n---------------deposit 3 token-----------------\n");
      let beforeCurveLPTokenAmount = await curveLPTokenContract.balanceOf(userAddress);

      await convexDeposit.connect(user).deposit(ethers.BigNumber.from("3000000000000000000"), true);

      let afterCurveLPTokenAmount = await curveLPTokenContract.balanceOf(userAddress);
      expect(afterCurveLPTokenAmount).to.lessThanOrEqual(beforeCurveLPTokenAmount);

      console.log("balanceOf(staker) in curveGaugeContract : ", await curveGaugeContract.balanceOf(staker.address));
      console.log("balanceOf(user) in reward.sol : ", await reward.balanceOf(userAddress));
      console.log("Curve LP Token in user account : ", await curveLPTokenContract.balanceOf(userAddress));

      // test withdraw in reward.sol
      console.log("\n---------------withdraw 1 token-----------------\n");

      await reward.connect(user).withdraw(ethers.BigNumber.from("1000000000000000000"));
      console.log("balanceOf(staker) in curveGaugeContract : ", await curveGaugeContract.balanceOf(staker.address));
      console.log("balanceOf(user) in reward.sol : ", await reward.balanceOf(userAddress));
      console.log("Curve LP Token in user account : ", await curveLPTokenContract.balanceOf(userAddress));

      // test deposit(uint256 _amount, bool_stake) in covexDeposit.sol
      console.log("\n---------------deposit 3 token-----------------\n");
      beforeCurveLPTokenAmount = await curveLPTokenContract.balanceOf(userAddress);

      await convexDeposit.connect(user).deposit(ethers.BigNumber.from("3000000000000000000"), true);

      afterCurveLPTokenAmount = await curveLPTokenContract.balanceOf(userAddress);
      expect(afterCurveLPTokenAmount).to.lessThanOrEqual(beforeCurveLPTokenAmount);

      console.log("balanceOf(staker) in curveGaugeContract : ", await curveGaugeContract.balanceOf(staker.address));
      console.log("balanceOf(user) in reward.sol : ", await reward.balanceOf(userAddress));
      console.log("Curve LP Token in user account : ", await curveLPTokenContract.balanceOf(userAddress));

      // test withdraw in reward.sol
      console.log("\n---------------withdraw 1 token-----------------\n");

      await reward.connect(user).withdraw(ethers.BigNumber.from("1000000000000000000"));
      console.log("balanceOf(staker) in curveGaugeContract : ", await curveGaugeContract.balanceOf(staker.address));
      console.log("balanceOf(user) in reward.sol : ", await reward.balanceOf(userAddress));
      console.log("Curve LP Token in user account : ", await curveLPTokenContract.balanceOf(userAddress));
    })
  })
});
