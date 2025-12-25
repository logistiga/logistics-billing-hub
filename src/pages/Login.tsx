import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Ship, Loader2, Mail, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthContext } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Adresse email invalide" }),
  password: z.string().min(1, { message: "Mot de passe requis" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await login({ email: data.email, password: data.password });
      navigate("/", { replace: true });
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors?.email) {
        setError(err.response.data.errors.email[0]);
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-border/50 shadow-xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4"
            >
              <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center shadow-colored">
                <Ship className="h-8 w-8 text-primary-foreground" />
              </div>
            </motion.div>

            <CardTitle className="text-2xl font-heading">
              Logistica Maritime
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Connectez-vous à votre compte
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    className="pl-10"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full gradient-primary text-primary-foreground shadow-colored hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Mot de passe oublié ?{" "}
                <button
                  type="button"
                  className="text-primary hover:underline font-medium"
                  onClick={() => {
                    // TODO: Implement forgot password
                  }}
                >
                  Réinitialiser
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo credentials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 p-4 rounded-lg bg-muted/50 border border-border/50"
        >
          <p className="text-sm text-muted-foreground text-center mb-2">
            Identifiants de démonstration :
          </p>
          <div className="text-xs text-center space-y-1">
            <p><span className="font-medium">Admin :</span> admin@example.com / password</p>
            <p><span className="font-medium">Manager :</span> manager@example.com / password</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
