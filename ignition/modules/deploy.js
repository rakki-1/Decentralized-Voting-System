const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying Voting contract...");

  // Get the contract factory
  const Voting = await hre.ethers.getContractFactory("Voting");
  
  // Deploy the contract
  const voting = await Voting.deploy();
  await voting.waitForDeployment();

  console.log(`Voting contract deployed to: ${voting.target}`);

  // Get the deployer (owner) account
  const [owner] = await hre.ethers.getSigners();
  console.log(`Contract owner: ${owner.address}`);

  // Save contract address and ABI to a JSON file
  const contractData = {
    address: voting.target,
    owner: owner.address,
    abi: voting.interface.format('json')
  };

  const deploymentDir = path.join(__dirname, '../deployment');
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const filePath = path.join(deploymentDir, 'Voting.json');
  fs.writeFileSync(filePath, JSON.stringify(contractData, null, 2));
  
  console.log(`Contract data saved to: ${filePath}`);
  console.log("\nYou can now use this contract with the Node.js backend!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });