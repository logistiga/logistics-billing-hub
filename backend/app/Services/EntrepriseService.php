<?php

namespace App\Services;

use App\Models\Entreprise;
use Illuminate\Support\Facades\Storage;

class EntrepriseService
{
    public function get(): ?Entreprise
    {
        return Entreprise::first();
    }

    public function createOrUpdate(array $data): Entreprise
    {
        $entreprise = Entreprise::first();

        if ($entreprise) {
            $entreprise->update($data);
        } else {
            $entreprise = Entreprise::create($data);
        }

        return $entreprise;
    }

    public function uploadLogo($file): string
    {
        $entreprise = $this->get();
        
        // Delete old logo if exists
        if ($entreprise && $entreprise->logo) {
            Storage::disk('public')->delete($entreprise->logo);
        }

        $path = $file->store('logos', 'public');

        if ($entreprise) {
            $entreprise->update(['logo' => $path]);
        }

        return $path;
    }

    public function deleteLogo(): bool
    {
        $entreprise = $this->get();
        
        if ($entreprise && $entreprise->logo) {
            Storage::disk('public')->delete($entreprise->logo);
            $entreprise->update(['logo' => null]);
            return true;
        }

        return false;
    }

    public function getNextNumber(string $type): int
    {
        $entreprise = $this->get();
        
        $field = match ($type) {
            'invoice' => 'next_invoice_number',
            'devis' => 'next_devis_number',
            'avoir' => 'next_avoir_number',
            'ordre' => 'next_ordre_number',
            default => null,
        };

        if (!$field || !$entreprise) {
            return 1;
        }

        return $entreprise->$field;
    }

    public function incrementNumber(string $type): void
    {
        $entreprise = $this->get();
        
        $field = match ($type) {
            'invoice' => 'next_invoice_number',
            'devis' => 'next_devis_number',
            'avoir' => 'next_avoir_number',
            'ordre' => 'next_ordre_number',
            default => null,
        };

        if ($field && $entreprise) {
            $entreprise->increment($field);
        }
    }

    public function getTvaRates(): array
    {
        return [
            ['rate' => 0, 'label' => 'Exonéré'],
            ['rate' => 5.5, 'label' => 'TVA 5.5%'],
            ['rate' => 10, 'label' => 'TVA 10%'],
            ['rate' => 20, 'label' => 'TVA 20%'],
        ];
    }
}
