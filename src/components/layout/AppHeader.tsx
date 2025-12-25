import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  User,
  LogOut,
  ChevronDown,
  Command,
  Menu,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlobalSearch } from "@/components/GlobalSearch";
import { NotificationCenter } from "@/components/NotificationCenter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuthContext } from "@/contexts/AuthContext";

interface AppHeaderProps {
  sidebarCollapsed: boolean;
  isMobile?: boolean;
  onMenuToggle?: () => void;
}

export function AppHeader({
  sidebarCollapsed,
  isMobile = false,
  onMenuToggle,
}: AppHeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const [searchOpen, setSearchOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <motion.header
        initial={false}
        animate={{
          marginLeft: isMobile ? 0 : sidebarCollapsed ? 72 : 280,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 right-0 z-30 h-16 bg-card/95 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-4 md:px-6 shadow-sm"
        style={{
          width: isMobile ? "100%" : `calc(100% - ${sidebarCollapsed ? 72 : 280}px)`,
        }}
      >
        {/* Left side */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuToggle}
              className="lg:hidden hover:bg-primary/10"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Search Button */}
          <Button
            variant="outline"
            className="relative w-40 sm:w-72 justify-start text-muted-foreground bg-muted/50 border-border/50 hover:bg-muted hover:border-primary/30 transition-all duration-200 group"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
            <span className="flex-1 text-left hidden sm:inline">Rechercher...</span>
            <span className="flex-1 text-left sm:hidden">Recherche</span>
            <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded-md border border-border/80 bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 md:flex">
              <Command className="h-3 w-3" />K
            </kbd>
          </Button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <NotificationCenter />

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 hover:bg-muted transition-colors"
              >
                <div className="relative">
                  <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                    <span className="text-sm font-bold text-primary-foreground">LG</span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-card" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold">{user?.name || "Utilisateur"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-heading">
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground font-normal">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profil")} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Mon Profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/entreprise")} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.header>

      {/* Global Search Dialog */}
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
