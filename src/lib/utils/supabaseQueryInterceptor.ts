import { sanitizeUUID, debugUUID } from './uuidUtils';

/**
 * Intercepta e sanitiza queries do Supabase para prevenir UUIDs concatenados
 */
export class SupabaseQueryInterceptor {
  
  /**
   * Sanitiza parâmetros de query antes de enviar para o Supabase
   */
  static sanitizeQueryParams(tableName: string, operation: string, params: Record<string, any>): Record<string, any> {
    console.log(`[QueryInterceptor] ${tableName}.${operation} - Params originais:`, params);
    
    const sanitizedParams: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(params)) {
      if (this.shouldSanitizeAsUUID(key, value)) {
        const sanitized = sanitizeUUID(value);
        if (sanitized) {
          sanitizedParams[key] = sanitized;
          if (sanitized !== value) {
            console.warn(`[QueryInterceptor] Sanitizado ${key}: "${value}" -> "${sanitized}"`);
          }
        } else {
          console.error(`[QueryInterceptor] UUID inválido removido - ${key}:`, value);
          continue;
        }
      } else {
        sanitizedParams[key] = value;
      }
    }
    
    console.log(`[QueryInterceptor] ${tableName}.${operation} - Params sanitizados:`, sanitizedParams);
    return sanitizedParams;
  }
  
  /**
   * Verifica se um campo deve ser tratado como UUID
   */
  private static shouldSanitizeAsUUID(key: string, value: any): boolean {
    if (typeof value !== 'string') return false;
    
    // Lista de campos que sabemos serem UUIDs
    const uuidFields = [
      'id', 'user_id', 'season_id', 'player_id', 'organization_id', 
      'public_share_token', 'gameId', 'seasonId', 'playerId'
    ];
    
    // Verifica se o campo está na lista ou termina com _id
    return uuidFields.includes(key) || key.endsWith('_id') || key.endsWith('Id');
  }
  
  /**
   * Log de debugging para queries problemáticas
   */
  static debugQuery(tableName: string, operation: string, originalParams: any, sanitizedParams: any): void {
    if (JSON.stringify(originalParams) !== JSON.stringify(sanitizedParams)) {
      console.group(`🔍 [QueryDebug] ${tableName}.${operation}`);
      console.log('Parâmetros originais:', originalParams);
      console.log('Parâmetros sanitizados:', sanitizedParams);
      console.log('Stack trace:', new Error().stack);
      console.groupEnd();
    }
  }
  
  /**
   * Valida resposta do Supabase para detectar problemas
   */
  static validateResponse(tableName: string, operation: string, response: any): void {
    if (response.error) {
      const errorMessage = response.error.message || '';
      
      // Detecta erro de UUID concatenado
      if (errorMessage.includes('invalid input syntax for type uuid') || 
          errorMessage.includes('concatenated')) {
        console.error(`🚨 [QueryError] UUID concatenado detectado em ${tableName}.${operation}:`, {
          error: response.error,
          message: errorMessage,
          stack: new Error().stack
        });
      }
    }
  }
}

/**
 * Wrapper para operações comuns do Supabase com sanitização automática
 */
export function createSafeSupabaseQuery(supabase: any) {
  return {
    /**
     * Select com sanitização de parâmetros
     */
    safeSelect: (tableName: string) => {
      return {
        select: (columns: string = '*') => {
          return {
            eq: (column: string, value: any) => {
              const sanitizedParams = SupabaseQueryInterceptor.sanitizeQueryParams(
                tableName, 
                'select.eq', 
                { [column]: value }
              );
              
              debugUUID(value, `safeSelect ${tableName}.${column}`);
              
              return supabase
                .from(tableName)
                .select(columns)
                .eq(column, sanitizedParams[column]);
            }
          };
        }
      };
    },
    
    /**
     * Update com sanitização de parâmetros
     */
    safeUpdate: (tableName: string, updateData: Record<string, any>) => {
      const sanitizedData = SupabaseQueryInterceptor.sanitizeQueryParams(
        tableName, 
        'update', 
        updateData
      );
      
      return {
        eq: (column: string, value: any) => {
          const sanitizedParams = SupabaseQueryInterceptor.sanitizeQueryParams(
            tableName, 
            'update.eq', 
            { [column]: value }
          );
          
          debugUUID(value, `safeUpdate ${tableName}.${column}`);
          
          return supabase
            .from(tableName)
            .update(sanitizedData)
            .eq(column, sanitizedParams[column]);
        }
      };
    }
  };
}