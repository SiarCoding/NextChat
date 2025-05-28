"use client";

import { cn } from "@/lib/utils";
import {
    Users,
    MessageSquare,
    TrendingUp,
    Calendar,
    Bot
} from "lucide-react";

interface StatsProps {
    totalLeads: number;
    activeChatbots: number;
    totalChats: number;
    totalBookings: number;
    isLoading?: boolean;
}

export function StatsGrid({ 
    totalLeads, 
    activeChatbots, 
    totalChats, 
    totalBookings, 
    isLoading = false 
}: StatsProps) {
    const items = [
        {
            title: "Generierte Leads",
            value: totalLeads,
            description: "Qualifizierte Nutzer-Kontakte",
            icon: <Users className="w-4 h-4 text-emerald-500" />,
            status: "Wachstum",
            meta: "+12% MTD",
            tags: ["Konversionen", "CRM"],
            colSpan: 1,
            hasPersistentHover: true,
        },
        {
            title: "Aktive Assistenten",
            value: activeChatbots,
            description: "Derzeit im Einsatz auf Websites",
            icon: <Bot className="w-4 h-4 text-blue-500" />,
            status: "Aktiv",
            meta: totalChats > 0 ? `Ø ${Math.round(totalChats/activeChatbots)} Chats/Bot` : "",
            tags: ["Bots", "Engagement"],
            colSpan: 1,
        },
        {
            title: "Gespräche",
            value: totalChats,
            description: "Chatbot-Interaktionen gesamt",
            icon: <MessageSquare className="w-4 h-4 text-purple-500" />,
            status: "Alle Kanäle",
            meta: "Letzte 30 Tage",
            tags: ["Interaktionen", "Analyse"],
            colSpan: 1,
            hasPersistentHover: false,
        },
        {
            title: "Gebuchte Termine",
            value: totalBookings,
            description: "Erfolgreich vereinbarte Gespräche",
            icon: <Calendar className="w-4 h-4 text-sky-500" />,
            status: "Conversions",
            meta: totalLeads > 0 ? `${Math.round((totalBookings/totalLeads)*100)}% Rate` : "",
            tags: ["Termine", "Sales"],
            colSpan: 1,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 max-w-7xl">
            {items.map((item, index) => (
                <div
                    key={index}
                    className={cn(
                        "group relative p-4 rounded-xl overflow-hidden transition-all duration-300",
                        "border border-gray-100/80 dark:border-white/10 bg-white dark:bg-black",
                        "hover:shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_2px_12px_rgba(255,255,255,0.03)]",
                        "hover:-translate-y-0.5 will-change-transform",
                        item.colSpan && item.colSpan > 1 ? `md:col-span-${item.colSpan}` : "col-span-1",
                        {
                            "shadow-[0_2px_12px_rgba(0,0,0,0.03)] -translate-y-0.5":
                                item.hasPersistentHover,
                            "dark:shadow-[0_2px_12px_rgba(255,255,255,0.03)]":
                                item.hasPersistentHover,
                        }
                    )}
                >
                    <div
                        className={`absolute inset-0 ${
                            item.hasPersistentHover
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                        } transition-opacity duration-300`}
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:4px_4px]" />
                    </div>

                    <div className="relative flex flex-col space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/10 group-hover:bg-gradient-to-br transition-all duration-300">
                                {item.icon}
                            </div>
                            <span
                                className={cn(
                                    "text-xs font-medium px-2 py-1 rounded-lg backdrop-blur-sm",
                                    "bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300",
                                    "transition-colors duration-300 group-hover:bg-black/10 dark:group-hover:bg-white/20"
                                )}
                            >
                                {item.status}
                            </span>
                        </div>

                        <div className="space-y-1">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 tracking-tight text-[15px]">
                                {item.title}
                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 font-normal">
                                    {item.meta}
                                </span>
                            </h3>
                            <div className="flex items-end">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {isLoading ? "-" : item.value}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-snug font-[425]">
                                {item.description}
                            </p>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                {item.tags?.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-1 rounded-md bg-black/5 dark:bg-white/10 backdrop-blur-sm transition-all duration-200 hover:bg-black/10 dark:hover:bg-white/20"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                            <TrendingUp className="h-3 w-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    <div
                        className={`absolute inset-0 -z-10 rounded-xl p-px bg-gradient-to-br from-transparent via-gray-100/50 to-transparent dark:via-white/10 ${
                            item.hasPersistentHover
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                        } transition-opacity duration-300`}
                    />
                </div>
            ))}
        </div>
    );
}
