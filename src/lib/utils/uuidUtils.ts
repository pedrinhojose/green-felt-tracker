import { v4 as uuidv4 } from 'uuid';

/**
 * Valida se uma string é um UUID válido
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sanitiza um ID removendo caracteres inválidos e validando formato
 */
export function sanitizeUUID(id: string): string | null {
  if (!id || typeof id !== 'string') {
    console.warn('sanitizeUUID: ID inválido ou vazio:', id);
    return null;
  }

  // Remove espaços e caracteres de quebra de linha
  const cleaned = id.trim().replace(/[\r\n\s]/g, '');
  
  // Verifica se há concatenação indevida (dois UUIDs juntos)
  if (cleaned.length > 36) {
    console.error('sanitizeUUID: ID muito longo, possível concatenação:', cleaned);
    // Tenta extrair o primeiro UUID válido
    const firstUUID = cleaned.substring(0, 36);
    if (isValidUUID(firstUUID)) {
      console.warn('sanitizeUUID: Usando primeiro UUID válido:', firstUUID);
      return firstUUID;
    }
    return null;
  }
  
  if (!isValidUUID(cleaned)) {
    console.error('sanitizeUUID: UUID inválido:', cleaned);
    return null;
  }
  
  return cleaned;
}

/**
 * Gera um novo UUID válido com validação adicional
 */
export function generateSafeUUID(): string {
  const newUUID = uuidv4();
  
  // Validação dupla para garantir que o UUID foi gerado corretamente
  if (!isValidUUID(newUUID)) {
    console.error('generateSafeUUID: UUID gerado inválido:', newUUID);
    throw new Error('Falha ao gerar UUID válido');
  }
  
  return newUUID;
}

/**
 * Valida parâmetros de query que devem ser UUIDs
 */
export function validateQueryParams(params: Record<string, any>): Record<string, string> {
  const validatedParams: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (value && typeof value === 'string') {
      const sanitized = sanitizeUUID(value);
      if (sanitized) {
        validatedParams[key] = sanitized;
      } else {
        console.warn(`validateQueryParams: Parâmetro ${key} inválido:`, value);
      }
    }
  }
  
  return validatedParams;
}

/**
 * Log detalhado para debugging de UUIDs
 */
export function debugUUID(uuid: string, context: string): void {
  console.log(`[UUID Debug - ${context}]`, {
    original: uuid,
    length: uuid?.length,
    isValid: isValidUUID(uuid),
    sanitized: sanitizeUUID(uuid),
    type: typeof uuid
  });
}