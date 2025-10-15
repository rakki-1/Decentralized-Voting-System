#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo -e "${BLUE}=== Decentralized Voting System Test ===${NC}\n"

# Step 1: Get contract info
echo -e "${YELLOW}Step 1: Getting contract information...${NC}"
curl -s $BASE_URL/contract-info | jq '.'
echo -e "\n"

# Step 2: Get available accounts
echo -e "${YELLOW}Step 2: Getting available accounts...${NC}"
ACCOUNTS=$(curl -s $BASE_URL/accounts | jq -r '.data.accounts[].address')
echo "$ACCOUNTS" | head -5
echo -e "\n"

# Step 3: Add candidates
echo -e "${YELLOW}Step 3: Adding candidates...${NC}"
echo "Adding Alice..."
curl -s -X POST $BASE_URL/candidates \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice"}' | jq '.'

echo -e "\nAdding Bob..."
curl -s -X POST $BASE_URL/candidates \
  -H "Content-Type: application/json" \
  -d '{"name": "Bob"}' | jq '.'

echo -e "\nAdding Charlie..."
curl -s -X POST $BASE_URL/candidates \
  -H "Content-Type: application/json" \
  -d '{"name": "Charlie"}' | jq '.'
echo -e "\n"

# Step 4: View all candidates
echo -e "${YELLOW}Step 4: Viewing all candidates...${NC}"
curl -s $BASE_URL/candidates | jq '.'
echo -e "\n"

# Step 5: Cast votes
echo -e "${YELLOW}Step 5: Casting votes...${NC}"

# Get first 5 accounts for voting
ACCOUNT_1=$(echo "$ACCOUNTS" | sed -n '2p')
ACCOUNT_2=$(echo "$ACCOUNTS" | sed -n '3p')
ACCOUNT_3=$(echo "$ACCOUNTS" | sed -n '4p')
ACCOUNT_4=$(echo "$ACCOUNTS" | sed -n '5p')
ACCOUNT_5=$(echo "$ACCOUNTS" | sed -n '6p')

echo "Vote 1: $ACCOUNT_1 votes for Alice (index 0)"
curl -s -X POST $BASE_URL/vote \
  -H "Content-Type: application/json" \
  -d "{\"accountAddress\": \"$ACCOUNT_1\", \"candidateIndex\": 0}" | jq '.'

echo -e "\nVote 2: $ACCOUNT_2 votes for Alice (index 0)"
curl -s -X POST $BASE_URL/vote \
  -H "Content-Type: application/json" \
  -d "{\"accountAddress\": \"$ACCOUNT_2\", \"candidateIndex\": 0}" | jq '.'

echo -e "\nVote 3: $ACCOUNT_3 votes for Bob (index 1)"
curl -s -X POST $BASE_URL/vote \
  -H "Content-Type: application/json" \
  -d "{\"accountAddress\": \"$ACCOUNT_3\", \"candidateIndex\": 1}" | jq '.'

echo -e "\nVote 4: $ACCOUNT_4 votes for Alice (index 0)"
curl -s -X POST $BASE_URL/vote \
  -H "Content-Type: application/json" \
  -d "{\"accountAddress\": \"$ACCOUNT_4\", \"candidateIndex\": 0}" | jq '.'

echo -e "\nVote 5: $ACCOUNT_5 votes for Charlie (index 2)"
curl -s -X POST $BASE_URL/vote \
  -H "Content-Type: application/json" \
  -d "{\"accountAddress\": \"$ACCOUNT_5\", \"candidateIndex\": 2}" | jq '.'
echo -e "\n"

# Step 6: View updated results
echo -e "${YELLOW}Step 6: Viewing updated vote counts...${NC}"
curl -s $BASE_URL/candidates | jq '.'
echo -e "\n"

# Step 7: Get winner
echo -e "${YELLOW}Step 7: Getting the winner...${NC}"
curl -s $BASE_URL/winner | jq '.'
echo -e "\n"

# Step 8: Test duplicate vote (should fail)
echo -e "${YELLOW}Step 8: Testing duplicate vote prevention...${NC}"
echo "Attempting to vote again with $ACCOUNT_1 (should fail)..."
curl -s -X POST $BASE_URL/vote \
  -H "Content-Type: application/json" \
  -d "{\"accountAddress\": \"$ACCOUNT_1\", \"candidateIndex\": 1}" | jq '.'
echo -e "\n"

echo -e "${GREEN}=== Test Complete ===${NC}"