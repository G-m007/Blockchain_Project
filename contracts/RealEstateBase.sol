// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract RealEstateBase {
    struct Property {
        uint256 propertyId;
        string name;
        string location;
        string description;
        string imageURI;
        uint256 totalCost;
        uint256 totalNumberOfTokens;
        uint256 pricePerToken;
        bool isActive;
        bool isRentable;
        uint256 monthlyRent;
    }

    struct SellOrder {
        uint256 orderId;
        uint256 propertyId;
        address seller;
        uint256 tokenAmount;
        uint256 pricePerToken;
        bool isActive;
    }

    struct Rental {
        uint256 rentalId;
        uint256 propertyId;
        address tenant;
        uint256 startDate;
        uint256 endDate;
        uint256 monthlyRent;
        uint256 lastRentPayment;
        bool isActive;
    }

    Property[] public propertiesList;
    SellOrder[] public sellOrders;
    Rental[] public rentals;

    // Track token ownership per user
    mapping(uint256 => mapping(address => uint256)) public tokenOwnership;

    // Track rentals per property
    mapping(uint256 => Rental[]) public propertyRentals;

    // Track active rentals per tenant
    mapping(address => Rental[]) public tenantRentals;

    // Track the next order ID
    uint256 private nextOrderId = 0;

    // Track the next rental ID
    uint256 private nextRentalId = 0;

    // Events
    event PropertyCreated(
        uint256 indexed propertyId,
        string name,
        string location,
        string description,
        string imageURI,
        uint256 totalSupply,
        uint256 totalNumberOfTokens,
        uint256 pricePerToken
    );
    event PropertyPurchased(
        uint256 indexed propertyId,
        address indexed buyer,
        uint256 amount
    );
    event PropertySold(
        uint256 indexed propertyId,
        address indexed buyer,
        uint256 amount
    );
    event PropertyUpdated(
        uint256 indexed propertyId,
        string name,
        string location,
        string description,
        string imageURI,
        uint256 totalSupply,
        uint256 totalNumberOfTokens,
        uint256 pricePerToken
    );
    event SellOrderCreated(
        uint256 indexed orderId,
        uint256 indexed propertyId,
        address indexed seller,
        uint256 tokenAmount,
        uint256 pricePerToken
    );
    event SellOrderCancelled(uint256 indexed orderId);
    event SellOrderFulfilled(
        uint256 indexed orderId,
        address indexed buyer,
        uint256 tokenAmount
    );
    event PropertyRented(
        uint256 indexed rentalId,
        uint256 indexed propertyId,
        address indexed tenant,
        uint256 startDate,
        uint256 endDate,
        uint256 monthlyRent
    );
    event RentPaid(
        uint256 indexed rentalId,
        uint256 indexed propertyId,
        address indexed tenant,
        uint256 amount
    );

    // Internal functions for state management
    function _incrementOrderId() internal returns (uint256) {
        return nextOrderId++;
    }

    function _incrementRentalId() internal returns (uint256) {
        return nextRentalId++;
    }

    // View functions
    function getAllPropertiesCount() public view returns (uint256) {
        return propertiesList.length;
    }

    function getPropertyDetails(
        uint256 propertyId
    )
        public
        view
        returns (
            string memory name,
            string memory location,
            string memory description,
            string memory imageURI,
            uint256 totalCost,
            uint256 totalNumberOfTokens,
            uint256 pricePerToken,
            bool isActive,
            bool isRentable,
            uint256 monthlyRent
        )
    {
        Property storage property = propertiesList[propertyId];
        return (
            property.name,
            property.location,
            property.description,
            property.imageURI,
            property.totalCost,
            property.totalNumberOfTokens,
            property.pricePerToken,
            property.isActive,
            property.isRentable,
            property.monthlyRent
        );
    }

    function getMyTokens(uint256 propertyId) public view returns (uint256) {
        return tokenOwnership[propertyId][msg.sender];
    }
}
