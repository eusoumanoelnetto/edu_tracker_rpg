import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { EditProfileDialog } from "./EditProfileDialog";
import { Button } from "@/components/ui/button";

interface CharacterHUDProps {
  characterName?: string;
  avatar?: string;
}

export function CharacterHUD({ characterName = "Adventurer", avatar }: CharacterHUDProps) {
  const { data: progress } = trpc.progress.get.useQuery();
  const [displayExp, setDisplayExp] = useState(0);
  const [displayLevel, setDisplayLevel] = useState(1);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    if (progress) {
      setDisplayLevel(progress.currentLevel);
      setDisplayExp(progress.currentExperience);
    }
  }, [progress]);

  const expPercentage = progress
    ? (progress.currentExperience / progress.experienceToNextLevel) * 100
    : 0;

  return (
    <>
      <div className="arcade-card max-w-sm p-3 sm:p-4">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-4 relative">
          <img
            src={avatar || "/character-sprite.png"}
            alt="Character"
            className="w-12 h-12 sm:w-16 sm:h-16 pixel-art flex-shrink-0"
            onError={(e) => {
              e.currentTarget.src = "/character-sprite.png";
            }}
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-foreground uppercase break-words">{characterName}</h2>
            <div className="flex gap-2 mt-2">
              <span className="level-badge text-xs sm:text-sm">LVL {displayLevel}</span>
            </div>
          </div>
          <Button
            onClick={() => setShowEditDialog(true)}
            variant="ghost"
            size="sm"
            className="absolute top-0 right-0 h-[60px] w-[60px] p-2 hover:bg-accent"
            title="Editar perfil"
          >
            <img 
              src="/engren.png" 
              alt="Editar" 
              className="w-full h-full pixel-art"
              style={{ marginTop: '-55%', marginLeft: '65%' }}
            />
          </Button>
        </div>

      {/* Experience Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-foreground uppercase">EXP</span>
          <span className="xp-badge text-xs">{displayExp}/{progress?.experienceToNextLevel || 1000}</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill primary"
            style={{ width: `${expPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="arcade-card bg-muted p-2 sm:p-3">
          <p className="text-muted-foreground uppercase font-bold text-xs mb-1">Courses</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {progress?.coursesCompleted || 0}
          </p>
        </div>
        <div className="arcade-card bg-muted p-2 sm:p-3">
          <p className="text-muted-foreground uppercase font-bold text-xs mb-1">Total XP</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {progress?.totalExperience || 0}
          </p>
        </div>
      </div>
    </div>

      <EditProfileDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        currentName={characterName}
        currentAvatar={avatar}
      />
    </>
  );
}
