// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Voting {
    struct Candidate {
        string name;
        uint voteCount;
    }

    address public owner;
    Candidate[] public candidates;
    mapping(address => bool) public hasVoted;

    event CandidateAdded(uint indexed candidateIndex, string name);
    event VoteCast(address indexed voter, uint indexed candidateIndex);
    event WinnerDeclared(string name, uint voteCount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier hasNotVoted() {
        require(!hasVoted[msg.sender], "You have already voted");
        _;
    }

    modifier validCandidate(uint candidateIndex) {
        require(candidateIndex < candidates.length, "Invalid candidate index");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Add a new candidate to the election
     * @param name The name of the candidate
     */
    function addCandidate(string memory name) public onlyOwner {
        require(bytes(name).length > 0, "Candidate name cannot be empty");
        candidates.push(Candidate({
            name: name,
            voteCount: 0
        }));
        emit CandidateAdded(candidates.length - 1, name);
    }

    /**
     * @dev Cast a vote for a candidate
     * @param candidateIndex The index of the candidate to vote for
     */
    function vote(uint candidateIndex) 
        public 
        hasNotVoted 
        validCandidate(candidateIndex) 
    {
        hasVoted[msg.sender] = true;
        candidates[candidateIndex].voteCount++;
        emit VoteCast(msg.sender, candidateIndex);
    }

    /**
     * @dev Get all candidates and their vote counts
     * @return An array of all candidates
     */
    function getCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }

    /**
     * @dev Get the winner of the election
     * @return name The name of the winning candidate
     */
    function getWinner() public view returns (string memory name) {
        require(candidates.length > 0, "No candidates available");
        
        uint winningVoteCount = 0;
        uint winningIndex = 0;

        for (uint i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > winningVoteCount) {
                winningVoteCount = candidates[i].voteCount;
                winningIndex = i;
            }
        }

        return candidates[winningIndex].name;
    }

    /**
     * @dev Get total number of candidates
     * @return The number of candidates
     */
    function getCandidateCount() public view returns (uint) {
        return candidates.length;
    }

    /**
     * @dev Check if an address has voted
     * @param voter The address to check
     * @return Whether the address has voted
     */
    function checkIfVoted(address voter) public view returns (bool) {
        return hasVoted[voter];
    }
}