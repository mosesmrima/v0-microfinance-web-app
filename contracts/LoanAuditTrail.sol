// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LoanAuditTrail
 * @dev Simple immutable audit trail for microfinance events
 * @notice This contract only emits events - no PII stored
 */
contract LoanAuditTrail {

    // Owner for basic access control
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    // ============================================================================
    // EVENTS (Audit Trail)
    // ============================================================================

    event KYCVerified(
        string indexed userId,
        uint256 timestamp
    );

    event LoanCreated(
        string indexed loanId,
        string indexed userId,
        uint256 amount,
        uint256 timestamp
    );

    event PaymentMade(
        string indexed loanId,
        uint256 amount,
        uint256 timestamp
    );

    event LoanCompleted(
        string indexed loanId,
        uint256 timestamp
    );

    // ============================================================================
    // FUNCTIONS (Just emit events for audit)
    // ============================================================================

    function recordKYC(string memory userId) external onlyOwner {
        emit KYCVerified(userId, block.timestamp);
    }

    function recordLoan(
        string memory loanId,
        string memory userId,
        uint256 amount
    ) external onlyOwner {
        emit LoanCreated(loanId, userId, amount, block.timestamp);
    }

    function recordPayment(
        string memory loanId,
        uint256 amount
    ) external onlyOwner {
        emit PaymentMade(loanId, amount, block.timestamp);
    }

    function recordCompletion(string memory loanId) external onlyOwner {
        emit LoanCompleted(loanId, block.timestamp);
    }
}
