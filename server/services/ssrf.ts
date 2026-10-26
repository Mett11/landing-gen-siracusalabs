/**
 * SSRF (Server-Side Request Forgery) Protection Utility
 * Strictly blocks private addresses, loopbacks, cloud metadata services, and non-http/https protocols.
 */

import dns from 'node:dns/promises';
import { URL } from 'node:url';

// Check if an IPv4 is within private/reserved ranges
export function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return false;
  }

  const [b0, b1] = parts;

  // 0.0.0.0/8 (Current network)
  if (b0 === 0) return true;

  // 10.0.0.0/8 (Private)
  if (b0 === 10) return true;

  // 127.0.0.0/8 (Loopback)
  if (b0 === 127) return true;

  // 169.254.0.0/16 (Link-local / Cloud metadata AWS/GCP/Azure)
  if (b0 === 169 && b1 === 254) return true;

  // 172.16.0.0/12 (Private 172.16 - 172.31)
  if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;

  // 192.168.0.0/16 (Private)
  if (b0 === 192 && b1 === 168) return true;

  // 100.64.0.0/10 (Shared carrier-grade NAT)
  if (b0 === 100 && b1 >= 64 && b1 <= 127) return true;

  // 224.0.0.0/4 (Multicast)
  if (b0 >= 224) return true;

  return false;
}

// Check if an IPv6 is private or link-local
export function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  // Loopback ::1
  if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;
  // Link-local fe80::/10
  if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) return true;
  // Unique local fc00::/7
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  // IPv4-mapped IPv6 (::ffff:127.0.0.1)
  if (normalized.includes('::ffff:')) {
    const ipv4Part = normalized.split('::ffff:')[1];
    return isPrivateIpv4(ipv4Part);
  }
  return false;
}

export interface SsrfValidationResult {
  valid: boolean;
  sanitizedUrl?: string;
  error?: string;
  resolvedIp?: string;
}

/**
 * Validates a target URL against SSRF attack vectors.
 */
export async function validateUrlForSsrf(targetUrl: string): Promise<SsrfValidationResult> {
  if (!targetUrl || typeof targetUrl !== 'string') {
    return { valid: false, error: 'URL vuoto o non valido' };
  }

  let parsed: URL;
  try {
    parsed = new URL(targetUrl.trim());
  } catch {
    return { valid: false, error: 'Sintassi URL non valida' };
  }

  // Enforce HTTP / HTTPS scheme only
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: `Protocollo non consentito: ${parsed.protocol}. Consentiti solo HTTP e HTTPS.` };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost aliases
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname === 'local' ||
    hostname === '0.0.0.0' ||
    hostname === '127.0.0.1' ||
    hostname === '::1'
  ) {
    return { valid: false, error: 'Accesso a localhost o host locale bloccato per sicurezza.' };
  }

  // Block internal metadata domains
  if (
    hostname === 'metadata.google.internal' ||
    hostname.endsWith('.metadata.google.internal') ||
    hostname === 'instance-data'
  ) {
    return { valid: false, error: 'Accesso a endpoint di metadati cloud bloccato per sicurezza.' };
  }

  // Check direct IP address input
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    if (isPrivateIpv4(hostname)) {
      return { valid: false, error: `Indirizzo IP privato/riservato bloccato: ${hostname}` };
    }
    return { valid: true, sanitizedUrl: parsed.toString(), resolvedIp: hostname };
  }

  // Resolve DNS to verify resolved destination IP
  try {
    const lookup = await dns.lookup(hostname, { all: true });
    if (!lookup || lookup.length === 0) {
      return { valid: false, error: `Impossibile risolvere il dominio DNS: ${hostname}` };
    }

    for (const record of lookup) {
      if (record.family === 4 && isPrivateIpv4(record.address)) {
        return { valid: false, error: `Il dominio ${hostname} punta a un IP privato bloccato: ${record.address}` };
      }
      if (record.family === 6 && isPrivateIpv6(record.address)) {
        return { valid: false, error: `Il dominio ${hostname} punta a un indirizzo IPv6 privato bloccato: ${record.address}` };
      }
    }

    return {
      valid: true,
      sanitizedUrl: parsed.toString(),
      resolvedIp: lookup[0].address,
    };
  } catch (err: any) {
    return { valid: false, error: `Errore nella risoluzione DNS: ${err.message}` };
  }
}
