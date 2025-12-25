import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Mail, Lock, AlertCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthContext } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import shipLoaderGif from "@/assets/ship-loader.gif";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative inline-block mb-6"
            >
              {/* Glow effect behind logo */}
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl scale-150" />
              <img 
                src={shipLoaderGif} 
                alt="LogistiGa" 
                className="relative w-24 h-24 object-contain"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-2xl font-heading font-bold text-white mb-1">
                LogistiGa
              </h1>
              <p className="text-slate-400 text-sm">
                Portail Employés - Facturation
              </p>
            </motion.div>
          </div>

          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-2 mb-6 py-2 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full mx-auto w-fit"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">Connexion sécurisée</span>
          </motion.div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email professionnel
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="prenom.nom@logistiga.ga"
                  className="h-12 pl-11 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-primary/50 focus:bg-white/10 transition-all rounded-xl"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-300">
                Mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  className="h-12 pl-11 pr-11 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-primary/50 focus:bg-white/10 transition-all rounded-xl"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base rounded-xl transition-all shadow-lg shadow-primary/25"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          {/* Help Text */}
          <p className="text-center text-slate-500 text-xs mt-6">
            Problème de connexion ? Contactez le{" "}
            <a href="#" className="text-primary hover:underline">support IT</a>
          </p>
        </div>

        {/* Demo Credentials - Outside card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 text-center"
        >
          <div className="inline-flex items-center gap-2 py-2 px-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
            <span className="text-slate-400 text-xs">
              Demo : <span className="text-slate-300">admin@example.com</span> / <span className="text-slate-300">password</span>
            </span>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-600 text-xs">
          © 2024 LogistiGa - Application réservée aux employés
        </div>
      </motion.div>
    </div>
  );
}
