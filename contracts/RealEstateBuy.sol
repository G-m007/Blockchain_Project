// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract RealEstateBuy {
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

    constructor() {}

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

    // Modified: Create a sell order in the marketplace instead of selling directly
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
        uint256 orderId = nextOrderId++;
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

    // Cancel a sell order and return tokens to seller
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

    // Buy tokens from a sell order
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

    // Keep the original sellPropertyTokens for backwards compatibility
    // but redirect to sell to the contract at the default price
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

    // Rent a property for 1 year
    function rentProperty(uint256 propertyId) public payable {
        Property storage property = propertiesList[propertyId];
        require(property.isActive, "Property is not active");
        require(property.isRentable, "Property is not available for rent");

        // Check if property is already rented
        require(!isPropertyRented(propertyId), "Property is already rented");

        // Check if payment is correct (1 month's rent)
        require(msg.value == property.monthlyRent, "Incorrect rent amount");

        // Calculate rental period (1 year from now)
        uint256 startDate = block.timestamp;
        uint256 endDate = startDate + 365 days;

        // Create rental
        uint256 rentalId = nextRentalId++;
        Rental memory newRental = Rental(
            rentalId,
            propertyId,
            msg.sender,
            startDate,
            endDate,
            property.monthlyRent,
            startDate,
            true
        );

        // Add to rentals array
        rentals.push(newRental);

        // Add to property rentals
        propertyRentals[propertyId].push(newRental);

        // Add to tenant rentals
        tenantRentals[msg.sender].push(newRental);

        emit PropertyRented(
            rentalId,
            propertyId,
            msg.sender,
            startDate,
            endDate,
            property.monthlyRent
        );
    }

    // Pay rent for a property
    function payRent(uint256 rentalId) public payable {
        require(rentalId < rentals.length, "Invalid rental ID");
        Rental storage rental = rentals[rentalId];

        require(rental.isActive, "Rental is not active");
        require(rental.tenant == msg.sender, "Only the tenant can pay rent");

        // Check if payment is correct
        require(msg.value == rental.monthlyRent, "Incorrect rent amount");

        // Update last rent payment
        rental.lastRentPayment = block.timestamp;

        emit RentPaid(rentalId, rental.propertyId, msg.sender, msg.value);
    }

    // Check if a property is currently rented
    function isPropertyRented(uint256 propertyId) public view returns (bool) {
        for (uint256 i = 0; i < rentals.length; i++) {
            if (rentals[i].propertyId == propertyId && rentals[i].isActive) {
                return true;
            }
        }
        return false;
    }

    // Get rental information for a property
    function getPropertyRentalInfo(
        uint256 propertyId
    )
        public
        view
        returns (
            bool isRentable,
            uint256 monthlyRent,
            bool isRented,
            address tenant,
            uint256 startDate,
            uint256 endDate,
            uint256 lastRentPayment
        )
    {
        Property storage property = propertiesList[propertyId];
        isRentable = property.isRentable;
        monthlyRent = property.monthlyRent;
        isRented = isPropertyRented(propertyId);

        if (isRented) {
            for (uint256 i = 0; i < rentals.length; i++) {
                if (
                    rentals[i].propertyId == propertyId && rentals[i].isActive
                ) {
                    tenant = rentals[i].tenant;
                    startDate = rentals[i].startDate;
                    endDate = rentals[i].endDate;
                    lastRentPayment = rentals[i].lastRentPayment;
                    break;
                }
            }
        }
    }

    // Get all rentals for a tenant
    function getTenantRentals(
        address tenant
    ) public view returns (Rental[] memory) {
        return tenantRentals[tenant];
    }

    // Get all rentals for a property
    function getPropertyRentals(
        uint256 propertyId
    ) public view returns (Rental[] memory) {
        return propertyRentals[propertyId];
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

    function getAllPropertiesCount() public view returns (uint256) {
        return propertiesList.length;
    }

    function getMyTokens(uint256 propertyId) public view returns (uint256) {
        return tokenOwnership[propertyId][msg.sender];
    }

    // Get all active sell orders
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

    // Get active sell orders for a specific property
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

    // Get sell orders created by the caller
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
