// background.js - Service Worker mejorado con soporte AdminRobin
console.log('[Background] Script iniciado');

// Importar AdminRobin client
importScripts('adminrobin-client.js');

// Variables globales
let adminRobinInitialized = false;
let currentConfig = null;

// Función para inicializar AdminRobin Client
async function initializeAdminRobin() {
  chrome.storage.sync.get(['adminRobinUrl', 'authToken'], (result) => {
    const { adminRobinUrl, authToken } = result || {};
    if (adminRobinUrl) {
      console.log('[Background] Inicializando AdminRobin Client con URL:', adminRobinUrl);
      self.adminRobinClient.initialize(adminRobinUrl, authToken);
      adminRobinInitialized = true;
    } else {
      console.log('[Background] AdminRobin no configurado');
      adminRobinInitialized = false;
    }
  });
}

// Función para hacer peticiones HTTP a VoipMonitor
async function makeAPIRequest(apiUrl, user, password, task, params = {}) {
  try {
    const url = new URL(apiUrl);
    url.searchParams.append('task', task);
    url.searchParams.append('user', user);
    url.searchParams.append('password', password);
    url.searchParams.append('params', JSON.stringify(params));
    
    console.log('[VoipMonitor] Petición:', task);
    console.log('[VoipMonitor] URL completa:', url.toString());
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('[VoipMonitor] Respuesta:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    let data;
    try {
      const text = await response.text();
      console.log('[VoipMonitor] Respuesta recibida (primeros 200 chars):', text.substring(0, 200));
      
      // Verificar si la respuesta es HTML
      if (text.trim().startsWith('<')) {
        console.error('[VoipMonitor] La respuesta es HTML, no JSON');
        console.error('[VoipMonitor] Contenido completo:', text);
        throw new Error('La API devolvió HTML en lugar de JSON. Verifique la URL del API y las credenciales.');
      }
      
      data = JSON.parse(text);
      console.log('[VoipMonitor] JSON parseado exitosamente');
    } catch (parseError) {
      console.error('[VoipMonitor] Error parseando JSON:', parseError);
      throw new Error(`No se pudo parsear la respuesta como JSON: ${parseError.message}`);
    }
    
    return { success: true, data };
    
  } catch (error) {
    console.error('[VoipMonitor] Error en makeAPIRequest:', error);
    return { 
      success: false, 
      error: error.message,
      details: error.toString()
    };
  }
}

// Función para hacer peticiones HTTP directas
async function fetchData(url) {
  try {
    console.log('[VoipMonitor] Petición directa a:', url);
    console.log('[VoipMonitor] URL completa:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('[VoipMonitor] Respuesta directa:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    let data;
    try {
      const text = await response.text();
      console.log('[VoipMonitor] Respuesta directa recibida (primeros 500 chars):', text.substring(0, 500));
      console.log('[VoipMonitor] Tipo de contenido:', response.headers.get('content-type'));
      
      // Verificar si la respuesta es HTML
      if (text.trim().startsWith('<')) {
        console.error('[VoipMonitor] La respuesta es HTML, no JSON');
        console.error('[VoipMonitor] Contenido completo:', text);
        throw new Error('La API devolvió HTML en lugar de JSON. Verifique la URL del API y las credenciales.');
      }
      
      // Verificar si es un mensaje de error en texto plano
      if (!text.trim().startsWith('{') && !text.trim().startsWith('[')) {
        console.error('[VoipMonitor] La respuesta NO es JSON válido');
        console.error('[VoipMonitor] Respuesta completa:', text);
        throw new Error(`La API devolvió texto plano: ${text.substring(0, 100)}`);
      }
      
      data = JSON.parse(text);
      console.log('[VoipMonitor] JSON parseado exitosamente');
    } catch (parseError) {
      console.error('[VoipMonitor] Error parseando JSON:', parseError);
      if (parseError.message.includes('La API devolvió')) {
        throw parseError;
      }
      throw new Error(`No se pudo parsear la respuesta como JSON: ${parseError.message}`);
    }
    
    return { success: true, data };
    
  } catch (error) {
    console.error('[VoipMonitor] Error en fetchData:', error);
    return { 
      success: false, 
      error: error.message,
      details: error.toString()
    };
  }
}

// Listener principal para mensajes
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Background] Mensaje recibido:', message.action || message.task);
  
  // Manejar mensajes con formato 'action'
  if (message.action) {
    switch (message.action) {
      case 'fetchVoipData':
        fetchData(message.url)
          .then(result => {
            console.log('[Background] Resultado fetchVoipData:', result.success);
            sendResponse(result);
          })
          .catch(error => {
            console.error('[Background] Error en fetchVoipData:', error);
            sendResponse({ success: false, error: error.message });
          });
        break;
        
      case 'checkActiveCalls':
        fetchData(message.url)
          .then(result => {
            console.log('[Background] Resultado checkActiveCalls:', result.success);
            const hasActive = result.success && result.data && 
              ((result.data.rows && result.data.rows.length > 0) || 
               (result.data.calls && result.data.calls.length > 0) ||
               (Array.isArray(result.data) && result.data.length > 0));
            
            sendResponse({ 
              success: result.success, 
              hasActive: hasActive, 
              data: result.data 
            });
          })
          .catch(error => {
            console.error('[Background] Error en checkActiveCalls:', error);
            sendResponse({ success: false, error: error.message, hasActive: false });
          });
        break;
        
      case 'sendToAdminRobin':
        // Nuevo endpoint para enviar logs a AdminRobin
        (async () => {
          try {
            if (!adminRobinInitialized) {
              await initializeAdminRobin();
            }
            
            console.log('[Background] Enviando log a AdminRobin');
            const result = await self.adminRobinClient.sendLog(message.logData);
            
            if (result.success) {
              console.log('[Background] Log enviado exitosamente a AdminRobin');
              sendResponse({ success: true });
            } else if (result.queued) {
              console.log('[Background] Log agregado a cola para envío posterior');
              sendResponse({ success: true, queued: true });
            } else {
              console.log('[Background] Error enviando log a AdminRobin:', result.error);
              sendResponse({ success: false, error: result.error });
            }
          } catch (error) {
            console.error('[Background] Error en sendToAdminRobin:', error);
            sendResponse({ success: false, error: error.message });
          }
        })();
        break;
        
      case 'getPageConfig':
        // Nuevo endpoint para obtener configuración de página desde AdminRobin
        (async () => {
          try {
            if (!adminRobinInitialized) {
              await initializeAdminRobin();
            }
            
            console.log('[Background] Obteniendo configuración de página:', message.domain);
            const result = await self.adminRobinClient.getPageConfig(message.domain);
            
            if (result.success) {
              console.log('[Background] Configuración obtenida de AdminRobin');
              sendResponse({ success: true, config: result.config });
            } else {
              console.log('[Background] No hay configuración en AdminRobin para:', message.domain);
              sendResponse({ success: false, error: result.error });
            }
          } catch (error) {
            console.error('[Background] Error en getPageConfig:', error);
            sendResponse({ success: false, error: error.message });
          }
        })();
        break;
        
      case 'checkAdminRobinHealth':
        // Nuevo endpoint para verificar salud de AdminRobin
        (async () => {
          try {
            if (!adminRobinInitialized) {
              await initializeAdminRobin();
            }
            
            console.log('[Background] Verificando salud de AdminRobin');
            const isHealthy = await self.adminRobinClient.checkHealth();
            const stats = self.adminRobinClient.getStats();
            
            sendResponse({ 
              success: true, 
              isHealthy: isHealthy,
              stats: stats
            });
          } catch (error) {
            console.error('[Background] Error en checkAdminRobinHealth:', error);
            sendResponse({ success: false, error: error.message });
          }
        })();
        break;
        
      case 'getAdminRobinStats':
        // Nuevo endpoint para obtener estadísticas de AdminRobin
        try {
          if (adminRobinInitialized) {
            const stats = self.adminRobinClient.getStats();
            sendResponse({ success: true, stats: stats });
          } else {
            sendResponse({ 
              success: false, 
              error: 'AdminRobin no inicializado',
              stats: { isAvailable: false, pendingLogs: 0 }
            });
          }
        } catch (error) {
          console.error('[Background] Error en getAdminRobinStats:', error);
          sendResponse({ success: false, error: error.message });
        }
        break;
        
      default:
        console.warn('[Background] Acción no reconocida:', message.action);
        sendResponse({ success: false, error: `Acción no reconocida: ${message.action}` });
    }
    
    return true;
  }
  
  // Manejar mensajes con formato 'task' (formato original de VoipMonitor)
  const { task, apiUrl, user, password, sensorId } = message;
  
  if (!task) {
    sendResponse({ success: false, error: 'Parámetro task es requerido' });
    return;
  }
  
  if (!apiUrl || !user || !password) {
    sendResponse({ success: false, error: 'Configuración API incompleta' });
    return;
  }
  
  // Manejar diferentes tareas de VoipMonitor
  switch (task) {
    case 'listActiveCalls':
      makeAPIRequest(apiUrl, user, password, 'listActiveCalls', { sensorId })
        .then(result => {
          console.log('[Background] Resultado listActiveCalls:', result.success);
          sendResponse(result);
        })
        .catch(error => {
          console.error('[Background] Error en listActiveCalls:', error);
          sendResponse({ success: false, error: error.message });
        });
      break;
      
    case 'pauseCalls':
      makeAPIRequest(apiUrl, user, password, 'pauseCalls', { sensorId })
        .then(result => {
          console.log('[Background] Resultado pauseCalls:', result.success);
          sendResponse(result);
        })
        .catch(error => {
          console.error('[Background] Error en pauseCalls:', error);
          sendResponse({ success: false, error: error.message });
        });
      break;
      
    case 'resumeCalls':
      makeAPIRequest(apiUrl, user, password, 'resumeCalls', { sensorId })
        .then(result => {
          console.log('[Background] Resultado resumeCalls:', result.success);
          sendResponse(result);
        })
        .catch(error => {
          console.error('[Background] Error en resumeCalls:', error);
          sendResponse({ success: false, error: error.message });
        });
      break;
      
    case 'handleActiveCall':
      makeAPIRequest(apiUrl, user, password, 'handleActiveCall', { 
        sensorId: sensorId,
        command: message.command,
        callRef: message.callRef
      })
        .then(result => {
          console.log('[Background] Resultado handleActiveCall:', result.success);
          sendResponse(result);
        })
        .catch(error => {
          console.error('[Background] Error en handleActiveCall:', error);
          sendResponse({ success: false, error: error.message });
        });
      break;
      
    case 'initialize':
      console.log('[Background] Inicializando extensión');
      sendResponse({ success: true, message: 'Extensión inicializada correctamente' });
      break;
      
    default:
      console.warn('[Background] Tarea no reconocida:', task);
      sendResponse({ success: false, error: `Tarea no reconocida: ${task}` });
  }
  
  return true;
});

// Event listener para instalación
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Background] Extensión instalada/actualizada');
  initializeAdminRobin();
});

// Event listener para inicio de Chrome
chrome.runtime.onStartup.addListener(() => {
  console.log('[Background] Chrome iniciado - Background script activo');
  initializeAdminRobin();
});

// Listener para cambios en la configuración
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    if (changes.adminRobinUrl || changes.authToken) {
      console.log('[Background] Configuración de AdminRobin actualizada');
      initializeAdminRobin();
    }
  }
});

// Manejar errores no capturados
self.addEventListener('error', (event) => {
  console.error('[Background] Error no capturado:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[Background] Promesa rechazada:', event.reason);
});

// Inicializar AdminRobin al cargar
initializeAdminRobin();

console.log('[Background] Sistema completo inicializado');