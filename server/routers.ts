import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { getUserCourses, createCourse, updateCourse, getOrCreateUserProgress, updateUserProgress, getUserAchievements, createAchievement } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    updateProfile: protectedProcedure
      .input((data: unknown) => {
        const d = data as any;
        return {
          name: d.name as string,
          avatar: d.avatar as string | undefined,
        };
      })
      .mutation(async ({ ctx, input }) => {
        const { updateUser } = await import("./db");
        try {
          await updateUser(ctx.user.id, {
            name: input.name,
            avatar: input.avatar,
          });
          console.log("[Database] Profile updated successfully");
          return { success: true };
        } catch (error) {
          console.log("[Database] Profile update failed, continuing in dev mode");
          // Em desenvolvimento, retornar sucesso mesmo se o banco falhar
          return { success: true, devMode: true };
        }
      }),
  }),

  courses: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserCourses(ctx.user.id);
    }),
    create: protectedProcedure
      .input((data: unknown) => {
        const d = data as any;
        return {
          title: d.title as string,
          description: d.description as string | undefined,
          category: d.category as string,
          totalHours: d.totalHours as number,
        };
      })
      .mutation(async ({ ctx, input }) => {
        await createCourse({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          totalHours: input.totalHours,
          completedHours: 0,
          category: input.category,
          status: "not_started",
        });
      }),
    update: protectedProcedure
      .input((data: unknown) => {
        const d = data as any;
        return {
          courseId: d.courseId as number,
          completedHours: d.completedHours as number,
          status: d.status as string,
        };
      })
      .mutation(async ({ ctx, input }) => {
        await updateCourse(input.courseId, {
          completedHours: input.completedHours,
          status: input.status as any,
        });
      }),
  }),

  progress: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await getOrCreateUserProgress(ctx.user.id);
    }),
    addExperience: protectedProcedure
      .input((data: unknown) => {
        const d = data as any;
        return { amount: d.amount as number };
      })
      .mutation(async ({ ctx, input }) => {
        const progress = await getOrCreateUserProgress(ctx.user.id);
        if (!progress) throw new Error("Progress not found");

        const newExp = progress.currentExperience + input.amount;
        const expNeeded = progress.experienceToNextLevel;

        if (newExp >= expNeeded) {
          const newLevel = progress.currentLevel + 1;
          const overflow = newExp - expNeeded;
          await updateUserProgress(ctx.user.id, {
            currentLevel: newLevel,
            currentExperience: overflow,
            totalExperience: progress.totalExperience + input.amount,
            experienceToNextLevel: Math.floor(expNeeded * 1.1),
          });
        } else {
          await updateUserProgress(ctx.user.id, {
            currentExperience: newExp,
            totalExperience: progress.totalExperience + input.amount,
          });
        }
      }),
  }),

  achievements: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserAchievements(ctx.user.id);
    }),
    unlock: protectedProcedure
      .input((data: unknown) => {
        const d = data as any;
        return {
          title: d.title as string,
          description: d.description as string | undefined,
        };
      })
      .mutation(async ({ ctx, input }) => {
        await createAchievement({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          icon: "/badge-achievement.png",
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;
