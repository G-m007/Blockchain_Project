// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface IRealEstateBuy {
    function tokenOwnership(uint256 propertyId, address owner) external view returns (uint256);
    function getMyTokens(uint256 propertyId) external view returns (uint256);
}

contract VoteContract {
    struct Property {
        uint256 propertyId;
        string name;
        string location;
        uint256 totalTokens;
        bool isActive;
        bool isRentable;
        uint256 monthlyRent;
        uint256 mappedRealEstateId; // Reference to property ID in RealEstateBuy contract
    }

    struct RentApplication {
        uint256 applicationId;
        uint256 propertyId;
        address applicant;
        string name;
        string description;
        uint256 votingEndTime;
        bool isActive;
        bool isApproved;
        address selectedRenter;
    }

    struct Vote {
        address voter;
        uint256 applicationId;
        address candidateAddress;
        uint256 tokenPower;
    }

    // Properties in the system
    Property[] public properties;
    
    // Rent applications
    RentApplication[] public rentApplications;
    
    // Track token ownership per user for each property
    mapping(uint256 => mapping(address => uint256)) public tokenOwnership;
    
    // Track votes per application
    mapping(uint256 => mapping(address => uint256)) public applicationVotes;
    
    // Track votes per candidate in an application
    mapping(uint256 => mapping(address => uint256)) public candidateVotes;
    
    // Track if a token holder has voted in an application
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // Track the current renter for each property
    mapping(uint256 => address) public currentRenter;
    
    // Application ID counter
    uint256 private nextApplicationId = 0;

    // Property ID counter
    uint256 private nextPropertyId = 0;
    
    // RealEstateBuy contract reference
    IRealEstateBuy public realEstateBuy;
    bool public useRealEstateContract = false;

    // Events
    event PropertyAdded(uint256 indexed propertyId, string name, string location, uint256 totalTokens);
    event TokensPurchased(uint256 indexed propertyId, address indexed buyer, uint256 amount);
    event RentApplicationCreated(uint256 indexed applicationId, uint256 indexed propertyId, address indexed applicant);
    event VoteCast(uint256 indexed applicationId, address indexed voter, address indexed candidate, uint256 tokenPower);
    event RenterSelected(uint256 indexed propertyId, address indexed renter);
    event ApplicationFinalized(uint256 indexed applicationId, bool isApproved, address selectedRenter);
    event RealEstateContractSet(address contractAddress);

    // Set the RealEstateBuy contract address
    function setRealEstateContract(address contractAddress) public {
        realEstateBuy = IRealEstateBuy(contractAddress);
        useRealEstateContract = true;
        emit RealEstateContractSet(contractAddress);
    }

    // Add a new property to the system with a mapping to RealEstateBuy property
    function addProperty(
        string memory name,
        string memory location,
        uint256 totalTokens,
        uint256 monthlyRent,
        uint256 realEstatePropertyId
    ) public {
        uint256 propertyId = nextPropertyId++;
        
        properties.push(
            Property(
                propertyId,
                name,
                location,
                totalTokens,
                true,
                true,
                monthlyRent,
                realEstatePropertyId
            )
        );
        
        emit PropertyAdded(propertyId, name, location, totalTokens);
    }

    // Simplified version for backward compatibility
    function addProperty(
        string memory name,
        string memory location,
        uint256 totalTokens,
        uint256 monthlyRent
    ) public {
        addProperty(name, location, totalTokens, monthlyRent, 0);
    }

    // Purchase tokens for a property
    function purchaseTokens(uint256 propertyId, uint256 tokensToPurchase) public payable {
        Property storage property = properties[propertyId];
        require(property.isActive, "Property is not active");
        require(tokensToPurchase > 0, "Amount must be greater than 0");
        
        // Track token ownership
        tokenOwnership[propertyId][msg.sender] += tokensToPurchase;
        
        emit TokensPurchased(propertyId, msg.sender, tokensToPurchase);
    }

    // Apply to rent a property
    function applyForRent(
        uint256 propertyId, 
        string memory name,
        string memory description
    ) public {
        Property storage property = properties[propertyId];
        require(property.isActive, "Property is not active");
        require(property.isRentable, "Property is not available for rent");
        
        uint256 userTokens = getTokensOwned(propertyId, msg.sender);
        
        // Check if the applicant owns tokens of this property
        require(userTokens == 0, "Token holders cannot apply for rent");
        
        // Create a new rent application
        uint256 applicationId = nextApplicationId++;
        uint256 votingPeriod = 7 days; // Voting period of 7 days
        
        rentApplications.push(
            RentApplication(
                applicationId,
                propertyId,
                msg.sender,
                name,
                description,
                block.timestamp + votingPeriod,
                true,
                false,
                address(0)
            )
        );
        
        emit RentApplicationCreated(applicationId, propertyId, msg.sender);
    }

    // Cast a vote for a rent application
    function voteForRent(uint256 applicationId, address candidateAddress) public {
        RentApplication storage application = rentApplications[applicationId];
        require(application.isActive, "Application is not active");
        require(block.timestamp < application.votingEndTime, "Voting period has ended");
        
        // Verify the candidate is a valid applicant
        require(isCandidateValid(applicationId, candidateAddress), "Invalid candidate");
        
        // Get the property ID
        uint256 propertyId = application.propertyId;
        
        // Get voter tokens - this will check both local and RealEstateBuy contract
        uint256 voterTokens = getTokensOwned(propertyId, msg.sender);
        
        // Check if the voter owns tokens for this property
        require(voterTokens > 0, "You don't own any tokens for this property");
        
        // Check if voter has already voted
        require(!hasVoted[applicationId][msg.sender], "You have already voted");
        
        // Record the vote
        applicationVotes[applicationId][msg.sender] = voterTokens;
        candidateVotes[applicationId][candidateAddress] += voterTokens;
        hasVoted[applicationId][msg.sender] = true;
        
        emit VoteCast(applicationId, msg.sender, candidateAddress, voterTokens);
    }

    // Finalize an application after the voting period
    function finalizeApplication(uint256 applicationId) public {
        RentApplication storage application = rentApplications[applicationId];
        require(application.isActive, "Application is not active");
        require(block.timestamp >= application.votingEndTime, "Voting period has not ended yet");
        
        // Find the candidate with the most votes
        address selectedRenter = findWinningCandidate(applicationId);
        
        if (selectedRenter != address(0)) {
            // There is a winner
            application.isApproved = true;
            application.selectedRenter = selectedRenter;
            
            // Set the current renter for the property
            currentRenter[application.propertyId] = selectedRenter;
            
            emit RenterSelected(application.propertyId, selectedRenter);
        }
        
        // Mark application as inactive
        application.isActive = false;
        
        emit ApplicationFinalized(applicationId, application.isApproved, application.selectedRenter);
    }

    // Helper function to check if a candidate is valid for an application
    function isCandidateValid(uint256 applicationId, address candidateAddress) internal view returns (bool) {
        RentApplication storage application = rentApplications[applicationId];
        
        // Check all applications for this property to see if the candidate is an applicant
        for (uint256 i = 0; i < rentApplications.length; i++) {
            if (rentApplications[i].propertyId == application.propertyId && 
                rentApplications[i].applicant == candidateAddress) {
                return true;
            }
        }
        
        return false;
    }

    // Helper function to find the candidate with the most votes
    function findWinningCandidate(uint256 applicationId) internal view returns (address) {
        RentApplication storage application = rentApplications[applicationId];
        uint256 propertyId = application.propertyId;
        address winningCandidate = address(0);
        uint256 highestVotes = 0;
        
        // Check votes for all candidates
        for (uint256 i = 0; i < rentApplications.length; i++) {
            if (rentApplications[i].propertyId == propertyId) {
                address candidate = rentApplications[i].applicant;
                uint256 votes = candidateVotes[applicationId][candidate];
                
                if (votes > highestVotes) {
                    highestVotes = votes;
                    winningCandidate = candidate;
                }
            }
        }
        
        return winningCandidate;
    }

    // Get all active rent applications for a property
    function getPropertyApplications(uint256 propertyId) public view returns (RentApplication[] memory) {
        // Count active applications for this property
        uint256 count = 0;
        for (uint256 i = 0; i < rentApplications.length; i++) {
            if (rentApplications[i].propertyId == propertyId && rentApplications[i].isActive) {
                count++;
            }
        }
        
        // Create array of active applications
        RentApplication[] memory activeApplications = new RentApplication[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < rentApplications.length; i++) {
            if (rentApplications[i].propertyId == propertyId && rentApplications[i].isActive) {
                activeApplications[index] = rentApplications[i];
                index++;
            }
        }
        
        return activeApplications;
    }

    // Get votes for a candidate in an application
    function getCandidateVotes(uint256 applicationId, address candidate) public view returns (uint256) {
        return candidateVotes[applicationId][candidate];
    }

    // Get tokens owned by an address for a property - checks both local and RealEstateBuy contract
    function getTokensOwned(uint256 propertyId, address owner) public view returns (uint256) {
        uint256 localTokens = tokenOwnership[propertyId][owner];
        
        // If using RealEstateBuy contract and the property is mapped
        if (useRealEstateContract && address(realEstateBuy) != address(0)) {
            Property storage property = properties[propertyId];
            if (property.mappedRealEstateId > 0) {
                uint256 realEstateTokens = realEstateBuy.tokenOwnership(property.mappedRealEstateId, owner);
                return localTokens + realEstateTokens;
            }
        }
        
        return localTokens;
    }

    // Get the current renter of a property
    function getPropertyRenter(uint256 propertyId) public view returns (address) {
        return currentRenter[propertyId];
    }

    // Check if a token holder has already voted in an application
    function hasTokenHolderVoted(uint256 applicationId, address voter) public view returns (bool) {
        return hasVoted[applicationId][voter];
    }

    // Get an application by ID
    function getApplication(uint256 applicationId) public view returns (RentApplication memory) {
        require(applicationId < rentApplications.length, "Invalid application ID");
        return rentApplications[applicationId];
    }

    // Get all properties
    function getAllProperties() public view returns (Property[] memory) {
        return properties;
    }

    // Get total number of properties
    function getPropertiesCount() public view returns (uint256) {
        return properties.length;
    }

    // Get total number of applications
    function getApplicationsCount() public view returns (uint256) {
        return rentApplications.length;
    }
    
    // Get a property by ID
    function getProperty(uint256 propertyId) public view returns (Property memory) {
        require(propertyId < properties.length, "Invalid property ID");
        return properties[propertyId];
    }
    
    // Map a property to its RealEstateBuy counterpart
    function mapPropertyToRealEstate(uint256 votePropertyId, uint256 realEstatePropertyId) public {
        require(votePropertyId < properties.length, "Invalid vote property ID");
        properties[votePropertyId].mappedRealEstateId = realEstatePropertyId;
    }
}



