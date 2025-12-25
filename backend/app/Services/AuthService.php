<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;

class AuthService
{
    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function login(string $email, string $password): ?array
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return null;
        }

        if (!$user->is_active) {
            throw new \Exception('Votre compte a été désactivé.');
        }

        // Update last login
        $this->userService->updateLastLogin($user);

        // Create token
        $token = $user->createToken('auth-token')->plainTextToken;

        return [
            'user' => $user->load('roles'),
            'token' => $token,
        ];
    }

    public function register(array $data): array
    {
        $user = $this->userService->create($data);

        // Assign default role
        $user->assignRole('user');

        $token = $user->createToken('auth-token')->plainTextToken;

        return [
            'user' => $user->load('roles'),
            'token' => $token,
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    public function logoutAll(User $user): void
    {
        $user->tokens()->delete();
    }

    public function forgotPassword(string $email): string
    {
        $status = Password::sendResetLink(['email' => $email]);

        return $status;
    }

    public function resetPassword(array $data): string
    {
        $status = Password::reset(
            $data,
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new PasswordReset($user));
            }
        );

        return $status;
    }

    public function refreshToken(User $user): string
    {
        // Delete current token
        $user->currentAccessToken()->delete();

        // Create new token
        return $user->createToken('auth-token')->plainTextToken;
    }

    public function verifyEmail(User $user): void
    {
        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }
    }
}
