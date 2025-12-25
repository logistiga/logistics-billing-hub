<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'stats' => [
                'revenue' => $this->resource['revenue'] ?? 0,
                'revenue_change' => $this->resource['revenue_change'] ?? 0,
                'invoices_count' => $this->resource['invoices_count'] ?? 0,
                'invoices_pending' => $this->resource['invoices_pending'] ?? 0,
                'invoices_overdue' => $this->resource['invoices_overdue'] ?? 0,
                'clients_count' => $this->resource['clients_count'] ?? 0,
                'new_clients' => $this->resource['new_clients'] ?? 0,
                'receivables' => $this->resource['receivables'] ?? 0,
                'cash_balance' => $this->resource['cash_balance'] ?? 0,
                'bank_balance' => $this->resource['bank_balance'] ?? 0,
            ],
            'charts' => [
                'revenue_by_month' => $this->resource['revenue_by_month'] ?? [],
                'revenue_by_type' => $this->resource['revenue_by_type'] ?? [],
                'invoices_by_status' => $this->resource['invoices_by_status'] ?? [],
            ],
            'recent_activities' => $this->resource['recent_activities'] ?? [],
            'top_clients' => $this->resource['top_clients'] ?? [],
            'overdue_invoices' => $this->resource['overdue_invoices'] ?? [],
        ];
    }
}
