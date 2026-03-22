import { useMemo } from 'react'
import { API_ENDPOINTS } from '@/api/endpoints'
import { useAPI } from '@/hooks/useApi'
import type { ShipmentResponseDto } from '@/types'
import {
  deriveDashboardKpis,
  toDashboardShipmentRow,
  type DashboardShipmentRow,
  type DashboardKpiView,
} from '@/utils/dashboard-derive'

export interface DashboardViewModel {
  kpis: DashboardKpiView
  recentShipments: DashboardShipmentRow[]
}

export function useDashboardPage() {
  const { data, loading, error, refetch } = useAPI<ShipmentResponseDto[]>(API_ENDPOINTS.SHIPMENTS.LIST)

  const viewModel = useMemo<DashboardViewModel | null>(() => {
    if (!data) return null
    return {
      kpis: deriveDashboardKpis(data),
      recentShipments: data.slice(0, 5).map(toDashboardShipmentRow),
    }
  }, [data])

  return {
    dashboard: {
      data: viewModel,
      loading,
      error: error?.message ?? null,
    },
    refetch,
  }
}
