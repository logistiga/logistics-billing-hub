<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Entreprise extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'legal_name',
        'legal_form',
        'nif',
        'nis',
        'rc',
        'ai',
        'capital',
        'address',
        'city',
        'postal_code',
        'country',
        'phone',
        'fax',
        'email',
        'website',
        'logo',
        'bank_name',
        'bank_account',
        'iban',
        'swift',
        'invoice_prefix',
        'invoice_footer',
        'invoice_terms',
        'default_payment_terms',
        'default_tax_rate',
        'currency',
        'fiscal_year_start',
    ];

    protected $casts = [
        'capital' => 'decimal:2',
        'default_payment_terms' => 'integer',
        'default_tax_rate' => 'decimal:2',
        'fiscal_year_start' => 'integer',
    ];

    // Accessors
    public function getLogoUrlAttribute()
    {
        if ($this->logo) {
            return \Storage::disk('public')->url($this->logo);
        }
        return null;
    }
}
