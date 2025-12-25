<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ConvertEmptyStringsToNull
{
    /**
     * The names of the attributes that should not be converted.
     */
    protected array $except = [];

    /**
     * Handle an incoming request.
     * Converts empty strings to null.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $input = $request->all();

        $this->convertArray($input);

        $request->merge($input);

        return $next($request);
    }

    /**
     * Recursively convert empty strings to null.
     */
    protected function convertArray(array &$array): void
    {
        foreach ($array as $key => &$value) {
            if (in_array($key, $this->except, true)) {
                continue;
            }

            if (is_array($value)) {
                $this->convertArray($value);
            } elseif ($value === '') {
                $value = null;
            }
        }
    }
}
