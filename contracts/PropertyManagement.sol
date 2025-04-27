// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./RealEstateBase.sol";

contract PropertyManagement is RealEstateBase {
    function createProperty(
        string memory name,
        string memory location,
        string memory description,
        string memory imageURI,
        uint256 totalCost,
        uint256 totalNumberOfTokens,
        uint256 pricePerToken,
        bool isRentable,
        uint256 monthlyRent
    ) public {
        uint256 propertyCount = propertiesList.length;
        propertiesList.push(
            Property(
                propertyCount,
                name,
                location,
                description,
                imageURI,
                totalCost,
                totalNumberOfTokens,
                pricePerToken,
                true,
                isRentable,
                monthlyRent
            )
        );
        emit PropertyCreated(
            propertyCount,
            name,
            location,
            description,
            imageURI,
            totalCost,
            totalNumberOfTokens,
            pricePerToken
        );
    }

    function updateProperty(
        uint256 propertyId,
        string memory name,
        string memory location,
        string memory description,
        string memory imageURI,
        uint256 totalCost,
        uint256 totalNumberOfTokens,
        uint256 pricePerToken,
        bool isRentable,
        uint256 monthlyRent
    ) public {
        Property storage property = propertiesList[propertyId];
        require(property.isActive, "Property is not active");

        property.name = name;
        property.location = location;
        property.description = description;
        property.imageURI = imageURI;
        property.totalCost = totalCost;
        property.totalNumberOfTokens = totalNumberOfTokens;
        property.pricePerToken = pricePerToken;
        property.isRentable = isRentable;
        property.monthlyRent = monthlyRent;

        emit PropertyUpdated(
            propertyId,
            name,
            location,
            description,
            imageURI,
            totalCost,
            totalNumberOfTokens,
            pricePerToken
        );
    }
}
