import { ethers } from "hardhat";

async function main() {
  console.log("Deploying RealEstateBuy contract...");

  // Deploy the RealEstateBuy contract
  const RealEstateBuy = await ethers.getContractFactory("RealEstateBuy");
  const realEstateBuy = await RealEstateBuy.deploy();
  await realEstateBuy.waitForDeployment();

  const realEstateBuyAddress = await realEstateBuy.getAddress();
  console.log(`RealEstateBuy deployed to: ${realEstateBuyAddress}`);

  // Deploy the VoteContract
  console.log("Deploying VoteContract...");
  const VoteContract = await ethers.getContractFactory("VoteContract");
  const voteContract = await VoteContract.deploy();
  await voteContract.waitForDeployment();

  const voteContractAddress = await voteContract.getAddress();
  console.log(`VoteContract deployed to: ${voteContractAddress}`);

  // Set the RealEstateBuy contract address in VoteContract
  console.log("Connecting contracts...");
  await voteContract.setRealEstateContract(realEstateBuyAddress);
  console.log("Contracts connected successfully");

  // Sample properties to add to RealEstateBuy
  const properties = [
    {
      name: "Luxury Beachfront Villa",
      location: "Miami, Florida",
      description:
        "A stunning 5-bedroom villa with private beach access and panoramic ocean views.",
      imageURI:
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop",
      totalCost: ethers.parseEther("5000"),
      totalNumberOfTokens: 1000,
      pricePerToken: ethers.parseEther("5"),
      isRentable: true,
      monthlyRent: ethers.parseEther("50"),
    },
    {
      name: "Downtown Penthouse",
      location: "New York City, NY",
      description:
        "Exclusive penthouse in the heart of Manhattan with 360-degree city views and private rooftop.",
      imageURI:
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop",
      totalCost: ethers.parseEther("7500"),
      totalNumberOfTokens: 1500,
      pricePerToken: ethers.parseEther("5"),
      isRentable: true,
      monthlyRent: ethers.parseEther("75"),
    },
    {
      name: "Mountain Retreat Cabin",
      location: "Aspen, Colorado",
      description:
        "Cozy cabin surrounded by natural beauty, perfect for ski vacations and summer hikes.",
      imageURI:
        "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&auto=format&fit=crop",
      totalCost: ethers.parseEther("2000"),
      totalNumberOfTokens: 800,
      pricePerToken: ethers.parseEther("2.5"),
      isRentable: true,
      monthlyRent: ethers.parseEther("20"),
    },
    {
      name: "Vineyard Estate",
      location: "Napa Valley, California",
      description:
        "Expansive estate with working vineyard, wine cellar, and magnificent garden grounds.",
      imageURI:
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
      totalCost: ethers.parseEther("6000"),
      totalNumberOfTokens: 1200,
      pricePerToken: ethers.parseEther("5"),
      isRentable: true,
      monthlyRent: ethers.parseEther("0"),
    },
    {
      name: "Historic Townhouse",
      location: "Boston, Massachusetts",
      description:
        "Beautifully renovated 19th century townhouse with original features and modern amenities.",
      imageURI:
        "https://images.unsplash.com/photo-1592595896616-c37162298647?w=800&auto=format&fit=crop",
      totalCost: ethers.parseEther("4000"),
      totalNumberOfTokens: 1000,
      pricePerToken: ethers.parseEther("4"),
      isRentable: true,
      monthlyRent: ethers.parseEther("40"),
    },
  ];

  // Add properties to RealEstateBuy contract
  console.log("Adding properties to RealEstateBuy contract...");
  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    const tx = await realEstateBuy.createProperty(
      property.name,
      property.location,
      property.description,
      property.imageURI,
      property.totalCost,
      property.totalNumberOfTokens,
      property.pricePerToken,
      property.isRentable,
      property.monthlyRent
    );
    await tx.wait();
    console.log(`Added property ${i}: ${property.name}`);
  }

  // Add properties to VoteContract and map them to RealEstateBuy properties
  console.log("Adding properties to VoteContract and mapping...");
  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    if (property.isRentable) {
      const tx = await voteContract[
        "addProperty(string,string,uint256,uint256,uint256)"
      ](
        property.name,
        property.location,
        property.totalNumberOfTokens,
        property.monthlyRent,
        i // Map to the corresponding RealEstateBuy property ID
      );
      await tx.wait();
      console.log(`Added and mapped property ${i}: ${property.name}`);
    }
  }

  console.log("Deployment complete!");
  console.log(`
To update your constants file:
- RealEstateBuy deployed to: ${realEstateBuyAddress}
- VoteContract deployed to: ${voteContractAddress}
  `);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
