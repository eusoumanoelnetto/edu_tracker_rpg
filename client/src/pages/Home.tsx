import { Button } from "@/components/ui/button";
import { CharacterHUD } from "@/components/CharacterHUD";
import { CourseList } from "@/components/CourseList";
import { AchievementsList } from "@/components/AchievementsList";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  
  // Pré-carregar dados em paralelo
  const coursesQuery = trpc.courses.list.useQuery(undefined, { enabled: isAuthenticated });
  const achievementsQuery = trpc.achievements.list.useQuery(undefined, { enabled: isAuthenticated });
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "course",
    totalHours: 10,
  });

  const createCourseMutation = trpc.courses.create.useMutation({
    onSuccess: () => {
      // Invalidar cache e refazer queries
      coursesQuery.refetch();
      achievementsQuery.refetch();
    },
  });

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Título do curso é obrigatório");
      return;
    }

    try {
      await createCourseMutation.mutateAsync(formData);
      setFormData({ title: "", description: "", category: "course", totalHours: 10 });
      setShowAddCourse(false);
      toast.success("Curso adicionado com sucesso! 🎮");
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("Erro ao adicionar curso. Tente novamente!");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Desconectado com sucesso!");
    } catch (error) {
      toast.error("Erro ao desconectar");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="h-8 w-64 bg-muted animate-pulse rounded"></div>
            <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
          </div>
          
          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Character HUD Skeleton */}
            <div className="lg:col-span-1">
              <div className="arcade-card p-4">
                <div className="h-32 w-full bg-muted animate-pulse rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                  <div className="h-3 w-32 bg-muted animate-pulse rounded"></div>
                </div>
              </div>
            </div>
            
            {/* Courses Skeleton */}
            <div className="lg:col-span-2 space-y-4">
              <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
              {[1, 2].map(i => (
                <div key={i} className="arcade-card p-4">
                  <div className="h-20 w-full bg-muted animate-pulse rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="text-center max-w-md arcade-card">
          <h1 className="text-3xl font-bold text-foreground mb-2 uppercase">
            RPG Edu Tracker
          </h1>
          <p className="text-sm text-muted-foreground mb-6 uppercase tracking-wider">
            Transforme Seu Aprendizado em Aventura
          </p>
          <p className="text-muted-foreground mb-8 text-xs uppercase leading-relaxed">
            Registre seus cursos, ganhe experiência e desbloqueie conquistas enquanto aprende.
          </p>
          <a
            href={getLoginUrl()}
            className="arcade-button primary w-full inline-block text-center text-sm py-3 font-bold hover:shadow-lg"
          >
            {import.meta.env.VITE_USE_DEV_AUTH === "true" ? "Entrar (Dev Mode)" : "Entrar com Google"}
          </a>
          <p className="text-xs text-muted-foreground mt-6 uppercase">
            ⚔️ Comece sua jornada agora! ⚔️
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground uppercase">
            RPG Edu Tracker
          </h1>
          <button
            onClick={handleLogout}
            className="arcade-button destructive text-xs sm:text-sm px-3 sm:px-4"
          >
            Sair
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Character HUD - Sidebar */}
          <div className="lg:col-span-1">
            <CharacterHUD 
              characterName={user?.name || "Aventureiro"} 
              avatar={user?.avatar}
            />
          </div>

          {/* Courses Section - Main */}
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground uppercase">
                Meus Cursos
              </h2>
              <button
                onClick={() => setShowAddCourse(!showAddCourse)}
                className="arcade-button accent text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap"
              >
                + Novo Curso
              </button>
            </div>

            {/* Add Course Form */}
            {showAddCourse && (
              <form onSubmit={handleAddCourse} className="arcade-card mb-6 p-3 sm:p-4">
                <h3 className="text-sm font-bold text-foreground uppercase mb-4">
                  Adicionar Novo Curso
                </h3>
                
                <div className="space-y-3 mb-4">
                  <input
                    type="text"
                    placeholder="Título do curso"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full p-2 border-2 border-foreground bg-background text-foreground text-xs font-bold"
                    required
                  />
                  
                  <textarea
                    placeholder="Descrição (opcional)"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full p-2 border-2 border-foreground bg-background text-foreground text-xs font-bold"
                    rows={2}
                  />
                  
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full p-2 border-2 border-foreground bg-background text-foreground text-xs font-bold"
                  >
                    <option value="course">Curso</option>
                    <option value="bootcamp">Bootcamp</option>
                    <option value="trail">Trilha</option>
                    <option value="project">Projeto</option>
                  </select>
                  
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    placeholder="Total de horas"
                    value={formData.totalHours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalHours: parseInt(e.target.value) || 10,
                      })
                    }
                    className="w-full p-2 border-2 border-foreground bg-background text-foreground text-xs font-bold"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="submit"
                    disabled={createCourseMutation.isPending}
                    className="arcade-button secondary flex-1 text-xs py-2 disabled:opacity-50"
                  >
                    {createCourseMutation.isPending ? "Salvando..." : "Salvar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddCourse(false)}
                    className="arcade-button destructive flex-1 text-xs py-2"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {/* Courses List */}
            <CourseList />
          </div>
        </div>

        {/* Achievements Section */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground uppercase mb-6">
            Conquistas
          </h2>
          <AchievementsList />
        </div>
      </div>
    </div>
  );
}
