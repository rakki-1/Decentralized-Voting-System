const express = require('express');
const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Initialize Web3
const web3 = new Web3('http://127.0.0.1:8545');

// Load contract data
let contractData;
let contract;
let ownerAccount;
let accounts;

async function initializeContract() {
  try {
    const contractPath = path.join(__dirname, 'ignition','deployment', 'Voting.json');
    
    if (!fs.existsSync(contractPath)) {
      throw new Error('Contract deployment file not found. Please deploy the contract first.');
    }

    contractData = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    contract = new web3.eth.Contract(contractData.abi, contractData.address);
    accounts = await web3.eth.getAccounts();
    ownerAccount = contractData.owner;

    console.log('Contract initialized successfully');
    console.log(`Contract Address: ${contractData.address}`);
    console.log(`Owner Account: ${ownerAccount}`);
    console.log(`Available Accounts: ${accounts.length}`);
  } catch (error) {
    console.error('Error initializing contract:', error.message);
    throw error;
  }
}

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// POST /candidates - Add a candidate (only owner)
app.post('/candidates', asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ 
      success: false, 
      error: 'Candidate name is required' 
    });
  }

  try {
    const receipt = await contract.methods.addCandidate(name).send({
      from: ownerAccount,
      gas: 200000
    });

    console.log(`Candidate added: ${name}`);
    
    res.status(201).json({
      success: true,
      message: 'Candidate added successfully',
      data: {
        name,
        transactionHash: receipt.transactionHash,
        gasUsed: receipt.gasUsed
      }
    });
  } catch (error) {
    console.error('Error adding candidate:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

// GET /candidates - List all candidates
app.get('/candidates', asyncHandler(async (req, res) => {
  try {
    const candidates = await contract.methods.getCandidates().call();
    
    const formattedCandidates = candidates.map((candidate, index) => ({
      index,
      name: candidate.name,
      voteCount: parseInt(candidate.voteCount)
    }));

    res.json({
      success: true,
      data: {
        candidates: formattedCandidates,
        totalCandidates: formattedCandidates.length
      }
    });
  } catch (error) {
    console.error('Error fetching candidates:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

// POST /vote - Cast a vote
app.post('/vote', asyncHandler(async (req, res) => {
  const { accountAddress, candidateIndex } = req.body;

  if (!accountAddress) {
    return res.status(400).json({
      success: false,
      error: 'Account address is required'
    });
  }

  if (candidateIndex === undefined || candidateIndex === null) {
    return res.status(400).json({
      success: false,
      error: 'Candidate index is required'
    });
  }

  // Validate address
  if (!web3.utils.isAddress(accountAddress)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid account address'
    });
  }

  try {
    // Check if already voted
    const hasVoted = await contract.methods.checkIfVoted(accountAddress).call();
    if (hasVoted) {
      return res.status(400).json({
        success: false,
        error: 'This account has already voted'
      });
    }

    const receipt = await contract.methods.vote(candidateIndex).send({
      from: accountAddress,
      gas: 200000
    });

    console.log(`Vote cast by ${accountAddress} for candidate ${candidateIndex}`);

    res.json({
      success: true,
      message: 'Vote cast successfully',
      data: {
        voter: accountAddress,
        candidateIndex,
        transactionHash: receipt.transactionHash,
        gasUsed: receipt.gasUsed
      }
    });
  } catch (error) {
    console.error('Error casting vote:', error.message);
    
    let errorMessage = error.message;
    if (error.message.includes('already voted')) {
      errorMessage = 'You have already voted';
    } else if (error.message.includes('Invalid candidate')) {
      errorMessage = 'Invalid candidate index';
    }

    res.status(400).json({
      success: false,
      error: errorMessage
    });
  }
}));

// GET /winner - Get the winner
app.get('/winner', asyncHandler(async (req, res) => {
  try {
    const candidates = await contract.methods.getCandidates().call();
    
    if (candidates.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No candidates available'
      });
    }

    const winner = await contract.methods.getWinner().call();
    
    // Find winner details
    const winnerDetails = candidates.find(c => c.name === winner);
    
    res.json({
      success: true,
      data: {
        winner: {
          name: winner,
          voteCount: winnerDetails ? parseInt(winnerDetails.voteCount) : 0
        }
      }
    });
  } catch (error) {
    console.error('Error getting winner:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

// GET /accounts - Get available accounts (helper endpoint)
app.get('/accounts', asyncHandler(async (req, res) => {
  try {
    const balances = await Promise.all(
      accounts.map(async (account) => {
        const balance = await web3.eth.getBalance(account);
        return {
          address: account,
          balance: web3.utils.fromWei(balance, 'ether'),
          isOwner: account === ownerAccount
        };
      })
    );

    res.json({
      success: true,
      data: {
        accounts: balances
      }
    });
  } catch (error) {
    console.error('Error fetching accounts:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

// GET /contract-info - Get contract information
app.get('/contract-info', (req, res) => {
  res.json({
    success: true,
    data: {
      contractAddress: contractData.address,
      ownerAddress: ownerAccount,
      network: 'localhost',
      chainId: 1337
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 3000;

initializeContract()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 Voting System Backend running on port ${PORT}`);
      console.log(`\nAvailable endpoints:`);
      console.log(`  POST   http://localhost:${PORT}/candidates`);
      console.log(`  GET    http://localhost:${PORT}/candidates`);
      console.log(`  POST   http://localhost:${PORT}/vote`);
      console.log(`  GET    http://localhost:${PORT}/winner`);
      console.log(`  GET    http://localhost:${PORT}/accounts`);
      console.log(`  GET    http://localhost:${PORT}/contract-info\n`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  });