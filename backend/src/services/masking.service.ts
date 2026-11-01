export function maskEmail(email: string): string {
    const [local, domain] = email.split("@");
    
    if (!local || !domain || email.split("@").length !== 2) {
        return "***";
    }

    const newLocal = local.slice(0, 1) + "*".repeat(3);
    const result = [newLocal, domain].join("@");
    return result;
}

export function maskName(name: string): string {
  return name
    .split(" ")
    .map((word) => word.slice(0, 1) + "***")
    .join(" ");
}

export function maskPhone(number: string): string{
    const cutPhone = number.replace(/\D/g, "").slice(-2);
    const result = "*".repeat(6) + cutPhone;
    return result;
}

export function maskIp(ip: string): string {
  const parts = ip.split(".");

  // Solo aceptamos IPv4: exactamente 4 partes
  if (parts.length !== 4) {
    return "***";
  }

  // Conservamos la red (3 primeras partes) y ocultamos el dispositivo
  return parts.slice(0, 3).join(".") + ".***";
}