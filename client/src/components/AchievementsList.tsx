import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function AchievementsList() {
  const { data: achievements, isLoading, error } = trpc.achievements.list.useQuery(undefined, {
    staleTime: 10 * 60 * 1000, // 10 minutos para achievements (mudam menos)
    retry: 1,
  });

  if (isLoading) {
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

  return (
    <div className="arcade-card">
      {achievements && achievements.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="arcade-card bg-muted text-center hover:bg-accent transition-colors"
            >
              <img
                src={achievement.icon || "/badge-achievement.png"}
                alt={achievement.title}
                className="w-12 h-12 mx-auto mb-2 pixel-art"
              />
              <p className="text-xs font-bold text-foreground mb-1 uppercase">
                {achievement.title}
              </p>
              {achievement.description && (
                <p className="text-xs text-muted-foreground">
                  {achievement.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(achievement.unlockedAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          ))}
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
