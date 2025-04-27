// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./PropertyManagement.sol";
import "./PropertyBuying.sol";
import "./PropertySelling.sol";
import "./PropertyRental.sol";

contract RealEstate is
    PropertyManagement,
    PropertyBuying,
    PropertySelling,
    PropertyRental
{
    constructor() {}
}
