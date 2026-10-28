/**
 * V5 ID Single Sign-On (SSO) Client SDK
 * Holding V5 Apollo Sovereign SSO Integration
 */

export interface V5SsoUser {
  v5_id: string;
  email: string;
  name: string;
  role?: string;
  permissions?: string[];
  whatsapp?: string;
  authorized_app?: string;
}

export const V5_HOLDING_SSO_BASE_URL = 
  process.env.NEXT_PUBLIC_V5_SSO_URL || "https://v5apollo.com";

export class V5SsoClient {
  static getLoginUrl(clientId: string, redirectUri?: string, state?: string): string {
    const params = new URLSearchParams();
    params.set("client_id", clientId);
    if (redirectUri) params.set("redirect_uri", redirectUri);
    if (state) params.set("state", state);

    return `${V5_HOLDING_SSO_BASE_URL}/sso/login?${params.toString()}`;
  }

  static async exchangeGrantCode(grantCode: string, clientId: string): Promise<{ ok: boolean; user?: V5SsoUser; token?: string; error?: string }> {
    try {
      const res = await fetch(`${V5_HOLDING_SSO_BASE_URL}/api/v1/auth/sso/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "authorization_code",
          grant_code: grantCode,
          client_id: clientId
        })
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        return { ok: false, error: data.error || "Falha ao validar código SSO." };
      }

      return {
        ok: true,
        user: data.user,
        token: data.access_token
      };
    } catch (err: any) {
      return { ok: false, error: err.message || "Erro de conexão com V5 Holding SSO." };
    }
  }

  static async verifySession(token: string): Promise<{ ok: boolean; user?: V5SsoUser; error?: string }> {
    try {
      const res = await fetch(`${V5_HOLDING_SSO_BASE_URL}/api/v1/auth/sso/userinfo`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        return { ok: false, error: data.error || "Sessão inválida ou expirada." };
      }

      return {
        ok: true,
        user: {
          v5_id: data.sub,
          email: data.email,
          name: data.name,
          role: data.role,
          permissions: data.permissions,
          whatsapp: data.whatsapp,
          authorized_app: data.authorized_app
        }
      };
    } catch (err: any) {
      return { ok: false, error: err.message || "Erro ao verificar sessão SSO." };
    }
  }
}
