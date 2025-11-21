// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LoanAuditTrail
 * @dev Immutable audit trail for microfinance loans and KYC status
 * @notice This contract stores ONLY anonymous audit data - no PII
 *
 * Data is linked to users via UUID (stored in Supabase)
 * Provides transparent, tamper-proof history of:
 * - Loan applications and approvals
 * - Payment history
 * - KYC verification status
 * - Credit score updates
 */
contract LoanAuditTrail {

    // ============================================================================
    // EVENTS
    // ============================================================================

    event KYCVerified(
        string indexed userId,
        uint256 timestamp,
        uint8 verificationLevel // 1=basic, 2=intermediate, 3=advanced
    );

    event LoanApplicationCreated(
        string indexed userId,
        string indexed loanId,
        uint256 amount,
        uint16 durationMonths,
        uint16 interestRate, // Basis points (e.g., 850 = 8.5%)
        uint256 timestamp
    );

    event LoanApproved(
        string indexed loanId,
        string indexed institutionId,
        uint256 timestamp
    );

    event LoanDisbursed(
        string indexed loanId,
        uint256 amount,
        uint256 timestamp
    );

    event PaymentMade(
        string indexed loanId,
        string indexed paymentId,
        uint256 amount,
        uint256 timestamp,
        bool onTime
    );

    event LoanCompleted(
        string indexed loanId,
        uint256 totalPaid,
        uint256 timestamp
    );

    event LoanDefaulted(
        string indexed loanId,
        uint256 outstandingAmount,
        uint256 timestamp
    );

    event CreditScoreUpdated(
        string indexed userId,
        uint16 newScore,
        uint256 timestamp
    );

    // ============================================================================
    // STRUCTS
    // ============================================================================

    struct KYCRecord {
        uint256 verifiedAt;
        uint8 verificationLevel;
        bool isActive;
    }

    struct LoanRecord {
        string userId;
        string institutionId;
        uint256 amount;
        uint16 durationMonths;
        uint16 interestRate; // Basis points
        uint256 createdAt;
        uint256 approvedAt;
        uint256 disbursedAt;
        uint256 completedAt;
        uint256 totalPaid;
        uint8 status; // 0=pending, 1=approved, 2=active, 3=completed, 4=defaulted
        bool exists;
    }

    struct PaymentRecord {
        string loanId;
        uint256 amount;
        uint256 paidAt;
        bool onTime;
        bool exists;
    }

    struct CreditHistory {
        uint16 currentScore;
        uint16 totalLoans;
        uint16 completedLoans;
        uint16 defaultedLoans;
        uint256 lastUpdated;
    }

    // ============================================================================
    // STATE VARIABLES
    // ============================================================================

    // Mappings
    mapping(string => KYCRecord) public kycRecords;
    mapping(string => LoanRecord) public loanRecords;
    mapping(string => PaymentRecord) public paymentRecords;
    mapping(string => CreditHistory) public creditHistories;

    // User's loan IDs
    mapping(string => string[]) public userLoans;

    // Loan's payment IDs
    mapping(string => string[]) public loanPayments;

    // Access control
    address public owner;
    mapping(address => bool) public authorizedInstitutions;

    // ============================================================================
    // MODIFIERS
    // ============================================================================

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == owner || authorizedInstitutions[msg.sender],
            "Not authorized"
        );
        _;
    }

    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================

    constructor() {
        owner = msg.sender;
    }

    // ============================================================================
    // ADMIN FUNCTIONS
    // ============================================================================

    function authorizeInstitution(address institution) external onlyOwner {
        authorizedInstitutions[institution] = true;
    }

    function revokeInstitution(address institution) external onlyOwner {
        authorizedInstitutions[institution] = false;
    }

    // ============================================================================
    // KYC FUNCTIONS
    // ============================================================================

    function recordKYCVerification(
        string memory userId,
        uint8 verificationLevel
    ) external onlyAuthorized {
        require(verificationLevel >= 1 && verificationLevel <= 3, "Invalid level");

        kycRecords[userId] = KYCRecord({
            verifiedAt: block.timestamp,
            verificationLevel: verificationLevel,
            isActive: true
        });

        emit KYCVerified(userId, block.timestamp, verificationLevel);
    }

    function revokeKYC(string memory userId) external onlyAuthorized {
        kycRecords[userId].isActive = false;
    }

    function isKYCVerified(string memory userId) external view returns (bool) {
        return kycRecords[userId].isActive;
    }

    // ============================================================================
    // LOAN FUNCTIONS
    // ============================================================================

    function createLoanApplication(
        string memory userId,
        string memory loanId,
        uint256 amount,
        uint16 durationMonths,
        uint16 interestRate
    ) external onlyAuthorized {
        require(!loanRecords[loanId].exists, "Loan already exists");
        require(kycRecords[userId].isActive, "KYC not verified");

        loanRecords[loanId] = LoanRecord({
            userId: userId,
            institutionId: "", // Set on approval
            amount: amount,
            durationMonths: durationMonths,
            interestRate: interestRate,
            createdAt: block.timestamp,
            approvedAt: 0,
            disbursedAt: 0,
            completedAt: 0,
            totalPaid: 0,
            status: 0, // pending
            exists: true
        });

        userLoans[userId].push(loanId);

        emit LoanApplicationCreated(
            userId,
            loanId,
            amount,
            durationMonths,
            interestRate,
            block.timestamp
        );
    }

    function approveLoan(
        string memory loanId,
        string memory institutionId
    ) external onlyAuthorized {
        require(loanRecords[loanId].exists, "Loan does not exist");
        require(loanRecords[loanId].status == 0, "Loan already processed");

        loanRecords[loanId].institutionId = institutionId;
        loanRecords[loanId].approvedAt = block.timestamp;
        loanRecords[loanId].status = 1; // approved

        emit LoanApproved(loanId, institutionId, block.timestamp);
    }

    function disburseLoan(string memory loanId) external onlyAuthorized {
        require(loanRecords[loanId].exists, "Loan does not exist");
        require(loanRecords[loanId].status == 1, "Loan not approved");

        loanRecords[loanId].disbursedAt = block.timestamp;
        loanRecords[loanId].status = 2; // active

        emit LoanDisbursed(
            loanId,
            loanRecords[loanId].amount,
            block.timestamp
        );
    }

    // ============================================================================
    // PAYMENT FUNCTIONS
    // ============================================================================

    function recordPayment(
        string memory loanId,
        string memory paymentId,
        uint256 amount,
        bool onTime
    ) external onlyAuthorized {
        require(loanRecords[loanId].exists, "Loan does not exist");
        require(!paymentRecords[paymentId].exists, "Payment already recorded");
        require(loanRecords[loanId].status == 2, "Loan not active");

        paymentRecords[paymentId] = PaymentRecord({
            loanId: loanId,
            amount: amount,
            paidAt: block.timestamp,
            onTime: onTime,
            exists: true
        });

        loanRecords[loanId].totalPaid += amount;
        loanPayments[loanId].push(paymentId);

        emit PaymentMade(loanId, paymentId, amount, block.timestamp, onTime);

        // Update user's credit history
        string memory userId = loanRecords[loanId].userId;
        if (!onTime) {
            // Late payment affects credit
            if (creditHistories[userId].currentScore > 50) {
                creditHistories[userId].currentScore -= 5;
                emit CreditScoreUpdated(
                    userId,
                    creditHistories[userId].currentScore,
                    block.timestamp
                );
            }
        }
    }

    function completeLoan(string memory loanId) external onlyAuthorized {
        require(loanRecords[loanId].exists, "Loan does not exist");
        require(loanRecords[loanId].status == 2, "Loan not active");

        loanRecords[loanId].completedAt = block.timestamp;
        loanRecords[loanId].status = 3; // completed

        // Update credit history
        string memory userId = loanRecords[loanId].userId;
        creditHistories[userId].completedLoans++;
        creditHistories[userId].lastUpdated = block.timestamp;

        emit LoanCompleted(
            loanId,
            loanRecords[loanId].totalPaid,
            block.timestamp
        );
    }

    function defaultLoan(
        string memory loanId,
        uint256 outstandingAmount
    ) external onlyAuthorized {
        require(loanRecords[loanId].exists, "Loan does not exist");
        require(loanRecords[loanId].status == 2, "Loan not active");

        loanRecords[loanId].completedAt = block.timestamp;
        loanRecords[loanId].status = 4; // defaulted

        // Update credit history
        string memory userId = loanRecords[loanId].userId;
        creditHistories[userId].defaultedLoans++;
        creditHistories[userId].lastUpdated = block.timestamp;

        // Significant credit score penalty
        if (creditHistories[userId].currentScore > 100) {
            creditHistories[userId].currentScore -= 100;
            emit CreditScoreUpdated(
                userId,
                creditHistories[userId].currentScore,
                block.timestamp
            );
        }

        emit LoanDefaulted(loanId, outstandingAmount, block.timestamp);
    }

    // ============================================================================
    // CREDIT SCORE FUNCTIONS
    // ============================================================================

    function updateCreditScore(
        string memory userId,
        uint16 newScore
    ) external onlyAuthorized {
        require(newScore >= 300 && newScore <= 850, "Invalid score range");

        creditHistories[userId].currentScore = newScore;
        creditHistories[userId].lastUpdated = block.timestamp;

        emit CreditScoreUpdated(userId, newScore, block.timestamp);
    }

    // ============================================================================
    // VIEW FUNCTIONS
    // ============================================================================

    function getUserLoanCount(string memory userId) external view returns (uint256) {
        return userLoans[userId].length;
    }

    function getLoanPaymentCount(string memory loanId) external view returns (uint256) {
        return loanPayments[loanId].length;
    }

    function getUserLoanHistory(
        string memory userId
    ) external view returns (string[] memory) {
        return userLoans[userId];
    }

    function getLoanPaymentHistory(
        string memory loanId
    ) external view returns (string[] memory) {
        return loanPayments[loanId];
    }
}
