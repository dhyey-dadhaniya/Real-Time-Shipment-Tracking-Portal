export type BidStatusApi = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export interface BidResponseDto {
  id: number
  amount: string | number
  status: BidStatusApi
  createdAt: string
  shipmentId: number
  carrierId: number
}

export interface CreateBidRequestDto {
  shipmentId: number
  amount: number
}
