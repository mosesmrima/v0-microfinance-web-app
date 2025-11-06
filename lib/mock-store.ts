/**
 * Mock LocalStorage Service
 *
 * This service simulates a backend database using localStorage.
 * All data operations are persisted to localStorage to simulate
 * data persistence without a real backend.
 */

import {
  Profile,
  Loan,
  LoanProduct,
  KYCDocument,
  FraudDetection,
  Payment,
  PaymentSchedule,
  SystemAnalytics,
  Notification,
} from "./types"

import {
  mockProfiles,
  mockLoans,
  mockLoanProducts,
  mockKYCDocuments,
  mockFraudAlerts,
  mockPayments,
  mockPaymentSchedules,
  mockSystemAnalytics,
  mockNotifications,
} from "./mock-data"

// LocalStorage keys
const STORAGE_KEYS = {
  PROFILES: "finflow_profiles",
  LOANS: "finflow_loans",
  LOAN_PRODUCTS: "finflow_loan_products",
  KYC_DOCUMENTS: "finflow_kyc_documents",
  FRAUD_ALERTS: "finflow_fraud_alerts",
  PAYMENTS: "finflow_payments",
  PAYMENT_SCHEDULES: "finflow_payment_schedules",
  ANALYTICS: "finflow_analytics",
  NOTIFICATIONS: "finflow_notifications",
  INITIALIZED: "finflow_initialized",
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize localStorage with mock data if not already initialized
 */
export function initializeMockStore() {
  if (typeof window === "undefined") return // Server-side rendering check

  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED)

  if (!isInitialized) {
    // Initialize with mock data
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(mockProfiles))
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(mockLoans))
    localStorage.setItem(STORAGE_KEYS.LOAN_PRODUCTS, JSON.stringify(mockLoanProducts))
    localStorage.setItem(STORAGE_KEYS.KYC_DOCUMENTS, JSON.stringify(mockKYCDocuments))
    localStorage.setItem(STORAGE_KEYS.FRAUD_ALERTS, JSON.stringify(mockFraudAlerts))
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(mockPayments))
    localStorage.setItem(STORAGE_KEYS.PAYMENT_SCHEDULES, JSON.stringify(mockPaymentSchedules))
    localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(mockSystemAnalytics))
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(mockNotifications))
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, "true")
  }
}

/**
 * Reset all data to initial mock data
 */
export function resetMockStore() {
  if (typeof window === "undefined") return

  localStorage.removeItem(STORAGE_KEYS.INITIALIZED)
  initializeMockStore()
}

// ============================================
// GENERIC HELPERS
// ============================================

function getFromStorage<T>(key: string, defaultValue: T[]): T[] {
  if (typeof window === "undefined") return defaultValue

  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error)
    return defaultValue
  }
}

function saveToStorage<T>(key: string, data: T[]) {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error)
  }
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ============================================
// PROFILE OPERATIONS
// ============================================

export function getProfiles(): Profile[] {
  return getFromStorage(STORAGE_KEYS.PROFILES, mockProfiles)
}

export function getProfileById(id: string): Profile | undefined {
  const profiles = getProfiles()
  return profiles.find((p) => p.id === id)
}

export function updateProfile(id: string, updates: Partial<Profile>): Profile | null {
  const profiles = getProfiles()
  const index = profiles.findIndex((p) => p.id === id)

  if (index === -1) return null

  profiles[index] = {
    ...profiles[index],
    ...updates,
    updated_at: new Date().toISOString(),
  }

  saveToStorage(STORAGE_KEYS.PROFILES, profiles)
  return profiles[index]
}

// ============================================
// LOAN OPERATIONS
// ============================================

export function getLoans(): Loan[] {
  return getFromStorage(STORAGE_KEYS.LOANS, mockLoans)
}

export function getLoanById(id: string): Loan | undefined {
  const loans = getLoans()
  return loans.find((l) => l.id === id)
}

export function getLoansByUserId(userId: string): Loan[] {
  const loans = getLoans()
  return loans.filter((l) => l.user_id === userId)
}

export function getLoansByStatus(status: Loan["status"]): Loan[] {
  const loans = getLoans()
  return loans.filter((l) => l.status === status)
}

export function getPendingLoansForOfficer(): Loan[] {
  const loans = getLoans()
  // Loans < $10K that are pending_loan_officer
  return loans.filter((l) => l.amount < 10000 && l.status === "pending_loan_officer")
}

export function getPendingLoansForManager(): Loan[] {
  const loans = getLoans()
  // Loans >= $10K that are pending_loan_manager
  return loans.filter((l) => l.amount >= 10000 && l.status === "pending_loan_manager")
}

export function createLoan(loanData: Omit<Loan, "id" | "created_at" | "updated_at">): Loan {
  const loans = getLoans()
  const newLoan: Loan = {
    ...loanData,
    id: generateId("loan"),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  loans.push(newLoan)
  saveToStorage(STORAGE_KEYS.LOANS, loans)
  return newLoan
}

export function updateLoan(id: string, updates: Partial<Loan>): Loan | null {
  const loans = getLoans()
  const index = loans.findIndex((l) => l.id === id)

  if (index === -1) return null

  loans[index] = {
    ...loans[index],
    ...updates,
    updated_at: new Date().toISOString(),
  }

  saveToStorage(STORAGE_KEYS.LOANS, loans)
  return loans[index]
}

// ============================================
// LOAN PRODUCT OPERATIONS
// ============================================

export function getLoanProducts(): LoanProduct[] {
  return getFromStorage(STORAGE_KEYS.LOAN_PRODUCTS, mockLoanProducts)
}

export function getLoanProductById(id: string): LoanProduct | undefined {
  const products = getLoanProducts()
  return products.find((p) => p.id === id)
}

// ============================================
// KYC DOCUMENT OPERATIONS
// ============================================

export function getKYCDocuments(): KYCDocument[] {
  return getFromStorage(STORAGE_KEYS.KYC_DOCUMENTS, mockKYCDocuments)
}

export function getKYCDocumentsByUserId(userId: string): KYCDocument[] {
  const documents = getKYCDocuments()
  return documents.filter((d) => d.user_id === userId)
}

export function getKYCDocumentsByStage(stage: "stage1" | "stage2"): KYCDocument[] {
  const documents = getKYCDocuments()
  return documents.filter((d) => d.stage === stage)
}

export function getKYCDocumentsByStatus(status: "pending" | "verified" | "rejected"): KYCDocument[] {
  const documents = getKYCDocuments()
  return documents.filter((d) => d.status === status)
}

export function getPendingKYCDocuments(): KYCDocument[] {
  return getKYCDocumentsByStatus("pending")
}

export function createKYCDocument(
  docData: Omit<KYCDocument, "id" | "uploaded_at">
): KYCDocument {
  const documents = getKYCDocuments()
  const newDoc: KYCDocument = {
    ...docData,
    id: generateId("kyc"),
    uploaded_at: new Date().toISOString(),
  }

  documents.push(newDoc)
  saveToStorage(STORAGE_KEYS.KYC_DOCUMENTS, documents)
  return newDoc
}

export function updateKYCDocument(id: string, updates: Partial<KYCDocument>): KYCDocument | null {
  const documents = getKYCDocuments()
  const index = documents.findIndex((d) => d.id === id)

  if (index === -1) return null

  documents[index] = {
    ...documents[index],
    ...updates,
  }

  saveToStorage(STORAGE_KEYS.KYC_DOCUMENTS, documents)
  return documents[index]
}

// ============================================
// FRAUD DETECTION OPERATIONS
// ============================================

export function getFraudAlerts(): FraudDetection[] {
  return getFromStorage(STORAGE_KEYS.FRAUD_ALERTS, mockFraudAlerts)
}

export function getFraudAlertsByLoanId(loanId: string): FraudDetection | undefined {
  const alerts = getFraudAlerts()
  return alerts.find((a) => a.loan_id === loanId)
}

export function getPendingFraudAlerts(): FraudDetection[] {
  const alerts = getFraudAlerts()
  return alerts.filter((a) => !a.reviewed_at)
}

export function updateFraudAlert(id: string, updates: Partial<FraudDetection>): FraudDetection | null {
  const alerts = getFraudAlerts()
  const index = alerts.findIndex((a) => a.id === id)

  if (index === -1) return null

  alerts[index] = {
    ...alerts[index],
    ...updates,
  }

  saveToStorage(STORAGE_KEYS.FRAUD_ALERTS, alerts)
  return alerts[index]
}

// ============================================
// PAYMENT OPERATIONS
// ============================================

export function getPayments(): Payment[] {
  return getFromStorage(STORAGE_KEYS.PAYMENTS, mockPayments)
}

export function getPaymentsByLoanId(loanId: string): Payment[] {
  const payments = getPayments()
  return payments.filter((p) => p.loan_id === loanId)
}

export function getPaymentsByUserId(userId: string): Payment[] {
  const payments = getPayments()
  return payments.filter((p) => p.user_id === userId)
}

export function createPayment(
  paymentData: Omit<Payment, "id" | "created_at" | "updated_at">
): Payment {
  const payments = getPayments()
  const newPayment: Payment = {
    ...paymentData,
    id: generateId("pay"),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  payments.push(newPayment)
  saveToStorage(STORAGE_KEYS.PAYMENTS, payments)
  return newPayment
}

// ============================================
// PAYMENT SCHEDULE OPERATIONS
// ============================================

export function getPaymentSchedules(): PaymentSchedule[] {
  return getFromStorage(STORAGE_KEYS.PAYMENT_SCHEDULES, mockPaymentSchedules)
}

export function getPaymentScheduleByLoanId(loanId: string): PaymentSchedule[] {
  const schedules = getPaymentSchedules()
  return schedules.filter((s) => s.loan_id === loanId).sort((a, b) => a.installment_number - b.installment_number)
}

export function getAllPaymentSchedules(): PaymentSchedule[] {
  return getPaymentSchedules()
}

export function updatePaymentSchedule(id: string, updates: Partial<PaymentSchedule>): PaymentSchedule | null {
  const schedules = getPaymentSchedules()
  const index = schedules.findIndex((s) => s.id === id)

  if (index === -1) return null

  schedules[index] = {
    ...schedules[index],
    ...updates,
  }

  saveToStorage(STORAGE_KEYS.PAYMENT_SCHEDULES, schedules)
  return schedules[index]
}

// ============================================
// ANALYTICS OPERATIONS
// ============================================

export function getSystemAnalytics(): SystemAnalytics {
  if (typeof window === "undefined") return mockSystemAnalytics

  try {
    const data = localStorage.getItem(STORAGE_KEYS.ANALYTICS)
    return data ? JSON.parse(data) : mockSystemAnalytics
  } catch (error) {
    console.error("Error reading analytics:", error)
    return mockSystemAnalytics
  }
}

export function updateSystemAnalytics(updates: Partial<SystemAnalytics>): SystemAnalytics {
  const current = getSystemAnalytics()
  const updated = {
    ...current,
    ...updates,
    last_updated: new Date().toISOString(),
  }

  saveToStorage(STORAGE_KEYS.ANALYTICS, [updated])
  return updated
}

// ============================================
// NOTIFICATION OPERATIONS
// ============================================

export function getNotifications(): Notification[] {
  return getFromStorage(STORAGE_KEYS.NOTIFICATIONS, mockNotifications)
}

export function getNotificationsByUserId(userId: string): Notification[] {
  const notifications = getNotifications()
  return notifications.filter((n) => n.user_id === userId).sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

export function getUnreadNotificationCount(userId: string): number {
  const notifications = getNotificationsByUserId(userId)
  return notifications.filter((n) => !n.read).length
}

export function createNotification(
  notifData: Omit<Notification, "id" | "created_at">
): Notification {
  const notifications = getNotifications()
  const newNotification: Notification = {
    ...notifData,
    id: generateId("notif"),
    created_at: new Date().toISOString(),
  }

  notifications.push(newNotification)
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications)
  return newNotification
}

export function markNotificationAsRead(id: string): Notification | null {
  const notifications = getNotifications()
  const index = notifications.findIndex((n) => n.id === id)

  if (index === -1) return null

  notifications[index].read = true
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications)
  return notifications[index]
}

export function markAllNotificationsAsRead(userId: string): void {
  const notifications = getNotifications()
  const updated = notifications.map((n) => {
    if (n.user_id === userId && !n.read) {
      return { ...n, read: true }
    }
    return n
  })

  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated)
}
