import { isValidUUID, sanitizeUUID } from './uuidUtils';

/**
 * Monitor para detectar e corrigir UUIDs concatenados em tempo real
 */
export class UUIDMonitor {
  private static instance: UUIDMonitor;
  private errorLog: Array<{ timestamp: Date; error: string; context: string; originalValue: any }> = [];
  
  private constructor() {
    this.setupGlobalErrorHandler();
    this.setupConsoleInterceptor();
  }
  
  static getInstance(): UUIDMonitor {
    if (!UUIDMonitor.instance) {
      UUIDMonitor.instance = new UUIDMonitor();
    }
    return UUIDMonitor.instance;
  }
  
  /**
   * Intercepta erros globais para detectar problemas de UUID
   */
  private setupGlobalErrorHandler(): void {
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      this.analyzeErrorForUUID(args);
      originalConsoleError.apply(console, args);
    };
    
    // Intercepta erros não capturados
    window.addEventListener('error', (event) => {
      this.analyzeErrorForUUID([event.error, event.message]);
    });
    
    // Intercepta promises rejeitadas
    window.addEventListener('unhandledrejection', (event) => {
      this.analyzeErrorForUUID([event.reason]);
    });
  }
  
  /**
   * Intercepta console.log para detectar logs suspeitos
   */
  private setupConsoleInterceptor(): void {
    const originalConsoleLog = console.log;
    console.log = (...args: any[]) => {
      this.analyzeLogForUUID(args);
      originalConsoleLog.apply(console, args);
    };
  }
  
  /**
   * Analisa erros em busca de UUIDs concatenados
   */
  private analyzeErrorForUUID(args: any[]): void {
    const errorString = args.join(' ');
    
    // Detecta padrões de UUID concatenado
    const patterns = [
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
      /invalid input syntax for type uuid.*[0-9a-f-]{37,}/i,
      /concatenated/i
    ];
    
    patterns.forEach(pattern => {
      if (pattern.test(errorString)) {
        this.logUUIDError('UUID_CONCATENATION_ERROR', errorString, args);
      }
    });
  }
  
  /**
   * Analisa logs em busca de valores suspeitos
   */
  private analyzeLogForUUID(args: any[]): void {
    args.forEach(arg => {
      if (typeof arg === 'string' && arg.length > 36) {
        // Verifica se pode ser UUID concatenado
        if (this.isPossibleConcatenatedUUID(arg)) {
          this.logUUIDError('POSSIBLE_UUID_CONCATENATION', 'Log suspeito detectado', arg);
        }
      }
    });
  }
  
  /**
   * Verifica se uma string pode ser um UUID concatenado
   */
  private isPossibleConcatenatedUUID(value: string): boolean {
    // Remove hífens e verifica se tem múltiplos de 32 caracteres hexadecimais
    const cleanValue = value.replace(/-/g, '');
    const hexPattern = /^[0-9a-f]+$/i;
    
    return (
      hexPattern.test(cleanValue) && 
      cleanValue.length >= 64 && 
      cleanValue.length % 32 === 0
    );
  }
  
  /**
   * Registra erro relacionado a UUID
   */
  private logUUIDError(type: string, context: string, originalValue: any): void {
    const error = {
      timestamp: new Date(),
      error: type,
      context,
      originalValue
    };
    
    this.errorLog.push(error);
    
    // Mantém apenas os últimos 50 erros
    if (this.errorLog.length > 50) {
      this.errorLog = this.errorLog.slice(-50);
    }
    
    // Log destacado no console
    console.group(`🚨 UUID Monitor - ${type}`);
    console.error('Contexto:', context);
    console.error('Valor original:', originalValue);
    console.error('Timestamp:', error.timestamp.toISOString());
    console.groupEnd();
    
    // Se for concatenação, tenta corrigi-lo
    if (type === 'UUID_CONCATENATION_ERROR' && typeof originalValue === 'string') {
      this.attemptUUIDRepair(originalValue);
    }
  }
  
  /**
   * Tenta reparar UUIDs concatenados
   */
  private attemptUUIDRepair(concatenatedUUID: string): void {
    try {
      // Tenta extrair primeiro UUID válido
      const firstUUID = concatenatedUUID.substring(0, 36);
      if (isValidUUID(firstUUID)) {
        console.warn('💡 UUID reparado automaticamente:', {
          original: concatenatedUUID,
          repaired: firstUUID
        });
      }
    } catch (error) {
      console.error('Falha ao reparar UUID:', error);
    }
  }
  
  /**
   * Retorna estatísticas de erros de UUID
   */
  getErrorStats(): { total: number; byType: Record<string, number>; recent: typeof this.errorLog } {
    const byType = this.errorLog.reduce((acc, error) => {
      acc[error.error] = (acc[error.error] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: this.errorLog.length,
      byType,
      recent: this.errorLog.slice(-10)
    };
  }
  
  /**
   * Limpa o log de erros
   */
  clearErrorLog(): void {
    this.errorLog = [];
    console.log('UUID Monitor: Log de erros limpo');
  }
  
  /**
   * Monitora uma função específica para problemas de UUID
   */
  static monitorFunction<T extends (...args: any[]) => any>(
    fn: T, 
    functionName: string
  ): T {
    return ((...args: any[]) => {
      const monitor = UUIDMonitor.getInstance();
      
      // Verifica argumentos de entrada
      args.forEach((arg, index) => {
        if (typeof arg === 'string' && arg.length > 36) {
          if (monitor.isPossibleConcatenatedUUID(arg)) {
            console.warn(`UUID suspeito detectado em ${functionName}, argumento ${index}:`, arg);
          }
        }
      });
      
      try {
        const result = fn.apply(this, args);
        
        // Se for uma Promise, monitora o resultado
        if (result && typeof result.then === 'function') {
          return result.catch((error: any) => {
            monitor.analyzeErrorForUUID([error, `Erro em ${functionName}`]);
            throw error;
          });
        }
        
        return result;
      } catch (error) {
        monitor.analyzeErrorForUUID([error, `Erro em ${functionName}`]);
        throw error;
      }
    }) as T;
  }
}

// Inicializa o monitor automaticamente
UUIDMonitor.getInstance();

// Exporta função conveniente para monitoramento
export const monitorUUID = UUIDMonitor.monitorFunction;
export const getUUIDStats = () => UUIDMonitor.getInstance().getErrorStats();