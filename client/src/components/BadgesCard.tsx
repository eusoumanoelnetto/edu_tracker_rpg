import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export function BadgesCard() {
  const { data: achievements, isLoading } = trpc.achievements.list.useQuery();

  if (isLoading) {
    return (
      <div className="arcade-card p-4 flex items-center justify-center min-h-[200px]">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  const unlockedBadges = achievements?.filter(a => a.unlockedAt) || [];
  const totalBadges = 10; // Total de selos disponíveis

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
        {[...Array(totalBadges)].map((_, index) => {
          const badge = unlockedBadges[index];
          const isUnlocked = badge !== undefined;

          return (
            <div
              key={index}
              className={`
                aspect-square arcade-card p-1 flex items-center justify-center
                ${isUnlocked ? 'bg-accent/20' : 'bg-muted opacity-50'}
              `}
              title={badge?.title || 'Selo bloqueado'}
            >
              {isUnlocked ? (
                <span className="text-2xl">🏆</span>
              ) : (
                <span className="text-2xl opacity-30">🔒</span>
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
