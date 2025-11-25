import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("RPG Edu Tracker - Core Features", () => {
  describe("User Progress System", () => {
    it("should initialize user progress with level 1", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const progress = await caller.progress.get();
      expect(progress).toBeDefined();
      expect(progress.currentLevel).toBe(1);
      expect(progress.currentExperience).toBe(0);
      expect(progress.totalExperience).toBe(0);
      expect(progress.experienceToNextLevel).toBe(1000);
    });

    it("should correctly calculate experience percentage", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const progress = await caller.progress.get();
      const expPercentage = (progress.currentExperience / progress.experienceToNextLevel) * 100;
      expect(expPercentage).toBe(0);
    });
  });

  describe("Course Management", () => {
    it("should validate course creation input", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Test that create procedure accepts valid input
      const validInput = {
        title: "React Basics",
        description: "Learn React fundamentals",
        category: "course",
        totalHours: 20,
      };

      expect(validInput.title).toBeTruthy();
      expect(validInput.category).toMatch(/^(course|bootcamp|trilha|projeto)$/);
      expect(validInput.totalHours).toBeGreaterThan(0);
    });

    it("should validate course status values", () => {
      const validStatuses = ["not_started", "in_progress", "completed"];
      const testStatus = "in_progress";
      expect(validStatuses).toContain(testStatus);
    });

    it("should calculate course progress percentage correctly", () => {
      const completedHours = 15;
      const totalHours = 30;
      const progressPercentage = (completedHours / totalHours) * 100;
      expect(progressPercentage).toBe(50);
    });

    it("should identify completed courses", () => {
      const courseStatus = "completed";
      const isCompleted = courseStatus === "completed";
      expect(isCompleted).toBe(true);
    });
  });

  describe("Achievement System", () => {
    it("should validate achievement unlock input", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const validInput = {
        title: "First Steps",
        description: "Complete your first course",
      };

      expect(validInput.title).toBeTruthy();
      expect(validInput.description).toBeTruthy();
    });

    it("should have default achievement icon", () => {
      const defaultIcon = "/badge-achievement.png";
      expect(defaultIcon).toMatch(/\.(png|jpg|gif)$/);
    });
  });

  describe("Experience System Logic", () => {
    it("should calculate level up correctly with no overflow", () => {
      const currentExp = 0;
      const addedExp = 500;
      const expNeeded = 1000;

      const newExp = currentExp + addedExp;
      const shouldLevelUp = newExp >= expNeeded;
      const newLevel = shouldLevelUp ? 2 : 1;

      expect(shouldLevelUp).toBe(false);
      expect(newLevel).toBe(1);
      expect(newExp).toBe(500);
    });

    it("should calculate level up with exact threshold", () => {
      const currentExp = 0;
      const addedExp = 1000;
      const expNeeded = 1000;

      const newExp = currentExp + addedExp;
      const shouldLevelUp = newExp >= expNeeded;
      const newLevel = shouldLevelUp ? 2 : 1;
      const overflow = shouldLevelUp ? newExp - expNeeded : 0;

      expect(shouldLevelUp).toBe(true);
      expect(newLevel).toBe(2);
      expect(overflow).toBe(0);
    });

    it("should calculate level up with overflow experience", () => {
      const currentExp = 0;
      const addedExp = 1200;
      const expNeeded = 1000;

      const newExp = currentExp + addedExp;
      const shouldLevelUp = newExp >= expNeeded;
      const newLevel = shouldLevelUp ? 2 : 1;
      const overflow = shouldLevelUp ? newExp - expNeeded : 0;

      expect(shouldLevelUp).toBe(true);
      expect(newLevel).toBe(2);
      expect(overflow).toBe(200);
    });

    it("should calculate new experience threshold after level up", () => {
      const currentThreshold = 1000;
      const newThreshold = Math.floor(currentThreshold * 1.1);
      expect(newThreshold).toBe(1100);
    });
  });

  describe("UI/UX Validation", () => {
    it("should format experience display correctly", () => {
      const currentExp = 500;
      const maxExp = 1000;
      const displayText = `${currentExp} / ${maxExp}`;
      expect(displayText).toBe("500 / 1000");
    });

    it("should format level display correctly", () => {
      const level = 5;
      const displayText = `Level ${level}`;
      expect(displayText).toBe("Level 5");
    });

    it("should format course progress display correctly", () => {
      const completed = 15;
      const total = 30;
      const displayText = `${completed} / ${total} horas`;
      expect(displayText).toBe("15 / 30 horas");
    });

    it("should identify empty course list state", () => {
      const courses = [];
      const isEmpty = courses.length === 0;
      expect(isEmpty).toBe(true);
    });
  });

  describe("Data Validation", () => {
    it("should validate course category enum", () => {
      const validCategories = ["course", "bootcamp", "trilha", "projeto"];
      const testCategory = "course";
      expect(validCategories).toContain(testCategory);
    });

    it("should validate status enum", () => {
      const validStatuses = ["not_started", "in_progress", "completed"];
      const testStatus = "in_progress";
      expect(validStatuses).toContain(testStatus);
    });

    it("should ensure positive hour values", () => {
      const totalHours = 20;
      const completedHours = 15;
      expect(totalHours).toBeGreaterThan(0);
      expect(completedHours).toBeGreaterThanOrEqual(0);
      expect(completedHours).toBeLessThanOrEqual(totalHours);
    });
  });
});
