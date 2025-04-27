// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./RealEstateBase.sol";

contract PropertyBuying is RealEstateBase {
    function purchasePropertyTokens(
        uint256 propertyId,
        uint256 tokensToPurchase
    ) public payable {
        Property storage property = propertiesList[propertyId];
        require(property.isActive, "Property is not active");
        require(tokensToPurchase > 0, "Amount must be greater than 0");
        require(
            tokensToPurchase <= property.totalNumberOfTokens,
            "Not enough tokens available"
        );

        uint256 expectedValue = tokensToPurchase * property.pricePerToken;
        require(msg.value == expectedValue, "Incorrect amount sent");

        // Update available tokens
        property.totalNumberOfTokens -= tokensToPurchase;

        // Track token ownership
        tokenOwnership[propertyId][msg.sender] += tokensToPurchase;

        emit PropertyPurchased(propertyId, msg.sender, tokensToPurchase);
    }

    function buyFromSellOrder(uint256 orderId) public payable {
        require(orderId < sellOrders.length, "Invalid order ID");
        SellOrder storage order = sellOrders[orderId];

        require(order.isActive, "Order is not active");
        require(order.seller != msg.sender, "Cannot buy your own tokens");

        uint256 totalCost = order.tokenAmount * order.pricePerToken;
        require(msg.value == totalCost, "Incorrect amount sent");

        // Transfer tokens to buyer
        tokenOwnership[order.propertyId][msg.sender] += order.tokenAmount;

        // Transfer ETH to seller
        payable(order.seller).transfer(msg.value);

        // Mark order as inactive
        order.isActive = false;

        emit SellOrderFulfilled(orderId, msg.sender, order.tokenAmount);
    }
}
