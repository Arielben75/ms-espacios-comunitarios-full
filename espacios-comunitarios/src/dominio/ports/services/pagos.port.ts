export interface PagosPort {
  processPayment(amount: number, paymentData: any): Promise<{ success: boolean; transactionId: string }>;
}