import { createContext, useContext, ReactNode } from "react";

interface DemoContextType {
  isDemoMode: boolean;
  demoUser: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    openId: string;
  };
  demoCourses: any[];
  demoAchievements: Array<{
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
  }>;
}

const DemoContext = createContext<DemoContextType | null>(null);

export function useDemoData() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoData must be used within a DemoProvider');
  }
  return context;
}

interface DemoProviderProps {
  children: ReactNode;
}

export function DemoProvider({ children }: DemoProviderProps) {
  const isDemoMode = window.location.hostname.includes('github.io') || 
                     window.location.hostname.includes('pages.dev') ||
                     window.location.pathname.includes('/rpg_edu_tracker/');

  const demoData: DemoContextType = {
    isDemoMode,
    demoUser: {
      id: "demo-user",
      name: "Manoel Netto",
      email: "demo@g.dev/eusoumanoelnetto",
      avatar: "boy-1",
      openId: "demo-openid"
    },
    demoCourses: [],
    demoAchievements: [
      { name: "Bem-vindo", description: "Bem-vindo ao RPG Edu Tracker!", icon: "🎉", unlocked: true },
      { name: "Explorador", description: "Explorou todas as funcionalidades", icon: "🗺️", unlocked: true },
      { name: "Estudante Dedicado", description: "Completou primeiro curso", icon: "📚", unlocked: false },
      { name: "Programador Ninja", description: "Dominou tecnologias modernas", icon: "🥷", unlocked: true },
      { name: "Arquiteto", description: "Criou arquiteturas escaláveis", icon: "🏗️", unlocked: true },
      { name: "Mestre Frontend", description: "Expert em React & TypeScript", icon: "⚛️", unlocked: true }
    ]
  };

  return (
    <DemoContext.Provider value={demoData}>
      {children}
    </DemoContext.Provider>
  );
}