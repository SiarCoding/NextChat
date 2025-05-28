"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Bot,
  Home,
  Palette,
  TestTube,
  Globe,
  Workflow,
  Settings,
  CreditCard,
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Users,
  Zap,
  ChevronsUpDown,
  MessageSquare,
  Layout,
  FileClock,
  LogOut
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Animation und Transition Einstellungen für die Sidebar
const sidebarVariants = {
  open: {
    width: "15rem",
  },
  closed: {
    width: "3.05rem",
  },
};

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
};

const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      x: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: {
      x: { stiffness: 100 },
    },
  },
};

const transitionProps = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
  staggerChildren: 0.1,
};

const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};

// Die originalen Seitenleisten-Elemente
const sidebarItems = [
  {
    title: "Home",
    href: "/dashboard",
    icon: Home,
    description: "Übersicht & KPIs"
  },
  {
    title: "Bot Design",
    href: "/dashboard/bot-design",
    icon: Palette,
    description: "Chatbots erstellen & verwalten"
  },
  {
    title: "Live Testing",
    href: "/dashboard/testing",
    icon: TestTube,
    description: "Bots testen"
  },
  {
    title: "Landing Pages",
    href: "/dashboard/landing-pages",
    icon: Globe,
    description: "Live Assistant Builder"
  },
  {
    title: "Integrationen",
    href: "/dashboard/integrations",
    icon: Zap,
    description: "CRM & Tools verbinden"
  },
  {
    title: "Workflows",
    href: "/dashboard/workflows",
    icon: Workflow,
    description: "Automatisierungen"
  },
  {
    title: "Einstellungen",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Konto & Präferenzen"
  },
  {
    title: "Credits",
    href: "/dashboard/credits",
    icon: CreditCard,
    description: "Guthaben verwalten"
  },
  {
    title: "Profil",
    href: "/dashboard/profile",
    icon: User,
    description: "Avatar & Name"
  }
]

// Context für den Sidebar-Status exportieren
import { createContext, useContext } from "react"

type SidebarContextType = {
  isExpanded: boolean;
};

export const SidebarContext = createContext<SidebarContextType>({
  isExpanded: false
});

export function useSidebar() {
  return useContext(SidebarContext);
}

interface DashboardSidebarProps {
  onExpandChange?: (expanded: boolean) => void;
}

export function DashboardSidebar({ onExpandChange }: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const pathname = usePathname()
  
  // Bei Änderung des Collapse-Status den übergeordneten Handler informieren
  const handleExpandChange = (expanded: boolean) => {
    setIsCollapsed(!expanded);
    if (onExpandChange) {
      onExpandChange(expanded);
    }
  }

  return (
    <SidebarContext.Provider value={{ isExpanded: !isCollapsed }}>
      <motion.div
        className={cn(
          "sidebar fixed left-0 z-40 h-full shrink-0 border-r fixed",
        )}
        initial={isCollapsed ? "closed" : "open"}
        animate={isCollapsed ? "closed" : "open"}
        variants={sidebarVariants}
        transition={transitionProps}
        onMouseEnter={() => handleExpandChange(true)}
        onMouseLeave={() => handleExpandChange(false)}
      >
      <motion.div
        className={`relative z-40 flex text-muted-foreground h-full shrink-0 flex-col bg-white dark:bg-black transition-all`}
        variants={contentVariants}
      >
        <motion.ul variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex grow flex-col items-center">
            {/* Header mit Organisation */}
            <div className="flex h-[54px] w-full shrink-0 border-b p-2">
              <div className="mt-[1.5px] flex w-full">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="w-full" asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex w-fit items-center gap-2 px-2" 
                    >
                      <Avatar className='rounded size-4'>
                        <AvatarFallback>
                          <Bot className="w-3 h-3 text-emerald-600" />
                        </AvatarFallback>
                      </Avatar>
                      <motion.li
                        variants={variants}
                        className="flex w-fit items-center gap-2"
                      >
                        {!isCollapsed && (
                          <>
                            <p className="text-sm font-medium">
                              NextChat
                            </p>
                            <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50" />
                          </>
                        )}
                      </motion.li>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem
                      asChild
                      className="flex items-center gap-2"
                    >
                      <Link href="/dashboard/bot-design">
                        <Plus className="h-4 w-4" /> Neuen Bot erstellen
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Hauptnavigation */}
            <div className="flex h-full w-full flex-col">
              <div className="flex grow flex-col gap-4">
                <ScrollArea className="h-16 grow p-2">
                  <div className={cn("flex w-full flex-col gap-1")}>
                    {/* Dashboard Link */}
                    <Link
                      href="/dashboard"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname === "/dashboard" &&
                          "bg-muted text-blue-600",
                      )}
                    >
                      <Home className="h-4 w-4" />{" "}
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Dashboard</p>
                        )}
                      </motion.li>
                    </Link>

                    {/* Bot Design Link */}
                    <Link
                      href="/dashboard/bot-design"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname === "/dashboard/bot-design" &&
                          "bg-muted text-blue-600",
                      )}
                    >
                      <Palette className="h-4 w-4" />{" "}
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <div className="flex items-center gap-2">
                            <p className="ml-2 text-sm font-medium">Bot Design</p>
                          </div>
                        )}
                      </motion.li>
                    </Link>

                    {/* Live Testing Link */}
                    <Link
                      href="/dashboard/testing"
                      className={cn(
                        "flex h-8 flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname === "/dashboard/testing" && "bg-muted text-blue-600",
                      )}
                    >
                      <TestTube className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <div className="ml-2 flex items-center gap-2">
                            <p className="text-sm font-medium">Live Testing</p>
                            <Badge
                              className={cn(
                                "flex h-fit w-fit items-center gap-1.5 rounded border-none bg-blue-50 px-1.5 text-blue-600 dark:bg-blue-700 dark:text-blue-300",
                              )}
                              variant="outline"
                            >
                              BETA
                            </Badge>
                          </div>
                        )}
                      </motion.li>
                    </Link>

                    <Separator className="w-full my-2" />

                    {/* Landing Pages Link */}
                    <Link
                      href="/dashboard/landing-pages"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname === "/dashboard/landing-pages" && "bg-muted text-blue-600",
                      )}
                    >
                      <Globe className="h-4 w-4" />{" "}
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Landing Pages</p>
                        )}
                      </motion.li>
                    </Link>

                    {/* Integrationen Link */}
                    <Link
                      href="/dashboard/integrations"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname === "/dashboard/integrations" && "bg-muted text-blue-600",
                      )}
                    >
                      <Zap className="h-4 w-4" />{" "}
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Integrationen</p>
                        )}
                      </motion.li>
                    </Link>

                    {/* Workflows Link */}
                    <Link
                      href="/dashboard/workflows"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname === "/dashboard/workflows" && "bg-muted text-blue-600",
                      )}
                    >
                      <Workflow className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Workflows</p>
                        )}
                      </motion.li>
                    </Link>
                  </div>
                </ScrollArea>
              </div>
              
              {/* Footer-Bereich mit Einstellungen und Benutzermenü */}
              <div className="flex flex-col p-2">
                {/* Einstellungen Link */}
                <Link
                  href="/dashboard/settings"
                  className={cn(
                    "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                    pathname === "/dashboard/settings" && "bg-muted text-blue-600",
                  )}
                >
                  <Settings className="h-4 w-4 shrink-0" />{" "}
                  <motion.li variants={variants}>
                    {!isCollapsed && (
                      <p className="ml-2 text-sm font-medium">Einstellungen</p>
                    )}
                  </motion.li>
                </Link>
                
                {/* Credits Link */}
                <Link
                  href="/dashboard/credits"
                  className={cn(
                    "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                    pathname === "/dashboard/credits" && "bg-muted text-blue-600",
                  )}
                >
                  <CreditCard className="h-4 w-4 shrink-0" />{" "}
                  <motion.li variants={variants}>
                    {!isCollapsed && (
                      <p className="ml-2 text-sm font-medium">Credits</p>
                    )}
                  </motion.li>
                </Link>

                {/* Benutzer-Dropdown */}
                <div>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger className="w-full">
                      <div className="flex h-8 w-full flex-row items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary">
                        <Avatar className="size-4">
                          <AvatarFallback>
                            U
                          </AvatarFallback>
                        </Avatar>
                        <motion.li
                          variants={variants}
                          className="flex w-full items-center gap-2"
                        >
                          {!isCollapsed && (
                            <>
                              <p className="text-sm font-medium">Profil</p>
                              <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground/50" />
                            </>
                          )}
                        </motion.li>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent sideOffset={5}>
                      <div className="flex flex-row items-center gap-2 p-2">
                        <Avatar className="size-6">
                          <AvatarFallback>
                            U
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-medium">Benutzer</span>
                          <span className="line-clamp-1 text-xs text-muted-foreground">
                            benutzer@example.com
                          </span>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        asChild
                        className="flex items-center gap-2"
                      >
                        <Link href="/dashboard/profile">
                          <User className="h-4 w-4" /> Profil
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        asChild
                        className="flex items-center gap-2"
                      >
                        <Link href="/api/auth/signout">
                          <LogOut className="h-4 w-4" /> Abmelden
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
    </SidebarContext.Provider>
  );
}