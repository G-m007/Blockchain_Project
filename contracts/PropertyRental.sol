// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./RealEstateBase.sol";

contract PropertyRental is RealEstateBase {
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
        uint256 rentalId = _incrementRentalId();
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

    function isPropertyRented(uint256 propertyId) public view returns (bool) {
        for (uint256 i = 0; i < rentals.length; i++) {
            if (rentals[i].propertyId == propertyId && rentals[i].isActive) {
                return true;
            }
        }
        return false;
    }

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

    function getTenantRentals(
        address tenant
    ) public view returns (Rental[] memory) {
        return tenantRentals[tenant];
    }

    function getPropertyRentals(
        uint256 propertyId
    ) public view returns (Rental[] memory) {
        return propertyRentals[propertyId];
    }
}
