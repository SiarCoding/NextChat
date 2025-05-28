"use client";

import { cn } from "@/lib/utils";
import { BarChart3 } from "lucide-react";

export function PerformanceChart() {
    return (
        <div className="grid grid-cols-1 gap-3 max-w-7xl">
            <div
                className={cn(
                    "group relative p-4 rounded-xl overflow-hidden transition-all duration-300",
                    "border border-gray-100/80 dark:border-white/10 bg-white dark:bg-black",
                    "hover:shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_2px_12px_rgba(255,255,255,0.03)]",
                    "hover:-translate-y-0.5 will-change-transform"
                )}
            >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:4px_4px]" />
                </div>

                <div className="relative space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/10 group-hover:bg-gradient-to-br transition-all duration-300">
                                <BarChart3 className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="ml-3">
                                <h3 className="font-medium text-gray-900 dark:text-gray-100 tracking-tight text-[15px]">
                                    Performance Übersicht
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Leads und Gespräche der letzten 30 Tage
                                </p>
                            </div>
                        </div>
                        <span
                            className={cn(
                                "text-xs font-medium px-2 py-1 rounded-lg backdrop-blur-sm",
                                "bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300",
                                "transition-colors duration-300 group-hover:bg-black/10 dark:group-hover:bg-white/20"
                            )}
                        >
                            Monatlich
                        </span>
                    </div>

                    <div className="h-64 bg-gradient-to-br from-emerald-50 to-sky-50 dark:from-emerald-950/20 dark:to-sky-950/20 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <BarChart3 className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                            <p className="text-gray-700 dark:text-gray-300 font-medium">Performance-Chart wird hier angezeigt</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Integration mit Chart.js oder ähnlicher Bibliothek</p>
                            <div className="flex items-center justify-center space-x-3 mt-4">
                                <span className="flex items-center">
                                    <span className="w-3 h-3 rounded-full bg-emerald-500 mr-1"></span>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Leads</span>
                                </span>
                                <span className="flex items-center">
                                    <span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Gespräche</span>
                                </span>
                                <span className="flex items-center">
                                    <span className="w-3 h-3 rounded-full bg-purple-500 mr-1"></span>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Konversionen</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="absolute inset-0 -z-10 rounded-xl p-px bg-gradient-to-br from-transparent via-gray-100/50 to-transparent dark:via-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
        </div>
    );
}
