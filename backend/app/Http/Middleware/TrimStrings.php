<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrimStrings
{
    /**
     * The names of the attributes that should not be trimmed.
     */
    protected array $except = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Handle an incoming request.
     * Trims whitespace from string inputs.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $input = $request->all();

        $this->trimArray($input);

        $request->merge($input);

        return $next($request);
    }

    /**
     * Recursively trim array values.
     */
    protected function trimArray(array &$array): void
    {
        foreach ($array as $key => &$value) {
            if (in_array($key, $this->except, true)) {
                continue;
            }

            if (is_array($value)) {
                $this->trimArray($value);
            } elseif (is_string($value)) {
                $value = trim($value);
            }
        }
    }
}
