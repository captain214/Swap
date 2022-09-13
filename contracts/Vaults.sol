//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/ICoinswap.sol";

contract Vaults is Pausable, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    ICoinSwapRouter02 public router;

    address constant public CSS = 0x68c510C2852b058BA20D50b83601e81005c9a8A1;
    address constant public BUSD = 0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee;

    address public treasureAddress; // Todo : Set Address
    IERC20 public ercCSS;
    IERC20 public ercBUSD;

    event Deposited(uint256 amount);
    event Withdrawn(address indexed recipient, uint256 amount);
    event UpdateRouter(address indexed newAddress, address indexed oldAddress);
    event SwapCSSForBUSD(uint256 amountIn, address[] path);
    event AddLiquidity(uint256 cssAmount, uint256 busdAmount);
    event SetTreasureAddress(address treasure);

    constructor() {
        // testnet 0x8D0c01c0D07B1Df2c149d67269a068773bbD85b8
        // mainnet 0x34DBe8E5faefaBF5018c16822e4d86F02d57Ec27
        router = ICoinSwapRouter02(0x8D0c01c0D07B1Df2c149d67269a068773bbD85b8);
        ercCSS = IERC20(CSS);
        ercBUSD = IERC20(BUSD);
    }

    function deposit(uint256 _amount) external whenNotPaused nonReentrant {
        require(_amount > 0, "You need to send some CSS");
        uint256 initialBal = ercBUSD.balanceOf(address(this));
        ercCSS.safeTransferFrom(msg.sender, address(this), _amount);
        uint256 halfAmount = _amount / 2;
        _swapCSSForBUSD(halfAmount);
        uint256 deltaBal = ercBUSD.balanceOf(address(this)) - initialBal;
        require(deltaBal > 0, "Invalid swap");
                
        // adding CSS + BUSD to LP
        _addLiquidity(halfAmount, deltaBal);

        emit Deposited(_amount);
    }

    function _swapCSSForBUSD(uint256 _tokenAmount) private {
        address[] memory path = new address[](2);
        path[0] = CSS;
        path[1] = BUSD;

        ercCSS.approve(address(router), _tokenAmount);

        // make the swap
        router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            _tokenAmount,
            0,
            path,
            address(this),
            block.timestamp + 300
        );

        emit SwapCSSForBUSD(_tokenAmount, path);
    }

    function _addLiquidity(uint256 _cssAmount, uint256 _busdAmount) private {
        // approve token transfer to cover all possible scenarios
        ercCSS.approve(address(router), _cssAmount);
        ercBUSD.approve(address(router), _busdAmount);

        // add the liquidity
        router.addLiquidity(
            CSS,
            BUSD,
            _cssAmount,
            _busdAmount,
            0,
            0,
            treasureAddress,
            (block.timestamp + 300)
        );
        
        emit AddLiquidity(_cssAmount, _busdAmount);
    }

    function updateRouter(address _newAddress) external onlyOwner {
        require(
            _newAddress != address(router),
            "The router already has that address"
        );
        
        address prevRouter = address(router);
        router = ICoinSwapRouter02(_newAddress);
        emit UpdateRouter(_newAddress, prevRouter);
    }

    function setTreasureAddress(address _newWallet) external onlyOwner {
        treasureAddress = _newWallet;
        emit SetTreasureAddress(_newWallet);
    }

    function pause() external onlyOwner {
        super._pause();
    }

    function unpause() external onlyOwner {
        super._unpause();
    }
}
