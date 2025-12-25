<?php

namespace App\Mail;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;

class InvoiceMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Invoice $invoice,
        public ?string $pdfPath = null,
        public ?string $message = null
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Facture {$this->invoice->numero} - LogistiGa",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.invoice',
            with: [
                'invoice' => $this->invoice,
                'client' => $this->invoice->client,
                'customMessage' => $this->message,
            ],
        );
    }

    public function attachments(): array
    {
        $attachments = [];

        if ($this->pdfPath && file_exists($this->pdfPath)) {
            $attachments[] = Attachment::fromPath($this->pdfPath)
                ->as("facture-{$this->invoice->numero}.pdf")
                ->withMime('application/pdf');
        }

        return $attachments;
    }
}
