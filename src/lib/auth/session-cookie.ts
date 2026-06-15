/**
 * Nome do cookie de sessão. Em produção usa o prefixo `__Host-`, que exige
 * Secure + Path=/ + sem Domain — garantindo que o cookie só seja enviado por
 * HTTPS para a origem exata (proteção contra fixação/subdomínio). Em dev (http)
 * o prefixo `__Host-` é incompatível, então usamos o nome simples.
 *
 * Sem `server-only`: também é consumido pelo `proxy.ts` (middleware).
 */
export function getSessionCookieName(): string {
  return process.env.NODE_ENV === "production" ? "__Host-finia_session" : "finia_session";
}
