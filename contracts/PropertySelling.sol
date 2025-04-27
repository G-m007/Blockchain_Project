// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./RealEstateBase.sol";

contract PropertySelling is RealEstateBase {
    function createSellOrder(
        uint256 propertyId,
        uint256 tokenAmount,
        uint256 pricePerToken
    ) public {
        require(tokenAmount > 0, "Amount must be greater than 0");

        // Check if user owns enough tokens
        require(
            tokenOwnership[propertyId][msg.sender] >= tokenAmount,
            "You don't own enough tokens"
        );

        // Create sell order
        uint256 orderId = _incrementOrderId();
        sellOrders.push(
            SellOrder(
                orderId,
                propertyId,
                msg.sender,
                tokenAmount,
                pricePerToken,
                true
            )
        );

        // Update token ownership (lock tokens in the contract)
        tokenOwnership[propertyId][msg.sender] -= tokenAmount;

        emit SellOrderCreated(
            orderId,
            propertyId,
            msg.sender,
            tokenAmount,
            pricePerToken
        );
    }

    function cancelSellOrder(uint256 orderId) public {
        require(orderId < sellOrders.length, "Invalid order ID");
        SellOrder storage order = sellOrders[orderId];

        require(
            order.seller == msg.sender,
            "Only the seller can cancel the order"
        );
        require(order.isActive, "Order is not active");

        // Return tokens to seller
        tokenOwnership[order.propertyId][msg.sender] += order.tokenAmount;

        // Mark order as inactive
        order.isActive = false;

        emit SellOrderCancelled(orderId);
    }

    function sellPropertyTokens(uint256 propertyId, uint256 amount) public {
        Property storage property = propertiesList[propertyId];
        require(property.isActive, "Property is not active");
        require(amount > 0, "Amount must be greater than 0");

        // Check if user owns enough tokens
        require(
            tokenOwnership[propertyId][msg.sender] >= amount,
            "You don't own enough tokens"
        );

        // Update token ownership
        tokenOwnership[propertyId][msg.sender] -= amount;

        // Update property
        property.totalNumberOfTokens += amount;

        // Transfer ETH to seller
        uint256 saleValue = amount * property.pricePerToken;
        payable(msg.sender).transfer(saleValue);

        emit PropertySold(propertyId, msg.sender, amount);
    }

    function getAllSellOrders() public view returns (SellOrder[] memory) {
        // Count active orders first
        uint256 activeOrderCount = 0;
        for (uint256 i = 0; i < sellOrders.length; i++) {
            if (sellOrders[i].isActive) {
                activeOrderCount++;
            }
        }

        // Create array of active orders
        SellOrder[] memory activeOrders = new SellOrder[](activeOrderCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < sellOrders.length; i++) {
            if (sellOrders[i].isActive) {
                activeOrders[currentIndex] = sellOrders[i];
                currentIndex++;
            }
        }

        return activeOrders;
    }

    function getPropertySellOrders(
        uint256 propertyId
    ) public view returns (SellOrder[] memory) {
        // Count active orders for this property
        uint256 activeOrderCount = 0;
        for (uint256 i = 0; i < sellOrders.length; i++) {
            if (
                sellOrders[i].isActive && sellOrders[i].propertyId == propertyId
            ) {
                activeOrderCount++;
            }
        }

        // Create array of active orders for this property
        SellOrder[] memory activeOrders = new SellOrder[](activeOrderCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < sellOrders.length; i++) {
            if (
                sellOrders[i].isActive && sellOrders[i].propertyId == propertyId
            ) {
                activeOrders[currentIndex] = sellOrders[i];
                currentIndex++;
            }
        }

        return activeOrders;
    }

    function getMySellOrders() public view returns (SellOrder[] memory) {
        // Count active orders created by caller
        uint256 myOrderCount = 0;
        for (uint256 i = 0; i < sellOrders.length; i++) {
            if (sellOrders[i].seller == msg.sender) {
                myOrderCount++;
            }
        }

        // Create array of caller's orders
        SellOrder[] memory myOrders = new SellOrder[](myOrderCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < sellOrders.length; i++) {
            if (sellOrders[i].seller == msg.sender) {
                myOrders[currentIndex] = sellOrders[i];
                currentIndex++;
            }
        }

        return myOrders;
    }
}
