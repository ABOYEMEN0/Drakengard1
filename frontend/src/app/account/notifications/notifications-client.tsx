"use client";

import { useEffect, useState } from "react";
import { Bell, Boxes, CheckCheck, Info, MessageCircle, Package } from "lucide-react";
import { useNotifications } from "@/lib/store";
import { AppNotification } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

const TYPE_ICON: Record<AppNotification["type"], typeof Package> = {
  order: Package,
  stock: Boxes,
  message: MessageCircle,
  system: Info,
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function NotificationsClient() {
  const [mounted, setMounted] = useState(false);
  const { items, markAllRead } = useNotifications();
  const toast = useToast((s) => s.push);
  useEffect(() => setMounted(true), []);

  const data = mounted ? items : [];
  const unread = data.filter((n) => !n.read).length;

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Inbox</p>
          <h1 className="heading-md">Notifications</h1>
        </div>
        {unread > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              markAllRead();
              toast("All notifications marked as read");
            }}
          >
            <CheckCheck size={15} /> Mark all read
          </Button>
        )}
      </header>

      {mounted && data.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Nothing here yet"
          description="Order updates and messages from LEOR will appear here."
          actionLabel="Browse the shop"
          actionHref="/shop"
        />
      ) : (
        <ul className="space-y-3">
          {data.map((n) => {
            const Icon = TYPE_ICON[n.type];
            return (
              <li
                key={n.id}
                className={cn(
                  "card-luxe flex items-start gap-4 p-5",
                  !n.read && "border-gold/40 bg-gold/5"
                )}
              >
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-white">
                  <Icon size={16} className="text-gold-600" strokeWidth={1.75} />
                  {!n.read && (
                    <span
                      className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-white"
                      aria-label="Unread"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className={cn("text-sm text-navy", !n.read && "font-semibold")}>{n.title}</p>
                    <time dateTime={n.createdAt} className="shrink-0 text-xs text-muted">
                      {relativeTime(n.createdAt)}
                    </time>
                  </div>
                  <p className="mt-0.5 text-sm text-muted">{n.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
