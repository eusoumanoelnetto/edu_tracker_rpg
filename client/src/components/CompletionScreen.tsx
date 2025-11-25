import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2, X } from "lucide-react";
import html2canvas from "html2canvas";

interface CompletionScreenProps {
  courseName: string;
  courseCategory: string;
  completionPercentage: number;
  characterName: string;
  onClose: () => void;
}

export function CompletionScreen({
  courseName,
  courseCategory,
  completionPercentage,
  characterName,
  onClose,
}: CompletionScreenProps) {
  const screenRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [shareMessage, setShareMessage] = useState(
    `🎮 Acabo de completar "${courseName}" no RPG Edu Tracker! Transformei meu aprendizado em uma aventura épica! 🚀 #educação #gamificação #aprendizado`
  );

  const handleDownloadImage = async () => {
    if (!screenRef.current) return;
    setIsDownloading(true);

    try {
      const canvas = await html2canvas(screenRef.current, {
        backgroundColor: "#f5f1e8",
        scale: 2,
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${courseName.replace(/\s+/g, "-")}-achievement.png`;
      link.click();
    } catch (error) {
      console.error("Error downloading image:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareLinkedIn = () => {
    const encodedMessage = encodeURIComponent(shareMessage);
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;

    // Open LinkedIn share dialog
    window.open(linkedInUrl, "linkedin-share", "width=600,height=400");

    // Also copy to clipboard for manual sharing
    navigator.clipboard.writeText(shareMessage);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="w-full max-w-md sm:max-w-lg my-auto">
        {/* Completion Screen */}
        <div
          ref={screenRef}
          className="arcade-card bg-gradient-to-b from-yellow-100 to-yellow-50 relative"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 p-1 hover:bg-muted rounded"
          >
            <X size={20} className="text-foreground" />
          </button>

          {/* Content */}
          <div className="text-center space-y-4 sm:space-y-6">
            {/* Achievement Unlocked */}
            <div className="animate-bounce">
              <div className="text-5xl sm:text-6xl mb-2 sm:mb-4">⭐</div>
              <h1 className="text-xl sm:text-3xl font-bold text-foreground uppercase">
                ACHIEVEMENT UNLOCKED!
              </h1>
            </div>

            {/* Course Info */}
            <div className="arcade-card bg-accent border-4 border-foreground p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-foreground font-bold mb-1 uppercase">
                {courseCategory}
              </p>
              <h2 className="text-lg sm:text-2xl font-bold text-foreground mb-3 uppercase break-words">
                {courseName}
              </h2>
              <p className="text-base sm:text-lg text-foreground font-bold mb-3">
                {completionPercentage}% COMPLETO
              </p>

              {/* Progress bar */}
              <div className="progress-bar">
                <div
                  className="progress-bar-fill secondary"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Character */}
            <div className="flex justify-center">
              <div className="text-center">
                <img
                  src="/character-sprite.png"
                  alt="Character"
                  className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-2 pixel-art"
                />
                <p className="text-xs sm:text-sm font-bold text-foreground uppercase">
                  {characterName}
                </p>
              </div>
            </div>

            {/* Experience Gained */}
            <div className="arcade-card bg-secondary border-4 border-foreground p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-white font-bold uppercase mb-1">
                EXPERIÊNCIA GANHA
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-white">+500 XP</p>
            </div>

            {/* Decorative text */}
            <p className="text-xs text-foreground font-bold tracking-widest uppercase">
              ★ ★ ★ PARABÉNS! ★ ★ ★
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 sm:mt-6 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="arcade-button secondary flex-1 gap-2 text-xs py-2 sm:py-3 flex items-center justify-center"
            >
              <Download size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Baixar Imagem</span>
              <span className="sm:hidden">Baixar</span>
            </button>
            <button
              onClick={handleShareLinkedIn}
              className="arcade-button primary flex-1 gap-2 text-xs py-2 sm:py-3 flex items-center justify-center"
            >
              <Share2 size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Compartilhar</span>
              <span className="sm:hidden">Compartilhar</span>
            </button>
          </div>

          {/* Edit Message */}
          <div className="arcade-card bg-muted p-3 sm:p-4">
            <label className="block text-xs font-bold text-foreground mb-2 uppercase">
              Mensagem para LinkedIn
            </label>
            <textarea
              value={shareMessage}
              onChange={(e) => setShareMessage(e.target.value)}
              className="w-full p-2 border-2 border-foreground bg-background text-foreground text-xs rounded-none resize-none font-bold"
              rows={2}
            />
          </div>

          <button onClick={onClose} className="arcade-button destructive w-full text-xs py-2 sm:py-3">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
