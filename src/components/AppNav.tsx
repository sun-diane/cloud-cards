import { NavLink as RouterNavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Package, LayoutGrid, Swords } from "lucide-react";
import cloudLogo from "@/assets/cloud-logo.png";

const navItems = [
  { to: "/", label: "Open Packs", icon: Package },
  { to: "/collection", label: "Collection", icon: LayoutGrid },
];

export default function AppNav() {
  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b overflow-visible">
      <div className="max-w-6xl mx-auto px-4 flex items-center h-14 gap-1 overflow-visible scrollbar-hide">
        <span className="flex items-center gap-1.5 sm:gap-2 font-extrabold text-sm sm:text-lg tracking-tight mr-3 sm:mr-6 shrink-0">
          <img src={cloudLogo} alt="Cloud Cards" className="h-[22px] sm:h-[28px] w-auto scale-[1.8] object-contain" />
          <span className="whitespace-nowrap"><span className="text-accent">Cloud</span> Cards</span>
        </span>
        {navItems.map((item) => (
          <RouterNavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </RouterNavLink>
        ))}
        {/* Battle - disabled */}
        <div className="relative group hidden sm:block">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground/40 cursor-not-allowed select-none">
            <Swords className="w-4 h-4" />
            Battle
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Coming Soon (or not)
          </div>
        </div>
      </div>
    </nav>
  );
}
