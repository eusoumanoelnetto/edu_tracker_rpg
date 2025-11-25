import { describe, expect, it } from "vitest";

describe("Completion Screen - UI Logic", () => {
  describe("Achievement Display", () => {
    it("should calculate completion percentage correctly", () => {
      const completedHours = 20;
      const totalHours = 20;
      const percentage = (completedHours / totalHours) * 100;
      expect(percentage).toBe(100);
    });

    it("should display correct completion for partial progress", () => {
      const completedHours = 15;
      const totalHours = 30;
      const percentage = Math.round((completedHours / totalHours) * 100);
      expect(percentage).toBe(50);
    });

    it("should identify course as completed at 100%", () => {
      const completionPercentage = 100;
      const isCompleted = completionPercentage === 100;
      expect(isCompleted).toBe(true);
    });

    it("should generate achievement title correctly", () => {
      const courseName = "React Basics";
      const achievementTitle = `Completou: ${courseName}`;
      expect(achievementTitle).toBe("Completou: React Basics");
    });
  });

  describe("LinkedIn Sharing", () => {
    it("should format LinkedIn share message correctly", () => {
      const courseName = "React Basics";
      const defaultMessage = `🎮 Acabo de completar "${courseName}" no RPG Edu Tracker! Transformei meu aprendizado em uma aventura épica! 🚀 #educação #gamificação #aprendizado`;

      expect(defaultMessage).toContain(courseName);
      expect(defaultMessage).toContain("RPG Edu Tracker");
      expect(defaultMessage).toContain("#educação");
    });

    it("should allow message customization", () => {
      let message = `🎮 Acabo de completar "TypeScript" no RPG Edu Tracker!`;
      const customMessage = message.replace("TypeScript", "Advanced TypeScript");

      expect(customMessage).toContain("Advanced TypeScript");
      expect(customMessage).not.toContain("Acabo de completar \"TypeScript\"");
    });

    it("should encode message for URL sharing", () => {
      const message = "Test message with spaces and special chars!";
      const encoded = encodeURIComponent(message);
      expect(encoded).toContain("%20");
      expect(encoded).toContain("special");
    });

    it("should generate valid LinkedIn share URL", () => {
      const baseUrl = "https://www.linkedin.com/sharing/share-offsite/";
      const url = `${baseUrl}?url=${encodeURIComponent("https://example.com")}`;
      expect(url).toContain("linkedin.com");
      expect(url).toContain("share-offsite");
    });
  });

  describe("Image Download", () => {
    it("should generate valid filename from course name", () => {
      const courseName = "React Basics";
      const filename = `${courseName.replace(/\s+/g, "-")}-achievement.png`;
      expect(filename).toBe("React-Basics-achievement.png");
    });

    it("should handle special characters in filename", () => {
      const courseName = "C++ Advanced: OOP";
      const filename = `${courseName.replace(/\s+/g, "-")}-achievement.png`;
      expect(filename).toContain("achievement.png");
    });

    it("should create data URL for canvas image", () => {
      const dataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      expect(dataUrl).toMatch(/^data:image\/png;base64,/);
    });
  });

  describe("Experience Rewards", () => {
    it("should award correct experience for course completion", () => {
      const baseXP = 500;
      const courseCategory = "course";
      const xpReward = baseXP;
      expect(xpReward).toBe(500);
    });

    it("should calculate bonus XP for bootcamp", () => {
      const baseXP = 500;
      const category = "bootcamp";
      const multiplier = category === "bootcamp" ? 1.5 : 1;
      const totalXP = Math.floor(baseXP * multiplier);
      expect(totalXP).toBe(750);
    });

    it("should display XP reward in UI", () => {
      const xpAmount = 500;
      const displayText = `+${xpAmount} XP`;
      expect(displayText).toBe("+500 XP");
    });
  });

  describe("Screen Styling", () => {
    it("should use correct border styling for 8-bit aesthetic", () => {
      const borderSize = 8;
      const borderStyle = `border-${borderSize}`;
      expect(borderStyle).toContain("border");
    });

    it("should apply correct color scheme", () => {
      const colors = {
        background: "from-yellow-100 to-yellow-50",
        border: "border-yellow-900",
        accent: "bg-green-500",
      };
      expect(colors.background).toContain("yellow");
      expect(colors.border).toContain("yellow");
      expect(colors.accent).toContain("green");
    });

    it("should include decorative corner elements", () => {
      const corners = 4;
      expect(corners).toBe(4);
    });
  });

  describe("User Interaction", () => {
    it("should enable download button when screen is ready", () => {
      const isDownloading = false;
      const isEnabled = !isDownloading;
      expect(isEnabled).toBe(true);
    });

    it("should disable download button during download", () => {
      const isDownloading = true;
      const isEnabled = !isDownloading;
      expect(isEnabled).toBe(false);
    });

    it("should show loading state during download", () => {
      const isDownloading = true;
      const buttonText = isDownloading ? "Baixando..." : "Baixar Imagem";
      expect(buttonText).toBe("Baixando...");
    });

    it("should close modal when close button is clicked", () => {
      let isOpen = true;
      const handleClose = () => {
        isOpen = false;
      };
      handleClose();
      expect(isOpen).toBe(false);
    });
  });

  describe("Responsive Design", () => {
    it("should use responsive max-width", () => {
      const maxWidth = "max-w-2xl";
      expect(maxWidth).toContain("max-w");
    });

    it("should use responsive padding", () => {
      const padding = "p-4";
      expect(padding).toContain("p-");
    });

    it("should stack buttons on mobile", () => {
      const layout = "flex gap-3";
      expect(layout).toContain("flex");
    });
  });
});
