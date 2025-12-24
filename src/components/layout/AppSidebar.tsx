import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FileText,
  FileCheck,
  ClipboardList,
  Settings,
  Building2,
  Landmark,
  Receipt,
  Shield,
  UserCog,
  Mail,
  Wallet,
  TrendingUp,
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Truck,
  Clock,
  Banknote,
  CreditCard,
  ReceiptText,
  LineChart,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: "Tableau de bord",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    title: "Facturation",
    href: "/facturation",
    icon: FileText,
    children: [
      { title: "Ordres de travail", href: "/ordres-travail", icon: ClipboardList },
      { title: "Ordres en attente", href: "/ordres-en-attente", icon: Clock },
      { title: "Notes de début", href: "/notes-debut", icon: FileText },
      { title: "Factures", href: "/factures", icon: FileCheck },
      { title: "Devis", href: "/devis", icon: Receipt },
      { title: "Avoirs", href: "/avoirs", icon: ReceiptText },
    ],
  },
  {
    title: "Finance",
    href: "/finance",
    icon: Banknote,
    children: [
      { title: "Crédit Bancaire", href: "/credit-bancaire", icon: CreditCard },
      { title: "Trésorerie Prév.", href: "/tresorerie-prev", icon: LineChart },
    ],
  },
  {
    title: "Comptabilité",
    href: "/comptabilite",
    icon: TrendingUp,
    children: [
      { title: "Vue globale", href: "/comptabilite", icon: TrendingUp },
      { title: "Tableau des Flux", href: "/tableau-flux", icon: BarChart3 },
      { title: "Caisse", href: "/caisse", icon: Wallet },
      { title: "Suivi Banque", href: "/suivi-banque", icon: Landmark },
      { title: "Rapports", href: "/rapports", icon: FileText },
    ],
  },
  {
    title: "Paramètres",
    href: "/parametres",
    icon: Settings,
    children: [
      { title: "Entreprise", href: "/entreprise", icon: Building2 },
      { title: "Banques", href: "/banques", icon: Landmark },
      { title: "Taxes", href: "/taxes", icon: Receipt },
      { title: "Partenaires", href: "/partenaires", icon: Users },
      { title: "Rôles", href: "/roles", icon: Shield },
      { title: "Utilisateurs", href: "/utilisateurs", icon: UserCog },
      { title: "Emails", href: "/emails", icon: Mail },
    ],
  },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AppSidebar({
  collapsed,
  onToggle,
  isMobile = false,
  mobileOpen = false,
  onCloseMobile,
}: AppSidebarProps) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Facturation", "Paramètres"]);

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => location.pathname === href;
  const isParentActive = (item: NavItem) =>
    item.children?.some((child) => location.pathname === child.href);

  const handleNavClick = () => {
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  // Mobile: show/hide based on mobileOpen
  // Desktop: always visible, width changes based on collapsed
  const sidebarClasses = cn(
    "fixed left-0 top-0 z-50 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ease-in-out",
    isMobile
      ? cn(
          "w-72",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )
      : "translate-x-0"
  );

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isMobile ? 288 : collapsed ? 72 : 280,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={sidebarClasses}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center justify-between border-b border-sidebar-border transition-all duration-300",
          collapsed && !isMobile ? "h-16 px-2 justify-center" : "h-20 px-4"
        )}
      >
        <AnimatePresence mode="wait">
          {!collapsed || isMobile ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-xl blur-xl" />
                <img
                  src={logo}
                  alt="Logistiga"
                  className="relative h-12 w-auto object-contain drop-shadow-lg"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <Truck className="h-5 w-5 text-primary-foreground" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile close button */}
        {isMobile && (
          <button
            onClick={onCloseMobile}
            className="p-2 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.title}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleExpand(item.title)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                      "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isParentActive(item) && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {(!collapsed || isMobile) && (
                      <>
                        <span className="flex-1 text-left text-sm font-medium">
                          {item.title}
                        </span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            expandedItems.includes(item.title) && "rotate-180"
                          )}
                        />
                      </>
                    )}
                  </button>
                  <AnimatePresence>
                    {(!collapsed || isMobile) && expandedItems.includes(item.title) && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-1 ml-4 space-y-1 overflow-hidden"
                      >
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <NavLink
                              to={child.href}
                              onClick={handleNavClick}
                              className={({ isActive }) =>
                                cn(
                                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                                  "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                  isActive &&
                                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                                )
                              }
                            >
                              <child.icon className="h-4 w-4 shrink-0" />
                              <span>{child.title}</span>
                            </NavLink>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <NavLink
                  to={item.href}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                      "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive &&
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                    )
                  }
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {(!collapsed || isMobile) && (
                    <span className="text-sm font-medium">{item.title}</span>
                  )}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse Toggle - Desktop only */}
      {!isMobile && (
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span className="text-sm">Réduire</span>
              </>
            )}
          </button>
        </div>
      )}
    </motion.aside>
  );
}
