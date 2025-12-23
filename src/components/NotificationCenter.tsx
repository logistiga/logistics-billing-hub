import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  AlertTriangle,
  CreditCard,
  Receipt,
  Users,
  Clipboard,
  Calendar,
  X,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "alert" | "payment" | "invoice" | "order" | "client" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "alert",
    title: "Paiement en retard",
    message: "Le crédit CR-2023-078 chez Ecobank a un paiement en retard de 23 jours",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
    read: false,
    link: "/credit-bancaire",
  },
  {
    id: "2",
    type: "payment",
    title: "Paiement reçu",
    message: "TOTAL Gabon a effectué un paiement de 5 500 000 FCFA sur la facture FAC-2024-001",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    read: false,
    link: "/factures",
  },
  {
    id: "3",
    type: "order",
    title: "Nouvel ordre de travail",
    message: "Ordre OT-2024-156 créé pour COMILOG - Transport conteneurs",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    link: "/ordres-travail",
  },
  {
    id: "4",
    type: "invoice",
    title: "Facture échue",
    message: "La facture FAC-2024-089 pour Olam Gabon est échue depuis 7 jours",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    read: true,
    link: "/factures",
  },
  {
    id: "5",
    type: "client",
    title: "Nouveau client",
    message: "Le client 'Assala Energy' a été ajouté au système",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    link: "/clients",
  },
  {
    id: "6",
    type: "system",
    title: "Échéance proche",
    message: "3 paiements bancaires prévus dans les 7 prochains jours",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    read: true,
    link: "/credit-bancaire",
  },
  {
    id: "7",
    type: "alert",
    title: "Devis expiré",
    message: "Le devis DEV-2024-045 pour Société Générale Gabon a expiré",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    read: true,
    link: "/devis",
  },
];

const typeConfig = {
  alert: {
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  payment: {
    icon: CreditCard,
    color: "text-success",
    bg: "bg-success/10",
  },
  invoice: {
    icon: Receipt,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  order: {
    icon: Clipboard,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  client: {
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  system: {
    icon: Calendar,
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
};

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const formatTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  };

  const unreadNotifications = notifications.filter((n) => !n.read);
  const allNotifications = notifications;

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const config = typeConfig[notification.type];
    const Icon = config.icon;

    return (
      <div
        className={cn(
          "flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer group",
          notification.read
            ? "hover:bg-muted/50"
            : "bg-primary/5 hover:bg-primary/10"
        )}
        onClick={() => markAsRead(notification.id)}
      >
        <div className={cn("p-2 rounded-full", config.bg)}>
          <Icon className={cn("h-4 w-4", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                "text-sm font-medium truncate",
                !notification.read && "text-foreground"
              )}
            >
              {notification.title}
            </p>
            {!notification.read && (
              <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            {formatTime(notification.timestamp)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            deleteNotification(notification.id);
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0"
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h4 className="font-semibold">Notifications</h4>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
                : "Tout est lu"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Tout marquer lu
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="unread" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
            <TabsTrigger
              value="unread"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
            >
              Non lues
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
            >
              Toutes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unread" className="m-0">
            <ScrollArea className="h-[350px]">
              {unreadNotifications.length > 0 ? (
                <div className="p-2 space-y-1">
                  {unreadNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                  <CheckCheck className="h-10 w-10 mb-2 opacity-50" />
                  <p className="text-sm">Aucune notification non lue</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="all" className="m-0">
            <ScrollArea className="h-[350px]">
              {allNotifications.length > 0 ? (
                <div className="p-2 space-y-1">
                  {allNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                  <Bell className="h-10 w-10 mb-2 opacity-50" />
                  <p className="text-sm">Aucune notification</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2 flex justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={clearAll}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Effacer tout
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                <Settings className="h-3 w-3 mr-1" />
                Paramètres
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
