import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";
import axios from "axios";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // Dev Auth - Autenticação mock para desenvolvimento local
  app.get("/api/auth/dev", async (req: Request, res: Response) => {
    if (!ENV.useDevAuth) {
      res.status(403).json({ error: "Dev auth is disabled" });
      return;
    }

    try {
      const mockUser = {
        openId: `dev_user_123`,
        name: "Desenvolvedor",
        email: "dev@localhost",
        loginMethod: "dev",
      };

      // Criar token de sessão sem tentar salvar no banco
      const sessionToken = await sdk.createSessionToken(mockUser.openId, {
        name: mockUser.name,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      console.log("[Dev Auth] Setting cookie with options:", { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      console.log("[Dev Auth] Success - returning HTML with token in localStorage");
      // Para navegadores que não suportam cookies (como VS Code Simple Browser),
      // retornar HTML que define o token no localStorage e redireciona
      res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Login Success</title></head>
        <body>
          <script>
            // Salvar token no localStorage
            localStorage.setItem('${COOKIE_NAME}', '${sessionToken}');
            // Marcar que acabamos de fazer login para forçar refresh das queries
            sessionStorage.setItem('just_logged_in', 'true');
            // Forçar reload completo para garantir que o React Query use o novo token
            window.location.replace('/');
          </script>
          <p>Redirecting...</p>
        </body>
        </html>
      `);
    } catch (error) {
      console.error("[Dev Auth] Failed", error);
      res.status(500).json({ error: "Dev auth failed", details: String(error) });
    }
  });

  // Google OAuth login endpoint
  app.get("/api/auth/google", (req: Request, res: Response) => {
    if (ENV.useDevAuth) {
      // Redirecionar para dev auth se estiver em modo desenvolvimento
      res.redirect("/api/auth/dev");
      return;
    }

    const redirectUri = `${req.protocol}://${req.get("host")}/api/auth/google/callback`;
    const scope = encodeURIComponent("openid profile email");
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${ENV.googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
    
    res.redirect(googleAuthUrl);
  });

  // Google OAuth callback
  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");

    if (!code) {
      res.status(400).json({ error: "code is required" });
      return;
    }

    try {
      const redirectUri = `${req.protocol}://${req.get("host")}/api/auth/google/callback`;
      
      // Exchange code for tokens
      const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
        code,
        client_id: ENV.googleClientId,
        client_secret: ENV.googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      });

      const { access_token } = tokenResponse.data;

      // Get user info from Google
      const userInfoResponse = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const { id, email, name } = userInfoResponse.data;

      // Create user in database
      await db.upsertUser({
        openId: `google_${id}`,
        name: name || null,
        email: email ?? null,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      // Create session token
      const sessionToken = await sdk.createSessionToken(`google_${id}`, {
        name: name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[Google OAuth] Callback failed", error);
      res.status(500).json({ error: "Google OAuth callback failed" });
    }
  });

  // Manus OAuth callback (original)
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });

  // Debug endpoint: show session token contents (if any)
  app.get("/api/debug/session", async (req: Request, res: Response) => {
    try {
      const cookies = req.headers.cookie || "";
      // attempt to verify session
      const sessionCookie = (() => {
        const m = /(?:^|; )"?"?([\w-_]+=)[^;]*/.exec(cookies);
        // fallback: parse manually
        return null as unknown as string | undefined;
      })();

      // Use sdk.verifySession to decode cookie from header
      const cookieHeader = req.headers.cookie;
      let token: string | undefined;
      if (cookieHeader) {
        const pairs = cookieHeader.split("; ");
        for (const p of pairs) {
          const [k, v] = p.split("=");
          if (k === COOKIE_NAME) {
            token = v;
          }
        }
      }

      if (!token) {
        res.json({ loggedIn: false, reason: "no session cookie" });
        return;
      }

      const session = await sdk.verifySession(token);
      res.json({ loggedIn: !!session, session });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });
}
