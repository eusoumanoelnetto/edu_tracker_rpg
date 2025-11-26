import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { CompletionScreen } from "./CompletionScreen";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface CourseListProps {
  courses?: any[];
  isDemoMode?: boolean;
}

export function CourseList({ courses: propCourses, isDemoMode }: CourseListProps) {
  const { data: courses, isLoading, error } = trpc.courses.list.useQuery(undefined, {
    enabled: !isDemoMode,
    staleTime: 2 * 60 * 1000, // 2 minutos para dados mais dinâmicos
    retry: 1,
  });
  const updateCourseMutation = trpc.courses.update.useMutation({
    onSuccess: () => {
      // Invalidar cache de cursos para atualizar dados
      trpc.useUtils().courses.list.invalidate();
      trpc.useUtils().achievements.list.invalidate();
    },
  });
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [completedCourse, setCompletedCourse] = useState<any | null>(null);

  const handleUpdateProgress = async (courseId: number, newProgress: number) => {
    if (isDemoMode) {
      toast.success("Modo demo - funcionalidade limitada");
      return;
    }

    const currentCourses = isDemoMode ? propCourses : courses;
    const course = currentCourses?.find((c) => c.id === courseId);
    if (!course) return;

    if (newProgress < 0 || newProgress > course.totalHours) {
      toast.error("Progresso inválido!");
      return;
    }

    const newStatus =
      newProgress >= course.totalHours ? "completed" : "in_progress";

    try {
      await updateCourseMutation.mutateAsync({
        courseId,
        completedHours: newProgress,
        status: newStatus,
      });
      
      if (newStatus === "completed") {
        toast.success("Parabéns! Curso completado! 🎉");
      } else {
        toast.success("Progresso atualizado!");
      }
    } catch (error) {
      toast.error("Erro ao atualizar progresso");
    }
  };

  const handleAddHour = async (courseId: number) => {
    if (isDemoMode) {
      toast.success("Modo demo - funcionalidade limitada");
      return;
    }

    const currentCourses = isDemoMode ? propCourses : courses;
    const course = currentCourses?.find((c) => c.id === courseId);
    if (!course) return;

    const newProgress = Math.min(course.completedHours + 1, course.totalHours);
    await handleUpdateProgress(courseId, newProgress);
  };

  if (isLoading && !isDemoMode) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="arcade-card p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const currentCourses = isDemoMode ? propCourses : courses;

  return (
    <div className="space-y-3 sm:space-y-4">
      {currentCourses?.map((course) => {
        const progress = (course.completedHours / course.totalHours) * 100;
        const isCompleted = course.status === "completed";

        return (
          <div
            key={course.id}
            className="arcade-card p-3 sm:p-4"
          >
            {/* Mobile: Vertical Layout, Desktop: Horizontal Layout */}
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              {/* Icon */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted border-2 border-foreground flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">📚</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 w-full">
                <h3 className="font-bold text-foreground uppercase text-xs sm:text-sm break-words">{course.title}</h3>
                <p className="text-xs text-muted-foreground uppercase mb-2">
                  {course.category}
                </p>
                <div className="progress-bar mb-2">
                  <div
                    className={`progress-bar-fill ${
                      isCompleted ? "secondary" : "primary"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {course.completedHours} / {course.totalHours} horas
                </p>

                {/* Action Buttons */}
                {!isCompleted && (
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <button
                      onClick={() => handleAddHour(course.id)}
                      disabled={updateCourseMutation.isPending}
                      className="arcade-button text-xs px-3 py-2 flex-1 sm:flex-none whitespace-nowrap disabled:opacity-50"
                    >
                      +1h
                    </button>
                    {course.completedHours > 0 && (
                      <button
                        onClick={() => setSelectedCourse(course.id)}
                        disabled={updateCourseMutation.isPending}
                        className="arcade-button accent text-xs px-3 py-2 flex-1 sm:flex-none whitespace-nowrap disabled:opacity-50"
                      >
                        <span className="hidden sm:inline">Editar</span>
                        <span className="sm:hidden">✏️</span>
                      </button>
                    )}
                    {course.completedHours > 0 && (
                      <button
                        onClick={() => setCompletedCourse(course)}
                        className="arcade-button secondary text-xs px-3 py-2 flex-1 sm:flex-none whitespace-nowrap"
                      >
                        <span className="hidden sm:inline">Completar</span>
                        <span className="sm:hidden">✓</span>
                      </button>
                    )}
                  </div>
                )}
                {isCompleted && (
                  <div className="flex items-center gap-2 w-full">
                    <img
                      src="/badge-achievement.png"
                      alt="Completed"
                      className="w-6 h-6 sm:w-8 sm:h-8 pixel-art flex-shrink-0"
                    />
                    <button
                      onClick={() => setCompletedCourse(course)}
                      className="arcade-button secondary text-xs px-3 py-2 flex-1 sm:flex-none whitespace-nowrap"
                    >
                      Ver
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Progress Section */}
            {selectedCourse === course.id && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-foreground">
                <input
                  type="number"
                  min="0"
                  max={course.totalHours}
                  defaultValue={course.completedHours}
                  data-course={course.id}
                  className="w-full p-2 border-2 border-foreground bg-background text-foreground text-sm mb-2 font-bold"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const value = parseInt(
                        (e.target as HTMLInputElement).value
                      );
                      handleUpdateProgress(course.id, value);
                      setSelectedCourse(null);
                    }
                  }}
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      const input = document.querySelector(
                        `input[data-course="${course.id}"]`
                      ) as HTMLInputElement;
                      if (input) {
                        const value = parseInt(input.value);
                        handleUpdateProgress(course.id, value);
                        setSelectedCourse(null);
                      }
                    }}
                    disabled={updateCourseMutation.isPending}
                    className="arcade-button secondary flex-1 text-xs py-2 disabled:opacity-50"
                  >
                    {updateCourseMutation.isPending ? "..." : "Save"}
                  </button>
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="arcade-button destructive flex-1 text-xs py-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {!currentCourses || (currentCourses.length === 0 && (
        <div className="text-center py-6 sm:py-8 text-muted-foreground arcade-card">
          <p className="text-xs sm:text-sm uppercase font-bold">Nenhum curso registrado</p>
          <p className="text-xs">Comece adicionando seu primeiro curso!</p>
        </div>
      ))}

      {completedCourse && (
        <CompletionScreen
          courseName={completedCourse.title}
          courseCategory={completedCourse.category}
          completionPercentage={Math.round(
            (completedCourse.completedHours / completedCourse.totalHours) * 100
          )}
          characterName="Adventurer"
          onClose={() => setCompletedCourse(null)}
        />
      )}
    </div>
  );
}
