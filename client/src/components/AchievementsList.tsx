import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Achievement as DBAchievement } from "@shared/types";

interface DemoAchievement {
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

type DbAchievement = {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  icon: string | null;
  unlockedAt: Date;
  createdAt: Date;
};

interface AchievementsListProps {
  achievements?: DemoAchievement[] | DbAchievement[];
  isDemoMode?: boolean;
}

export function AchievementsList({ achievements: propAchievements, isDemoMode }: AchievementsListProps) {
  const { data: achievements, isLoading, error } = trpc.achievements.list.useQuery(undefined, {
    enabled: !isDemoMode,
    staleTime: 10 * 60 * 1000, // 10 minutos para achievements (mudam menos)
    retry: 1,
  });

  if (isLoading && !isDemoMode) {
    return (
      <div className="arcade-card">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="arcade-card bg-muted text-center p-3">
              <Skeleton className="w-12 h-12 mx-auto mb-2 rounded-full" />
              <Skeleton className="h-3 w-16 mx-auto mb-1" />
              <Skeleton className="h-2 w-12 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentAchievements = isDemoMode ? propAchievements : achievements;
  const unlockedAchievements = currentAchievements?.filter(a => {
    if (isDemoMode) {
      return (a as DemoAchievement).unlocked;
    }
    return (a as DBAchievement).unlockedAt;
  }) || [];

  return (
    <div className="arcade-card">
      {unlockedAchievements && unlockedAchievements.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {unlockedAchievements.map((achievement, index) => {
            const isDemo = isDemoMode && 'unlocked' in achievement;
            const demoAch = achievement as DemoAchievement;
            const dbAch = achievement as DBAchievement;
            
            return (
              <div
                key={isDemo ? index : dbAch.id}
                className="arcade-card bg-muted text-center hover:bg-accent transition-colors p-3"
              >
                <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center text-2xl">
                  {isDemo ? demoAch.icon : dbAch.icon || "🏆"}
                </div>
                <p className="text-xs font-bold text-foreground mb-1 uppercase">
                  {isDemo ? demoAch.name : dbAch.title}
                </p>
                {achievement.description && (
                  <p className="text-xs text-muted-foreground">
                    {achievement.description}
                  </p>
                )}
                {!isDemo && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(dbAch.unlockedAt).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm uppercase font-bold">Nenhum achievement desbloqueado</p>
          <p className="text-xs">Complete cursos para desbloquear achievements!</p>
        </div>
      )}
    </div>
  );
}
