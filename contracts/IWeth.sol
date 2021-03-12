pragma solidity ^0.5.0;

interface IWeth {
    function deposit() external payable;

    function withdraw(uint256 wad) external;

    function balanceOf(address owner) external view returns (uint256);
}
