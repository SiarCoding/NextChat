"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { DashboardSidebar, useSidebar, SidebarContext } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { useState } from "react"
import { motion } from "framer-motion"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // State für die Sidebar-Expansion - WICHTIG: Hook muss vor bedingter Logik stehen
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!session) {
    redirect("/auth/signin")
  }

  // Varianten für die Animation des Hauptinhalts
  const mainContentVariants = {
    expanded: {
      paddingLeft: "15rem", // Gleiche Breite wie die ausgefahrene Sidebar
      transition: {
        type: "tween",
        ease: "easeOut",
        duration: 0.2
      }
    },
    collapsed: {
      paddingLeft: "3.05rem", // Gleiche Breite wie die eingeklappte Sidebar
      transition: {
        type: "tween",
        ease: "easeOut",
        duration: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* SidebarContext mit Callback für den Expansionsstatus */}
      <SidebarContext.Provider value={{ isExpanded: isExpanded }}>
        {/* Sidebar ist fixed positioniert */}
        <DashboardSidebar onExpandChange={setIsExpanded} />
        
        {/* Hauptinhalt mit dynamischer Anpassung an Sidebar-Status */}
        <motion.div 
          className="flex-1 flex flex-col min-h-screen transition-all duration-200"
          variants={mainContentVariants}
          initial="collapsed"
          animate={isExpanded ? "expanded" : "collapsed"}
        >
          <DashboardHeader />
          <main className="flex-1 p-6">
            {children}
          </main>
        </motion.div>
      </SidebarContext.Provider>
    </div>
  )
}