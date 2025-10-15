# Decentralized Voting System

A complete blockchain-based voting system built with Solidity smart contracts and Node.js backend using Web3.js.

## 🏗️ Project Structure

```
voting-system/
├── contracts/
│   └── Voting.sol
├── ignition/
    modules/
│   └── deploy.js
├── deployment/
│   └── Voting.json (generated after deployment)
├── server.js
├── hardhat.config.js
├── package.json
└── README.md
```

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Hardhat Local Node

Open a terminal and run:

```bash
npx hardhat node
```

This will start a local Ethereum node on `http://127.0.0.1:8545` and provide you with 20 test accounts.

### 3. Deploy Smart Contract

Open a new terminal and deploy the contract:

```bash
npm run deploy
```

This will:
- Compile the Voting.sol contract
- Deploy it to the local Hardhat network
- Save the contract address and ABI to `deployment/Voting.json`

### 4. Start Backend Server

```bash
npm start
```

The server will run on `http://localhost:3000`

## 📡 API Endpoints

### 1. Add Candidate (Owner Only)

**POST** `/candidates`

```bash
curl -X POST http://localhost:3000/candidates \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Candidate added successfully",
  "data": {
    "name": "Alice",
    "transactionHash": "0x...",
    "gasUsed": 123456
  }
}
```

### 2. Get All Candidates

**GET** `/candidates`

```bash
curl http://localhost:3000/candidates
```

**Response:**
```json
{
  "success": true,
  "data": {
    "candidates": [
      {
        "index": 0,
        "name": "Alice",
        "voteCount": 5
      },
      {
        "index": 1,
        "name": "Bob",
        "voteCount": 3
      }
    ],
    "totalCandidates": 2
  }
}
```

### 3. Cast a Vote

**POST** `/vote`

```bash
curl -X POST http://localhost:3000/vote \
  -H "Content-Type: application/json" \
  -d '{
    "accountAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "candidateIndex": 0
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Vote cast successfully",
  "data": {
    "voter": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "candidateIndex": 0,
    "transactionHash": "0x...",
    "gasUsed": 98765
  }
}
```

### 4. Get Winner

**GET** `/winner`

```bash
curl http://localhost:3000/winner
```

**Response:**
```json
{
  "success": true,
  "data": {
    "winner": {
      "name": "Alice",
      "voteCount": 5
    }
  }
}
```

### 5. Get Available Accounts (Helper)

**GET** `/accounts`

```bash
curl http://localhost:3000/accounts
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accounts": [
      {
        "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "balance": "10000.0",
        "isOwner": true
      }
    ]
  }
}
```

### 6. Get Contract Information

**GET** `/contract-info`

```bash
curl http://localhost:3000/contract-info
```

## 🧪 Testing the System

Here's a complete test flow:

```bash
# 1. Get available accounts
curl http://localhost:3000/accounts

# 2. Add candidates (using owner account)
curl -X POST http://localhost:3000/candidates \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice"}'

curl -X POST http://localhost:3000/candidates \
  -H "Content-Type: application/json" \
  -d '{"name": "Bob"}'

curl -X POST http://localhost:3000/candidates \
  -H "Content-Type: application/json" \
  -d '{"name": "Charlie"}'

# 3. View all candidates
curl http://localhost:3000/candidates

# 4. Cast votes (use different account addresses from /accounts)
curl -X POST http://localhost:3000/vote \
  -H "Content-Type: application/json" \
  -d '{"accountAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", "candidateIndex": 0}'

curl -X POST http://localhost:3000/vote \
  -H "Content-Type: application/json" \
  -d '{"accountAddress": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", "candidateIndex": 0}'

curl -X POST http://localhost:3000/vote \
  -H "Content-Type: application/json" \
  -d '{"accountAddress": "0x90F79bf6EB2c4f870365E785982E1f101E93b906", "candidateIndex": 1}'

# 5. Check updated vote counts
curl http://localhost:3000/candidates

# 6. Get the winner
curl http://localhost:3000/winner
```

## 🔒 Smart Contract Features

### Security Features:
- **Owner-only candidate addition**: Only the contract deployer can add candidates
- **One vote per address**: Each address can only vote once
- **Input validation**: Checks for empty candidate names and valid indices
- **Event emissions**: All important actions emit events for transparency

### Key Functions:
- `addCandidate(string name)` - Add a new candidate (owner only)
- `vote(uint candidateIndex)` - Cast a vote for a candidate
- `getCandidates()` - Retrieve all candidates and vote counts
- `getWinner()` - Get the candidate with the most votes
- `checkIfVoted(address)` - Check if an address has already voted

## 🛠️ Technology Stack

- **Smart Contract**: Solidity ^0.8.0
- **Blockchain**: Ethereum (Hardhat local network)
- **Backend**: Node.js + Express.js
- **Blockchain Integration**: Web3.js
- **Development**: Hardhat

## 📝 Error Handling

The system includes comprehensive error handling:
- Invalid candidate names
- Duplicate votes
- Invalid candidate indices
- Non-owner attempting to add candidates
- Invalid Ethereum addresses
- Contract initialization failures

## 🎯 Key Features

✅ Fully functional smart contract with security modifiers  
✅ Clean RESTful API design  
✅ Async/await pattern for blockchain interactions  
✅ Comprehensive error handling  
✅ Request logging middleware  
✅ Proper gas estimation  
✅ Event emissions for transparency  
✅ Helper endpoints for testing  

## 📦 Deliverables

1. ✅ **Voting.sol** - Complete smart contract with all required functions
2. ✅ **Deployment scripts** - Automated deployment to local Hardhat node
3. ✅ **Voting.json** - Generated file containing ABI and contract address
4. ✅ **Node.js Backend** - Full REST API with Web3.js integration
5. ✅ **Documentation** - Complete setup and usage instructions

## 🔄 Development Scripts

```bash
npm start          # Start the backend server
npm run dev        # Start with nodemon (auto-reload)
npm run compile    # Compile smart contracts
npm run node       # Start Hardhat node
npm run deploy     # Deploy to local network
```

## 🐛 Troubleshooting

**Issue**: "Contract deployment file not found"
- **Solution**: Make sure you've run `npm run deploy` after starting the Hardhat node

**Issue**: "Invalid account address"
- **Solution**: Use addresses from the `/accounts` endpoint or Hardhat node output

**Issue**: "You have already voted"
- **Solution**: Each address can only vote once. Use a different address from `/accounts`

## 📄 License

MIT
