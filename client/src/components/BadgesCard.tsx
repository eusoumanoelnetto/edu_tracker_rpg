import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

interface Achievement {
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

type DemoAchievement = {
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
};

type DbAchievement = {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  icon: string | null;
  unlockedAt: Date;
  createdAt: Date;
};

interface BadgesCardProps {
  achievements?: DemoAchievement[] | DbAchievement[];
  isDemoMode: boolean;
}

export function BadgesCard({ achievements: propAchievements, isDemoMode }: BadgesCardProps) {
  const { data: achievements, isLoading } = trpc.achievements.list.useQuery(undefined, {
    enabled: !isDemoMode
  });

  if (isLoading && !isDemoMode) {
    return (
      <div className="arcade-card p-4 flex items-center justify-center min-h-[200px]">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  const currentAchievements = isDemoMode ? propAchievements : achievements;
  const unlockedBadges = currentAchievements?.filter(a => 
    isDemoMode ? (a as DemoAchievement).unlocked : (a as DbAchievement).unlockedAt
  ) || [];
  const totalBadges = currentAchievements?.length || 10;

  return (
    <div className="arcade-card p-3 sm:p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm sm:text-base font-bold text-foreground uppercase">Selos</h3>
        <span className="text-xs sm:text-sm font-bold text-muted-foreground">
          {unlockedBadges.length}/{totalBadges}
        </span>
      </div>

      {/* Grid de Selos */}
      <div className="grid grid-cols-5 gap-2">
        {currentAchievements?.map((achievement, index) => {
          const isUnlocked = isDemoMode 
            ? (achievement as DemoAchievement).unlocked 
            : (achievement as DbAchievement).unlockedAt;

          return (
            <div
              key={index}
              className={`
                aspect-square arcade-card p-1 flex items-center justify-center
                ${isUnlocked ? 'bg-accent/20' : 'bg-muted opacity-50'}
              `}
              title={isUnlocked 
                ? isDemoMode 
                  ? `${(achievement as DemoAchievement).name}: ${(achievement as DemoAchievement).description}` 
                  : `${(achievement as DbAchievement).title}: ${(achievement as DbAchievement).description}` 
                : 'Selo bloqueado'}
            >
              {isUnlocked ? (
                <span className="text-lg">{achievement.icon}</span>
              ) : (
                <span className="text-lg opacity-30">🔒</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Mensagem motivacional */}
      <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-4 uppercase">
        {unlockedBadges.length === 0
          ? "Complete cursos para desbloquear selos!"
          : `Continue conquistando! ${totalBadges - unlockedBadges.length} restantes`}
      </p>
    </div>
  );
}
