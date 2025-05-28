"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import {
    Bot,
    Zap,
    Plus,
    ArrowRight
} from "lucide-react";

interface QuickAction {
    title: string;
    description: string;
    icon: React.ElementType;
    href: string;
    color: string;
}

interface QuickActionsProps {
    actions?: QuickAction[];
}

const defaultActions: QuickAction[] = [
    {
        title: "Neuen Chatbot erstellen",
        description: "Starten Sie mit einer Vorlage oder von Grund auf",
        icon: Bot,
        href: "/dashboard/bot-design",
        color: "emerald"
    },
    {
        title: "Landing Page erstellen",
        description: "Live Assistant für Ihre Website",
        icon: Zap,
        href: "/dashboard/landing-pages",
        color: "blue"
    },
    {
        title: "Integration hinzufügen",
        description: "CRM oder Kalender verbinden",
        icon: Plus,
        href: "/dashboard/integrations",
        color: "purple"
    }
];

export function QuickActions({ actions = defaultActions }: QuickActionsProps) {
    return (
        <div className="grid grid-cols-1 gap-3 max-w-7xl">
            <div
                className={cn(
                    "group relative p-4 rounded-xl overflow-hidden transition-all duration-300",
                    "border border-gray-100/80 dark:border-white/10 bg-white dark:bg-black",
                    "hover:shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_2px_12px_rgba(255,255,255,0.03)]"
                )}
            >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:4px_4px]" />
                </div>

                <div className="relative space-y-4">
                    <div className="flex items-center">
                        <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">Schnellzugriff</h3>
                        <span className="ml-2 text-xs px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                            Effizienz
                        </span>
                    </div>

                    <div className="space-y-2">
                        {actions.map((action, idx) => {
                            const Icon = action.icon;
                            return (
                                <Link 
                                    key={idx}
                                    href={action.href}
                                    className="block group/item"
                                >
                                    <div className="flex items-center rounded-lg p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                                        <div className={cn(
                                            "h-10 w-10 rounded-lg flex items-center justify-center mr-4",
                                            action.color === "emerald" ? "bg-emerald-100 text-emerald-600" :
                                            action.color === "blue" ? "bg-blue-100 text-blue-600" :
                                            "bg-purple-100 text-purple-600"
                                        )}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900 dark:text-white group-hover/item:text-emerald-700 dark:group-hover/item:text-emerald-400">
                                                {action.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{action.description}</p>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover/item:text-emerald-600 transition-colors" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
                
                <div className="absolute inset-0 -z-10 rounded-xl p-px bg-gradient-to-br from-transparent via-gray-100/50 to-transparent dark:via-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
        </div>
    );
}
