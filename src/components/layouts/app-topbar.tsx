import { useState } from "react";
import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";

import { AppSidebar } from "@/components/webApp/sideBar/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCurrentUser } from "@/api/me";
import { appNavigation } from "@/data/app-navigation";
import { initialsOf } from "@/lib/initials";

type AppTopBarProps = {
  onSignOut: () => void;
};

export function AppTopBar({ onSignOut }: AppTopBarProps) {
  const { user, profile } = useCurrentUser();
  const university = profile?.university;
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const current = appNavigation.find((item) => item.to === pathname);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-6">
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <Button
          variant="ghost"
          size="icon-lg"
          className="-ml-2 lg:hidden"
          aria-label="Open navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <Menu />
        </Button>
        <SheetContent side="left" className="w-72 bg-background p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">
            AcadPath sections
          </SheetDescription>
          <AppSidebar
            onSignOut={onSignOut}
            onNavigate={() => setMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <p className="min-w-0 truncate text-sm text-muted-foreground">
        {university ? (
          <span className="hidden sm:inline">{university.name} / </span>
        ) : null}
        <span className="text-foreground">{current?.label ?? "AcadPath"}</span>
      </p>

      <div className="ml-auto flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground lg:hidden"
        >
          {initialsOf(user.name)}
        </span>
      </div>
    </header>
  );
}
