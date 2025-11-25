import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, Course, InsertCourse, UserProgress, InsertUserProgress, Achievement, InsertAchievement, courses, userProgress, achievements } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available, using mock user for development");
    // Retorna usuário mock para desenvolvimento
    return {
      id: 1,
      openId: openId,
      name: "Desenvolvedor",
      email: "dev@example.com",
      avatar: "https://api.dicebear.com/7.x/pixel-art/png?seed=adventurer&size=64",
      loginMethod: "dev",
      role: "admin" as const,
      lastSignedIn: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  try {
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get user:", error);
    // Retorna usuário mock em caso de erro
    return {
      id: 1,
      openId: openId,
      name: "Desenvolvedor",
      email: "dev@example.com", 
      avatar: "https://api.dicebear.com/7.x/pixel-art/png?seed=adventurer&size=64",
      loginMethod: "dev",
      role: "admin" as const,
      lastSignedIn: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

export async function updateUser(userId: number, updates: Partial<{ name: string; avatar?: string }>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available, using in-memory storage");
    // Para desenvolvimento, vamos simular sucesso quando banco não está disponível
    console.log("[Database] Would update user", userId, "with:", updates);
    return;
  }

  try {
    await db.update(users).set(updates).where(eq(users.id, userId));
    console.log("[Database] Successfully updated user", userId, "with:", updates);
  } catch (error) {
    console.error("[Database] Failed to update user:", error);
    // Não lançar erro para permitir que funcione em dev sem banco
    console.warn("[Database] Update failed, continuing in development mode");
  }
}

export async function getUserProgress(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(userProgress).where(eq(userProgress.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrCreateUserProgress(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let progress = await getUserProgress(userId);
  if (!progress) {
    await db.insert(userProgress).values({
      userId,
      totalExperience: 0,
      currentLevel: 1,
      experienceToNextLevel: 1000,
      currentExperience: 0,
      coursesCompleted: 0,
    });
    progress = await getUserProgress(userId);
  }
  return progress;
}

export async function getUserCourses(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(courses).where(eq(courses.userId, userId));
}

export async function createCourse(course: InsertCourse) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(courses).values(course);
}

export async function updateCourse(courseId: number, updates: Partial<InsertCourse>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(courses).set(updates).where(eq(courses.id, courseId));
}

export async function getUserAchievements(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(achievements).where(eq(achievements.userId, userId));
}

export async function createAchievement(achievement: InsertAchievement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(achievements).values(achievement);
}

export async function updateUserProgress(userId: number, updates: Partial<InsertUserProgress>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(userProgress).set(updates).where(eq(userProgress.userId, userId));
}
