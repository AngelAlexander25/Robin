// adminrobin-client.js - Cliente para comunicación con AdminRobin API
console.log('[AdminRobin Client] Módulo cargado');

class AdminRobinClient {
  constructor() {
    this.pendingLogs = [];
    this.MAX_PENDING_LOGS = 100;
    this.RETRY_INTERVAL = 30000; // 30 segundos
    this.isAvailable = false;
    this.lastHealthCheck = null;
    this.retryTimer = null;
    this.apiUrl = null;
    this.authToken = null;
  }

  /**
   * Inicializa el cliente con la URL de AdminRobin
   */
  initialize(apiUrl, authToken = null) {
    this.apiUrl = apiUrl;
    this.authToken = authToken;
    console.log('[AdminRobin Client] Inicializado con URL:', apiUrl);
    
    // Verificar salud del servidor
    this.checkHealth();
    
    // Iniciar timer de reintentos
    this.startRetryTimer();
  }

  /**
   * Verifica la salud del servidor AdminRobin
   */
  async checkHealth() {
    if (!this.apiUrl) {
      console.log('[AdminRobin Client] No hay URL configurada');
      return false;
    }

    try {
      console.log('[AdminRobin Client] Verificando salud del servidor...');
      
      const response = await fetch(`${this.apiUrl}/api/Extension/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        console.log('[AdminRobin Client] Servidor disponible');
        this.isAvailable = true;
        this.lastHealthCheck = Date.now();
        
        // Si hay logs pendientes, intentar enviarlos
        if (this.pendingLogs.length > 0) {
          console.log('[AdminRobin Client] Procesando', this.pendingLogs.length, 'logs pendientes');
          await this.processPendingLogs();
        }
        
        return true;
      }
      
      console.log('[AdminRobin Client] Servidor respondió con error:', response.status);
      this.isAvailable = false;
      return false;
      
    } catch (error) {
      console.log('[AdminRobin Client] Servidor no disponible:', error.message);
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * Obtiene configuración de página desde AdminRobin
   */
  async getPageConfig(domain) {
    if (!this.apiUrl) {
      console.log('[AdminRobin Client] No hay URL configurada');
      return { success: false, error: 'No API URL configured' };
    }

    try {
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const url = `${this.apiUrl}/api/Extension/config?host=${encodeURIComponent(domain)}`;
      console.log('[AdminRobin Client] Obteniendo configuración para:', domain);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      if (response.ok) {
        const config = await response.json();
        console.log('[AdminRobin Client] Configuración obtenida:', config);
        return { success: true, config };
      }
      
      console.log('[AdminRobin Client] No hay configuración para:', domain, '- Status:', response.status);
      return { success: false, error: 'No config found' };
      
    } catch (error) {
      console.log('[AdminRobin Client] Error obteniendo configuración:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envía un log individual a AdminRobin
   */
  async sendLog(logData) {
    if (!this.apiUrl) {
      console.log('[AdminRobin Client] No hay URL configurada, log agregado a cola');
      this.addToPendingQueue(logData);
      return { success: false, error: 'No API URL configured', queued: true };
    }

    try {
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      // Transformar datos al formato esperado por AdminRobin
      const payload = this.transformLogData(logData);

      console.log('[AdminRobin Client] Enviando log:', payload);
      
      const response = await fetch(`${this.apiUrl}/api/Logs`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[AdminRobin Client] Log enviado exitosamente:', result);
        return { success: true, data: result };
      }
      
      console.log('[AdminRobin Client] Error enviando log - Status:', response.status);
      
      // Si falla, agregar a cola
      this.addToPendingQueue(logData);
      
      return { 
        success: false, 
        error: `HTTP ${response.status}`,
        queued: true 
      };
      
    } catch (error) {
      console.log('[AdminRobin Client] Error enviando log:', error.message);
      
      // Si falla, agregar a cola
      this.addToPendingQueue(logData);
      
      return { 
        success: false, 
        error: error.message,
        queued: true 
      };
    }
  }

  /**
   * Envía múltiples logs en batch
   */
  async sendLogsBatch(logsArray) {
    if (!this.apiUrl) {
      console.log('[AdminRobin Client] No hay URL configurada, logs agregados a cola');
      logsArray.forEach(log => this.addToPendingQueue(log));
      return { success: false, error: 'No API URL configured', queued: true };
    }

    try {
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      // Transformar todos los logs
      const payload = logsArray.map(log => this.transformLogData(log));

      console.log('[AdminRobin Client] Enviando batch de', payload.length, 'logs');
      
      const response = await fetch(`${this.apiUrl}/api/Extension/logs/batch`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[AdminRobin Client] Batch enviado exitosamente:', result);
        return { success: true, data: result };
      }
      
      console.log('[AdminRobin Client] Error enviando batch - Status:', response.status);
      
      // Si falla, agregar todos a cola
      logsArray.forEach(log => this.addToPendingQueue(log));
      
      return { 
        success: false, 
        error: `HTTP ${response.status}`,
        queued: true 
      };
      
    } catch (error) {
      console.log('[AdminRobin Client] Error enviando batch:', error.message);
      
      // Si falla, agregar todos a cola
      logsArray.forEach(log => this.addToPendingQueue(log));
      
      return { 
        success: false, 
        error: error.message,
        queued: true 
      };
    }
  }

  /**
   * Transforma los datos del log al formato esperado por AdminRobin
   */
  transformLogData(logData) {
    return {
      extension: logData.extension || null,
      asesor: logData.asesor || null,
      callRef: logData.callRef || null,
      idPages: logData.pageId || null,
      totalDuration: logData.totalDuration || 0,
      pauseCount: logData.pauseCount || 0,
      totalPauseTime: logData.totalPauseTime || 0,
      startTime: logData.startTimestamp || new Date().toISOString(),
      endTime: logData.endTimestamp || new Date().toISOString(),
      userAgent: logData.operatorName || null,
      actionTypeId: logData.actionTypeId || 1
    };
  }

  /**
   * Agrega un log a la cola de pendientes
   */
  addToPendingQueue(logData) {
    // Verificar límite de cola
    if (this.pendingLogs.length >= this.MAX_PENDING_LOGS) {
      console.log('[AdminRobin Client] Cola llena, eliminando log más antiguo');
      this.pendingLogs.shift();
    }
    
    this.pendingLogs.push({
      data: logData,
      timestamp: Date.now(),
      attempts: 0
    });
    
    console.log('[AdminRobin Client] Log agregado a cola. Total pendientes:', this.pendingLogs.length);
  }

  /**
   * Procesa logs pendientes
   */
  async processPendingLogs() {
    if (this.pendingLogs.length === 0) {
      return;
    }

    console.log('[AdminRobin Client] Procesando', this.pendingLogs.length, 'logs pendientes');
    
    // Intentar enviar en batch
    const logsToSend = this.pendingLogs.map(item => item.data);
    const result = await this.sendLogsBatch(logsToSend);
    
    if (result.success) {
      // Limpiar cola si se enviaron exitosamente
      console.log('[AdminRobin Client] Logs pendientes enviados exitosamente');
      this.pendingLogs = [];
    } else {
      // Incrementar intentos
      this.pendingLogs.forEach(item => {
        item.attempts++;
      });
      
      // Eliminar logs que han fallado demasiadas veces (más de 10 intentos)
      const before = this.pendingLogs.length;
      this.pendingLogs = this.pendingLogs.filter(item => item.attempts < 10);
      const removed = before - this.pendingLogs.length;
      
      if (removed > 0) {
        console.log('[AdminRobin Client] Eliminados', removed, 'logs después de múltiples fallos');
      }
    }
  }

  /**
   * Inicia el timer de reintentos
   */
  startRetryTimer() {
    if (this.retryTimer) {
      clearInterval(this.retryTimer);
    }
    
    this.retryTimer = setInterval(async () => {
      // Verificar salud cada intervalo
      await this.checkHealth();
    }, this.RETRY_INTERVAL);
    
    console.log('[AdminRobin Client] Timer de reintentos iniciado (cada', this.RETRY_INTERVAL / 1000, 'segundos)');
  }

  /**
   * Detiene el timer de reintentos
   */
  stopRetryTimer() {
    if (this.retryTimer) {
      clearInterval(this.retryTimer);
      this.retryTimer = null;
      console.log('[AdminRobin Client] Timer de reintentos detenido');
    }
  }

  /**
   * Obtiene estadísticas del cliente
   */
  getStats() {
    return {
      isAvailable: this.isAvailable,
      pendingLogs: this.pendingLogs.length,
      lastHealthCheck: this.lastHealthCheck,
      apiUrl: this.apiUrl,
      hasAuthToken: !!this.authToken
    };
  }

  /**
   * Limpia la cola de logs pendientes
   */
  clearPendingLogs() {
    const count = this.pendingLogs.length;
    this.pendingLogs = [];
    console.log('[AdminRobin Client] Cola limpiada,', count, 'logs eliminados');
  }
}

// Exportar instancia singleton
const adminRobinClient = new AdminRobinClient();

// Hacer disponible globalmente para el background script
if (typeof self !== 'undefined') {
  self.adminRobinClient = adminRobinClient;
}