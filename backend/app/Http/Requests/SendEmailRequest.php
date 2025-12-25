<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SendEmailRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'to' => 'required|email|max:255',
            'cc' => 'nullable|array',
            'cc.*' => 'email|max:255',
            'bcc' => 'nullable|array',
            'bcc.*' => 'email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:10000',
            'attach_document' => 'nullable|boolean',
            'document_type' => 'nullable|in:invoice,devis,avoir,ordre',
            'document_id' => 'nullable|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'to.required' => 'L\'adresse email du destinataire est obligatoire.',
            'to.email' => 'L\'adresse email du destinataire n\'est pas valide.',
            'cc.*.email' => 'Une des adresses CC n\'est pas valide.',
            'bcc.*.email' => 'Une des adresses BCC n\'est pas valide.',
            'subject.required' => 'L\'objet du message est obligatoire.',
            'message.required' => 'Le contenu du message est obligatoire.',
        ];
    }
}
