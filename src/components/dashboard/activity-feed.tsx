"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity, Clock } from "lucide-react";

interface ActivityItem {
    id: string;
    type: string;
    message: string;
    time: string;
    avatar: string;
}

interface ActivityFeedProps {
    activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
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
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/10 group-hover:bg-gradient-to-br transition-all duration-300">
                                <Activity className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="ml-3">
                                <h3 className="font-medium text-gray-900 dark:text-gray-100 tracking-tight text-[15px]">
                                    Letzte Aktivitäten
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Neueste Ereignisse in Ihren Chatbots
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
                            Live Updates
                        </span>
                    </div>

                    <div className="space-y-4">
                        {activities.length > 0 ? (
                            activities.map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-3 group/item">
                                    <Avatar className="h-8 w-8 ring-2 ring-white/10 dark:ring-black/20">
                                        <AvatarFallback className="bg-gradient-to-br from-emerald-50 to-blue-100 text-slate-600 text-xs">
                                            {activity.avatar}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900 dark:text-gray-100 font-medium group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors">
                                            {activity.message}
                                        </p>
                                        <div className="flex items-center mt-1">
                                            <Clock className="h-3 w-3 text-gray-400 mr-1" />
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                                            {activity.type === 'lead' && (
                                                <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    Lead
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg">
                                <Activity className="h-10 w-10 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Noch keine Aktivitäten</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    Aktivitäten erscheinen hier, sobald Ihre Chatbots genutzt werden
                                </p>
                            </div>
                        )}
                    </div>

                    <Button variant="outline" className="w-full mt-4" size="sm">
                        Alle Aktivitäten anzeigen
                    </Button>
                </div>
                
                <div className="absolute inset-0 -z-10 rounded-xl p-px bg-gradient-to-br from-transparent via-gray-100/50 to-transparent dark:via-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
        </div>
    );
}
