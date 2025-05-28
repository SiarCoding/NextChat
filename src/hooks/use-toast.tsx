"use client"

// Einfache Toast-Implementierung
export const useToast = () => ({
  toast: ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    alert(`${title}: ${description}`)
  }
})
