import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  currentAvatar?: string;
}

const AVATAR_OPTIONS = [
  { src: "/boy-1.png", label: "Aventureiro" },
  { src: "/girl-2.png", label: "Aventureira" },
  { src: "/character-sprite.png", label: "Guerreiro" },
  { src: "/girl-1.png", label: "Maga" },
  { src: "/boy-2.png", label: "Cavaleiro" },
  { src: "https://api.dicebear.com/7.x/pixel-art/svg?seed=scholar&flip=false", label: "Estudiosa" },
];

export function EditProfileDialog({
  open,
  onOpenChange,
  currentName,
  currentAvatar,
}: EditProfileDialogProps) {
  const [name, setName] = useState(currentName);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || AVATAR_OPTIONS[0].src);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  
  // Obter utils fora das callbacks
  const utils = trpc.useUtils();
  
  // Sincronizar com props quando abrir o diálogo ou props mudarem
  useEffect(() => {
    if (open) {
      setName(currentName);
      setSelectedAvatar(currentAvatar || AVATAR_OPTIONS[0].src);
      setShowAvatarOptions(false);
    }
  }, [open, currentName, currentAvatar]);
  
  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Perfil atualizado com sucesso! 🎮");
      
      const updatedData = {
        name: name.trim(),
        avatar: selectedAvatar,
      };
      
      // Salvar no localStorage para persistir em modo dev
      if (typeof window !== 'undefined') {
        localStorage.setItem('dev_profile_override', JSON.stringify(updatedData));
      }
      
      // Forçar atualização do cache local
      utils.auth.me.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          ...updatedData,
        };
      });
      utils.auth.me.invalidate();
      onOpenChange(false);
    },
    onError: (error) => {
      // Em modo dev sem banco, simular sucesso
      if (error.message.includes("Database not available") || error.message.includes("ECONNREFUSED")) {
        console.log("[Dev Mode] Simulating profile update success");
        toast.success("Perfil atualizado com sucesso! 🎮 (modo dev)");
        
        const updatedData = {
          name: name.trim(),
          avatar: selectedAvatar,
        };
        
        // Salvar no localStorage para persistir em modo dev
        if (typeof window !== 'undefined') {
          localStorage.setItem('dev_profile_override', JSON.stringify(updatedData));
        }
        
        // Atualizar cache local mesmo sem banco
        utils.auth.me.setData(undefined, (old) => {
          if (!old) return old;
          return {
            ...old,
            ...updatedData,
          };
        });
        onOpenChange(false);
      } else {
        toast.error("Erro ao atualizar perfil: " + error.message);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Nome não pode estar vazio!");
      return;
    }

    updateProfileMutation.mutate({
      name: name.trim(),
      avatar: selectedAvatar,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="arcade-card sm:max-w-[500px] max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-foreground uppercase text-sm sm:text-base">Editar Perfil</DialogTitle>
          <DialogDescription className="text-muted-foreground text-[10px] sm:text-xs uppercase">
            Personalize seu personagem
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground uppercase text-[10px] sm:text-xs font-bold">
              Nome do Aventureiro
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome"
              maxLength={50}
              className="arcade-input text-sm bg-white dark:bg-white text-gray-900"
            />
          </div>

          {/* Avatar - Clique para expandir opções */}
          <div className="space-y-2">
            <Label className="text-foreground uppercase text-[10px] sm:text-xs font-bold">
              Avatar do Personagem
            </Label>
            
            {/* Avatar atual - Clique para trocar */}
            {!showAvatarOptions ? (
              <button
                type="button"
                onClick={() => setShowAvatarOptions(true)}
                className="arcade-card p-3 sm:p-4 w-full hover:ring-2 hover:ring-primary transition-all"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={selectedAvatar}
                    alt="Avatar atual"
                    className="w-12 h-12 sm:w-16 sm:h-16 pixel-art"
                    style={{
                      objectFit: 'contain',
                      maxWidth: (selectedAvatar.includes('boy-') || selectedAvatar.includes('girl-')) ? '70%' : '100%'
                    }}
                    onError={(e) => {
                      e.currentTarget.src = "/character-sprite.png";
                    }}
                  />
                  <div className="flex-1 text-left">
                    <p className="text-foreground text-xs sm:text-sm font-bold uppercase">
                      {AVATAR_OPTIONS.find(a => a.src === selectedAvatar)?.label || "Aventureiro"}
                    </p>
                    <p className="text-muted-foreground text-[10px] sm:text-xs uppercase">
                      Clique para trocar
                    </p>
                  </div>
                </div>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <button
                      key={avatar.src}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(avatar.src);
                        setShowAvatarOptions(false);
                      }}
                      className={`
                        arcade-card p-1.5 sm:p-2 transition-all flex flex-col items-center gap-1
                        ${selectedAvatar === avatar.src 
                          ? 'ring-2 ring-primary ring-offset-1 sm:ring-offset-2 ring-offset-background' 
                          : 'hover:ring-2 hover:ring-accent'
                        }
                      `}
                    >
                      <img
                        src={avatar.src}
                        alt={avatar.label}
                        className="w-10 h-10 sm:w-12 sm:h-12 pixel-art mx-auto"
                        style={{
                          objectFit: 'contain',
                          maxWidth: (avatar.src.includes('boy-') || avatar.src.includes('girl-')) ? '70%' : '100%'
                        }}
                        onError={(e) => {
                          e.currentTarget.src = "/character-sprite.png";
                        }}
                      />
                      <span className="text-[8px] sm:text-[10px] text-foreground uppercase font-bold text-center">
                        {avatar.label}
                      </span>
                    </button>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAvatarOptions(false)}
                  className="w-full text-xs"
                >
                  Voltar
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="arcade-button secondary text-[10px] sm:text-xs text-foreground font-bold w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="arcade-button primary text-[10px] sm:text-xs w-full sm:w-auto"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={12} />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
