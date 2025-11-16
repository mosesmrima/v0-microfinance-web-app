// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title FinFlowLoanRegistry
 * @dev Single contract for KYC status and loan approval tracking
 * @notice This contract runs in the background - users never interact directly
 *
 * Architecture:
 * - Frontend → Backend API → This Contract (via system wallet)
 * - No user wallet connection needed
 * - Immutable audit trail for compliance
 */
contract FinFlowLoanRegistry is AccessControl, ReentrancyGuard {

    // ===========================================
    // ROLES
    // ===========================================
    bytes32 public constant SYSTEM_ROLE = keccak256("SYSTEM_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // ===========================================
    // KYC STATUS TRACKING
    // ===========================================

    enum KYCStatus {
        NOT_SUBMITTED,  // 0: User hasn't uploaded docs
        PENDING,        // 1: Documents submitted, awaiting review
        VERIFIED,       // 2: KYC approved
        REJECTED        // 3: KYC rejected
    }

    struct KYCRecord {
        string userId;           // Supabase user ID
        KYCStatus status;
        uint256 verifiedAt;      // Timestamp of verification
        string verifiedBy;       // ID of verifier (admin/system)
        string documentHash;     // IPFS hash or SHA-256 of documents
        uint256 updatedAt;
    }

    // userId → KYC record
    mapping(string => KYCRecord) public kycRecords;

    // ===========================================
    // LOAN APPROVAL TRACKING
    // ===========================================

    enum LoanStatus {
        SUBMITTED,           // 0: Application submitted
        AUTO_APPROVED,       // 1: Auto-approved by system (< $10K)
        PENDING_MANUAL,      // 2: Requires manual approval
        MANUALLY_APPROVED,   // 3: Approved by MD/Finance Director
        REJECTED,            // 4: Rejected
        DISBURSED            // 5: Funds disbursed
    }

    struct LoanRecord {
        string loanId;              // Supabase loan ID
        string userId;              // Supabase user ID
        uint256 amount;             // Loan amount in cents (e.g., $10,000 = 1000000)
        uint256 creditScore;
        LoanStatus status;
        bool autoApproved;
        string approvedBy;          // User ID of approver (or "SYSTEM")
        uint256 submittedAt;
        uint256 approvedAt;
        bytes32 transactionHash;    // Hash of this transaction
    }

    // loanId → Loan record
    mapping(string => LoanRecord) public loanRecords;

    // userId → list of their loan IDs
    mapping(string => string[]) public userLoans;

    // ===========================================
    // CONFIGURATION
    // ===========================================

    uint256 public AUTO_APPROVAL_THRESHOLD = 1000000; // $10,000 in cents
    uint256 public MIN_CREDIT_SCORE = 650;

    // ===========================================
    // EVENTS
    // ===========================================

    // KYC Events
    event KYCStatusUpdated(
        string indexed userId,
        KYCStatus status,
        string verifiedBy,
        uint256 timestamp
    );

    // Loan Events
    event LoanSubmitted(
        string indexed loanId,
        string indexed userId,
        uint256 amount,
        uint256 creditScore,
        uint256 timestamp
    );

    event LoanAutoApproved(
        string indexed loanId,
        string indexed userId,
        uint256 amount,
        uint256 timestamp
    );

    event LoanEscalated(
        string indexed loanId,
        string reason,
        uint256 timestamp
    );

    event LoanManuallyApproved(
        string indexed loanId,
        string approvedBy,
        uint256 timestamp
    );

    event LoanRejected(
        string indexed loanId,
        string reason,
        uint256 timestamp
    );

    event LoanDisbursed(
        string indexed loanId,
        uint256 amount,
        uint256 timestamp
    );

    // ===========================================
    // CONSTRUCTOR
    // ===========================================

    constructor(address systemWallet, address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(SYSTEM_ROLE, systemWallet);
        _grantRole(ADMIN_ROLE, admin);
    }

    // ===========================================
    // KYC FUNCTIONS
    // ===========================================

    /**
     * @dev Update KYC status for a user
     * @param userId Supabase user ID
     * @param status New KYC status
     * @param verifiedBy ID of verifier
     * @param documentHash Hash of KYC documents (IPFS or SHA-256)
     */
    function updateKYCStatus(
        string memory userId,
        KYCStatus status,
        string memory verifiedBy,
        string memory documentHash
    ) external onlyRole(SYSTEM_ROLE) {
        require(bytes(userId).length > 0, "Invalid user ID");

        kycRecords[userId] = KYCRecord({
            userId: userId,
            status: status,
            verifiedAt: status == KYCStatus.VERIFIED ? block.timestamp : 0,
            verifiedBy: verifiedBy,
            documentHash: documentHash,
            updatedAt: block.timestamp
        });

        emit KYCStatusUpdated(userId, status, verifiedBy, block.timestamp);
    }

    /**
     * @dev Get KYC status for a user
     * @param userId Supabase user ID
     */
    function getKYCStatus(string memory userId)
        external
        view
        returns (KYCStatus)
    {
        return kycRecords[userId].status;
    }

    /**
     * @dev Check if user's KYC is verified
     * @param userId Supabase user ID
     */
    function isKYCVerified(string memory userId)
        public
        view
        returns (bool)
    {
        return kycRecords[userId].status == KYCStatus.VERIFIED;
    }

    // ===========================================
    // LOAN APPROVAL FUNCTIONS
    // ===========================================

    /**
     * @dev Submit loan application and check for auto-approval
     * @param loanId Supabase loan ID
     * @param userId Supabase user ID
     * @param amount Loan amount in cents
     * @param creditScore User's credit score
     * @return autoApproved Whether loan was auto-approved
     */
    function submitLoanApplication(
        string memory loanId,
        string memory userId,
        uint256 amount,
        uint256 creditScore
    ) external onlyRole(SYSTEM_ROLE) nonReentrant returns (bool autoApproved) {
        require(bytes(loanId).length > 0, "Invalid loan ID");
        require(bytes(userId).length > 0, "Invalid user ID");
        require(amount > 0, "Amount must be greater than zero");
        require(creditScore >= 300 && creditScore <= 850, "Invalid credit score");
        require(loanRecords[loanId].submittedAt == 0, "Loan already exists");

        // Check if KYC is verified
        require(isKYCVerified(userId), "KYC not verified");

        // Initialize loan record
        loanRecords[loanId] = LoanRecord({
            loanId: loanId,
            userId: userId,
            amount: amount,
            creditScore: creditScore,
            status: LoanStatus.SUBMITTED,
            autoApproved: false,
            approvedBy: "",
            submittedAt: block.timestamp,
            approvedAt: 0,
            transactionHash: bytes32(0)
        });

        // Add to user's loans
        userLoans[userId].push(loanId);

        emit LoanSubmitted(loanId, userId, amount, creditScore, block.timestamp);

        // Check for auto-approval
        if (amount < AUTO_APPROVAL_THRESHOLD && creditScore >= MIN_CREDIT_SCORE) {
            loanRecords[loanId].status = LoanStatus.AUTO_APPROVED;
            loanRecords[loanId].autoApproved = true;
            loanRecords[loanId].approvedBy = "SYSTEM";
            loanRecords[loanId].approvedAt = block.timestamp;
            loanRecords[loanId].transactionHash = blockhash(block.number - 1);

            emit LoanAutoApproved(loanId, userId, amount, block.timestamp);
            return true;
        } else {
            // Escalate for manual review
            loanRecords[loanId].status = LoanStatus.PENDING_MANUAL;

            string memory reason;
            if (amount >= AUTO_APPROVAL_THRESHOLD) {
                reason = "Amount exceeds auto-approval threshold";
            } else {
                reason = "Credit score below minimum threshold";
            }

            emit LoanEscalated(loanId, reason, block.timestamp);
            return false;
        }
    }

    /**
     * @dev Manually approve a loan (MD or Finance Director)
     * @param loanId Supabase loan ID
     * @param approverId ID of approver
     */
    function manuallyApproveLoan(
        string memory loanId,
        string memory approverId
    ) external onlyRole(SYSTEM_ROLE) {
        require(bytes(loanId).length > 0, "Invalid loan ID");
        require(loanRecords[loanId].submittedAt > 0, "Loan does not exist");
        require(
            loanRecords[loanId].status == LoanStatus.PENDING_MANUAL,
            "Loan not pending manual approval"
        );

        loanRecords[loanId].status = LoanStatus.MANUALLY_APPROVED;
        loanRecords[loanId].approvedBy = approverId;
        loanRecords[loanId].approvedAt = block.timestamp;
        loanRecords[loanId].transactionHash = blockhash(block.number - 1);

        emit LoanManuallyApproved(loanId, approverId, block.timestamp);
    }

    /**
     * @dev Reject a loan
     * @param loanId Supabase loan ID
     * @param reason Rejection reason
     */
    function rejectLoan(
        string memory loanId,
        string memory reason
    ) external onlyRole(SYSTEM_ROLE) {
        require(bytes(loanId).length > 0, "Invalid loan ID");
        require(loanRecords[loanId].submittedAt > 0, "Loan does not exist");

        loanRecords[loanId].status = LoanStatus.REJECTED;

        emit LoanRejected(loanId, reason, block.timestamp);
    }

    /**
     * @dev Mark loan as disbursed
     * @param loanId Supabase loan ID
     */
    function markLoanDisbursed(string memory loanId)
        external
        onlyRole(SYSTEM_ROLE)
    {
        require(bytes(loanId).length > 0, "Invalid loan ID");
        LoanRecord storage loan = loanRecords[loanId];
        require(loan.submittedAt > 0, "Loan does not exist");
        require(
            loan.status == LoanStatus.AUTO_APPROVED ||
            loan.status == LoanStatus.MANUALLY_APPROVED,
            "Loan not approved"
        );

        loan.status = LoanStatus.DISBURSED;

        emit LoanDisbursed(loanId, loan.amount, block.timestamp);
    }

    /**
     * @dev Get loan status
     * @param loanId Supabase loan ID
     */
    function getLoanStatus(string memory loanId)
        external
        view
        returns (LoanStatus)
    {
        return loanRecords[loanId].status;
    }

    /**
     * @dev Get all loans for a user
     * @param userId Supabase user ID
     */
    function getUserLoans(string memory userId)
        external
        view
        returns (string[] memory)
    {
        return userLoans[userId];
    }

    /**
     * @dev Check if loan is approved
     * @param loanId Supabase loan ID
     */
    function isLoanApproved(string memory loanId)
        external
        view
        returns (bool)
    {
        LoanStatus status = loanRecords[loanId].status;
        return status == LoanStatus.AUTO_APPROVED ||
               status == LoanStatus.MANUALLY_APPROVED ||
               status == LoanStatus.DISBURSED;
    }

    // ===========================================
    // ADMIN FUNCTIONS
    // ===========================================

    /**
     * @dev Update auto-approval threshold
     */
    function updateAutoApprovalThreshold(uint256 newThreshold)
        external
        onlyRole(ADMIN_ROLE)
    {
        AUTO_APPROVAL_THRESHOLD = newThreshold;
    }

    /**
     * @dev Update minimum credit score
     */
    function updateMinCreditScore(uint256 newScore)
        external
        onlyRole(ADMIN_ROLE)
    {
        require(newScore >= 300 && newScore <= 850, "Invalid credit score");
        MIN_CREDIT_SCORE = newScore;
    }
}
