// content.js - Versión mejorada con detección fortalecida
// Variables de estado global para controlar el estado de la llamada y logging
let currentCallStatus = 'none'; // 'none' | 'active' | 'paused' | 'ended'
let callStartTime = null;
let pauseStartTime = null;
let totalPauseTime = 0;
let currentCallRef = null;
let visitedPages = new Set();
let pauseEvents = [];

// Variables para logging y envío a AdminRobin
let callLogData = {
  startTimestamp: null,
  endTimestamp: null,
  extension: null,
  operatorName: null,
  asesor: null,
  pageId: null
};

// CATALOGO DE PAGINAS PREDEFINIDAS (AMPLIADO)
const PAGE_CATALOG = {
  'volaris.com': {
    name: 'Volaris',
    id: null, // Se obtendrá de AdminRobin
    selectors: {
      cardNumber: [
        '[formcontrolname="cardNumber"]',
        'input[name*="card"]',
        'input[autocomplete="cc-number"]',
        '#cardNumber',
        'input[placeholder*="número"]',
        'input[placeholder*="tarjeta"]'
      ],
      cvv: [
        '[formcontrolname="cvv"]',
        '[formcontrolname="securityCode"]',
        'input[name*="cvv"]',
        'input[autocomplete="cc-csc"]',
        '#cvv',
        '#securityCode'
      ],
      expiry: [
        '[formcontrolname="expiryMonth"]',
        '[formcontrolname="expiryYear"]',
        'input[autocomplete="cc-exp"]',
        'input[autocomplete="cc-exp-month"]',
        'input[autocomplete="cc-exp-year"]'
      ],
      cardHolder: [
        '[formcontrolname="cardHolder"]',
        'input[autocomplete="cc-name"]',
        'input[name*="cardholder"]',
        'input[placeholder*="titular"]'
      ]
    }
  },
  'pricetravel.com': {
    name: 'PriceTravel',
    id: null,
    selectors: {
      cardNumber: [
        '[formcontrolname="cardNumber"]',
        'input[name*="card"]',
        'input[autocomplete="cc-number"]',
        '#cardNumber'
      ],
      cvv: [
        '[formcontrolname="cvv"]',
        '[formcontrolname="securityCode"]',
        'input[name*="cvv"]',
        '#cvv',
        '#securityCode',
        '#cardSecurityCode'
      ],
      expiry: [
        '[formcontrolname="expiryMonth"]',
        '[formcontrolname="expiryYear"]',
        'input[autocomplete="cc-exp"]'
      ],
      cardHolder: [
        '[formcontrolname="cardHolder"]',
        'input[autocomplete="cc-name"]'
      ]
    }
  },
  'e-pago.com.mx': {
    name: 'GetNet',
    id: null,
    selectors: {
      cardNumber: [
        'input[name*="card"]',
        'input[autocomplete="cc-number"]',
        '#cardNumber'
      ],
      cvv: [
        'input[name*="cvv"]',
        'input[name*="security"]',
        '#cvv',
        '#securityCode'
      ],
      expiry: [
        'input[autocomplete="cc-exp"]',
        'input[name*="expir"]'
      ],
      cardHolder: [
        'input[autocomplete="cc-name"]',
        'input[name*="holder"]'
      ]
    }
  },
  'vivaaerobus.com': {
    name: 'VivaAerobus',
    id: null,
    selectors: {
      cardNumber: [
        '[formcontrolname="cardNumber"]',
        'input[autocomplete="cc-number"]',
        '#cardNumber'
      ],
      cvv: [
        '[formcontrolname="cvv"]',
        'input[autocomplete="cc-csc"]',
        '#cvv'
      ],
      expiry: [
        '[formcontrolname="expiryMonth"]',
        '[formcontrolname="expiryYear"]',
        'input[autocomplete="cc-exp"]'
      ],
      cardHolder: [
        'input[autocomplete="cc-name"]'
      ]
    }
  },
  'aeromexico.com': {
    name: 'Aeromexico',
    id: null,
    selectors: {
      cardNumber: [
        'input[autocomplete="cc-number"]',
        'input[name*="card"]',
        '#cardNumber'
      ],
      cvv: [
        'input[autocomplete="cc-csc"]',
        'input[name*="cvv"]',
        '#cvv'
      ],
      expiry: [
        'input[autocomplete="cc-exp"]',
        'input[autocomplete="cc-exp-month"]',
        'input[autocomplete="cc-exp-year"]'
      ],
      cardHolder: [
        'input[autocomplete="cc-name"]'
      ]
    }
  },
  'priceres.com.mx': {
    name: 'PriceRes',
    id: null,
    selectors: {
      cardNumber: [
        'input[autocomplete="cc-number"]',
        'input[name*="card"]'
      ],
      cvv: [
        'input[autocomplete="cc-csc"]',
        'input[name*="cvv"]'
      ],
      expiry: [
        'input[autocomplete="cc-exp"]'
      ],
      cardHolder: [
        'input[autocomplete="cc-name"]'
      ]
    }
  },
  'hoteldo.com': {
    name: 'HotelDo',
    id: null,
    selectors: {
      cardNumber: [
        'input[autocomplete="cc-number"]',
        'input[name*="card"]'
      ],
      cvv: [
        'input[autocomplete="cc-csc"]',
        'input[name*="cvv"]'
      ],
      expiry: [
        'input[autocomplete="cc-exp"]'
      ],
      cardHolder: [
        'input[autocomplete="cc-name"]'
      ]
    }
  },
  'ticketmaster.com.mx': {
    name: 'TicketMaster MX',
    id: null,
    selectors: {
      cardNumber: [
        'input[autocomplete="cc-number"]',
        'input[name*="card"]'
      ],
      cvv: [
        'input[autocomplete="cc-csc"]',
        'input[name*="cvv"]'
      ],
      expiry: [
        'input[autocomplete="cc-exp"]'
      ],
      cardHolder: [
        'input[autocomplete="cc-name"]'
      ]
    }
  },
  'superboletos.com': {
    name: 'SuperBoletos',
    id: null,
    selectors: {
      cardNumber: [
        'input[autocomplete="cc-number"]',
        'input[name*="card"]'
      ],
      cvv: [
        'input[autocomplete="cc-csc"]',
        'input[name*="cvv"]'
      ],
      expiry: [
        'input[autocomplete="cc-exp"]'
      ],
      cardHolder: [
        'input[autocomplete="cc-name"]'
      ]
    }
  }
};

// Función para obtener configuración de la página actual
function getCurrentPageConfig() {
  const hostname = window.location.hostname.replace('www.', '');
  
  // Buscar coincidencia exacta
  for (const domain in PAGE_CATALOG) {
    if (hostname.includes(domain) || domain.includes(hostname)) {
      console.log('[CATALOG] Configuración encontrada para:', PAGE_CATALOG[domain].name);
      return PAGE_CATALOG[domain];
    }
  }
  
  console.log('[CATALOG] No hay configuración para:', hostname);
  return null;
}

// DETECCIÓN MEJORADA: Detectar por características del campo
function isCardNumberByCharacteristics(input) {
  // Número de tarjeta: 13-19 dígitos
  const hasCardLength = input.maxLength >= 13 && input.maxLength <= 23; // 19 + espacios
  const isNumericInput = input.type === 'tel' || input.type === 'number' || input.inputMode === 'numeric';
  const hasCardPattern = input.pattern && /[0-9\s\-]{13,19}/.test(input.pattern);
  
  return (hasCardLength || hasCardPattern) && isNumericInput;
}

function isCVVByCharacteristics(input) {
  // CVV: 3-4 dígitos
  const hasShortLength = input.maxLength >= 3 && input.maxLength <= 4;
  const isNumericInput = input.type === 'tel' || input.type === 'number' || input.inputMode === 'numeric';
  
  return hasShortLength && isNumericInput;
}

function isExpiryByCharacteristics(input) {
  // Fecha de expiración: formato MM/YY o MM/YYYY
  const hasExpiryLength = input.maxLength >= 4 && input.maxLength <= 7;
  const hasExpiryPattern = input.pattern && /[0-9\/\-]{4,7}/.test(input.pattern);
  const hasExpiryPlaceholder = input.placeholder && /mm\/yy|mm\/yyyy|expir/i.test(input.placeholder);
  
  return (hasExpiryLength || hasExpiryPattern || hasExpiryPlaceholder);
}

// DETECCIÓN MEJORADA: Detectar por atributos y keywords
function detectFieldType(input) {
  const attrs = [
    input.name,
    input.id,
    input.getAttribute("placeholder"),
    input.getAttribute("aria-label"),
    input.getAttribute("autocomplete"),
    input.getAttribute("data-testid"),
    input.className,
    input.getAttribute("formcontrolname")
  ].filter(Boolean).join(" ").toLowerCase();

  // Patrones para número de tarjeta
  const cardNumberPatterns = [
    /\b(card|credit|debit)[\s\-]*(number|num|no)\b/,
    /\bccnum\b/,
    /\bcreditcard\b/,
    /\btarjeta\b/,
    /\bnumero.*tarjeta\b/,
    /cc-number/
  ];

  // Patrones para CVV
  const cvvPatterns = [
    /\bcvv\b/,
    /\bcvc\b/,
    /\bcvv2\b/,
    /\bcid\b/,
    /\bcsv\b/,
    /\bcsc\b/,
    /\bsecurity.*code\b/,
    /\bverification.*code\b/,
    /\bcard.*code\b/,
    /\bcodigo.*seguridad\b/,
    /cc-csc/
  ];

  // Patrones para fecha de expiración
  const expiryPatterns = [
    /\bexpir/,
    /\bexp.*date\b/,
    /\bmm.*yy\b/,
    /\bvencimiento\b/,
    /\bcaducidad\b/,
    /cc-exp/
  ];

  // Patrones para nombre en tarjeta
  const cardHolderPatterns = [
    /\bcardholder\b/,
    /\bname.*card\b/,
    /\btitular\b/,
    /\bowner\b/,
    /cc-name/
  ];

  // Detectar tipo
  if (cardNumberPatterns.some(p => p.test(attrs)) || isCardNumberByCharacteristics(input)) {
    return 'cardNumber';
  }
  
  if (cvvPatterns.some(p => p.test(attrs)) || isCVVByCharacteristics(input)) {
    return 'cvv';
  }
  
  if (expiryPatterns.some(p => p.test(attrs)) || isExpiryByCharacteristics(input)) {
    return 'expiry';
  }
  
  if (cardHolderPatterns.some(p => p.test(attrs))) {
    return 'cardHolder';
  }

  return null;
}

// Patrones de exclusión (campos que NO son sensibles)
function shouldExcludeField(input) {
  const attrs = [
    input.name,
    input.id,
    input.className
  ].filter(Boolean).join(" ").toLowerCase();

  const excludePatterns = [
    /\bemail/,
    /\bpassword/,
    /\bsubscribe/,
    /\bgroup-id/,
    /\bssr/,
    /\bprice/,
    /\bservice/,
    /\bremove/,
    /\badd/,
    /\bfirst.*name/,
    /\blast.*name/,
    /\bfull.*name/,
    /\bphone/,
    /\baddress/,
    /\bcity/,
    /\bstate/,
    /\bzip/,
    /\bcountry/,
    /\bmat-input-\d+$/
  ];

  return excludePatterns.some(pattern => pattern.test(attrs));
}

// Función para detectar campos usando el catálogo de páginas
function detectCatalogFields() {
  const pageConfig = getCurrentPageConfig();
  if (!pageConfig) return [];
  
  const foundFields = [];
  
  // Buscar cada tipo de campo
  Object.entries(pageConfig.selectors).forEach(([fieldType, selectors]) => {
    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element && element.tagName === 'INPUT') {
            foundFields.push({
              element: element,
              fieldType: fieldType,
              selector: selector,
              siteName: pageConfig.name,
              pageId: pageConfig.id
            });
            console.log('[CATALOG] Campo', fieldType, 'encontrado en', pageConfig.name, ':', selector);
          }
        });
      } catch (error) {
        console.warn('[CATALOG] Error con selector', selector, ':', error);
      }
    });
  });
  
  return foundFields;
}

// Función para obtener contexto del campo
function getFieldContext(input) {
  let context = [];

  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) context.push(label.textContent);
  }

  if (input.placeholder) context.push(input.placeholder);

  let parent = input.parentElement;
  for (let i = 0; i < 3 && parent; i++) {
    const text = parent.textContent || '';
    if (text.length < 100) {
      context.push(text);
    }
    parent = parent.parentElement;
  }

  return context.join(' ').trim();
}

// Validación contextual mejorada
function isActualSensitiveField(input, detectedType) {
  const context = getFieldContext(input);
  
  const sensitiveKeywords = {
    cardNumber: [
      'número de tarjeta',
      'card number',
      'número tarjeta',
      'tarjeta de crédito',
      'credit card'
    ],
    cvv: [
      'cvv',
      'cvc',
      'código de seguridad',
      'security code',
      'código verificación'
    ],
    expiry: [
      'expiración',
      'expiration',
      'vencimiento',
      'caducidad',
      'válida hasta'
    ],
    cardHolder: [
      'titular',
      'cardholder',
      'nombre en la tarjeta',
      'name on card'
    ]
  };

  const keywords = sensitiveKeywords[detectedType] || [];
  const contextMatch = keywords.some(keyword =>
    context.toLowerCase().includes(keyword.toLowerCase())
  );

  console.log(`[VALIDATION] Campo "${input.name || input.id}" tipo "${detectedType}" - Context match: ${contextMatch}`);
  
  return contextMatch;
}

// Rastrear cambios de página
let currentPage = window.location.href;
visitedPages.add(currentPage);

setInterval(() => {
  if (window.location.href !== currentPage) {
    currentPage = window.location.href;
    visitedPages.add(currentPage);
    console.log('[PAGE TRACKING] Nueva página visitada:', currentPage);
  }
}, 1000);

// Helper para usar async/await con sendMessage
function sendMessageAsync(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

chrome.storage.sync.get(
  ["apiUrl", "user", "password", "sensorId", "extension", "pauseDuration", "adminRobinUrl", "operatorName", "asesor"],
  ({ apiUrl, user, password, sensorId, extension, pauseDuration, adminRobinUrl, operatorName, asesor }) => {
    let callRef = null;

    // DEBUG DE CONFIGURACIÓN
    function debugConfig() {
      console.log('[CONFIG] API URL:', apiUrl);
      console.log('[CONFIG] User:', user);
      console.log('[CONFIG] Password:', password ? '***' + password.slice(-3) : 'NOT SET');
      console.log('[CONFIG] Sensor ID:', sensorId);
      console.log('[CONFIG] Extension:', extension);
      console.log('[CONFIG] Pause Duration:', pauseDuration);
      console.log('[CONFIG] AdminRobin URL:', adminRobinUrl || 'NOT SET');
      console.log('[CONFIG] Operator Name:', operatorName || 'NOT SET');
      console.log('[CONFIG] Asesor:', asesor || 'NOT SET');
    }
    debugConfig();

    // FUNCIÓN PARA VERIFICAR LLAMADAS ACTIVAS
    async function checkActiveCalls() {
      const urlParams = new URLSearchParams({
        task: 'listActiveCalls',
        user: user,
        password: password,
        params: JSON.stringify({ sensorId: sensorId.toString() })
      });

      try {
        const response = await chrome.runtime.sendMessage({
          action: 'checkActiveCalls',
          url: `${apiUrl}?${urlParams.toString()}`,
        });

        if (response && response.success && response.hasActive) {
          if (currentCallStatus !== 'active') {
            console.log("[CALL STATUS] Llamada en curso");
            currentCallStatus = 'active';
            
            // Iniciar tracking si es nueva llamada
            if (!callStartTime) {
              callStartTime = Date.now();
              visitedPages.clear();
              visitedPages.add(window.location.href);
              pauseEvents = [];
              totalPauseTime = 0;
              
              // Capturar datos para AdminRobin
              callLogData.startTimestamp = new Date().toISOString();
              callLogData.extension = extension;
              callLogData.operatorName = operatorName;
              callLogData.asesor = asesor;
              
              const pageConfig = getCurrentPageConfig();
              if (pageConfig) {
                callLogData.pageId = pageConfig.id;
              }
              
              console.log('[CALL LOG] Datos iniciales capturados:', callLogData);
            }
          }
        } else {
          if (currentCallStatus !== 'ended') {
            console.log("[CALL STATUS] Llamada finalizada");
            
            // Generar y enviar log a AdminRobin
            if (callStartTime) {
              const totalDuration = Math.round((Date.now() - callStartTime) / 1000);
              
              callLogData.endTimestamp = new Date().toISOString();
              callLogData.callRef = currentCallRef || 'Unknown';
              callLogData.totalDuration = totalDuration;
              callLogData.pauseCount = pauseEvents.length;
              callLogData.totalPauseTime = totalPauseTime;
              callLogData.pages = Array.from(visitedPages);
              callLogData.pauseEvents = pauseEvents;
              
              console.log('[CALL LOG] Llamada finalizada, preparando envío:', callLogData);
              
              // Enviar a AdminRobin
              if (adminRobinUrl) {
                sendLogToAdminRobin(callLogData);
              } else {
                console.log('[CALL LOG] AdminRobin no configurado, log no enviado');
              }
              
              // Reset
              callStartTime = null;
              callLogData = {
                startTimestamp: null,
                endTimestamp: null,
                extension: null,
                operatorName: null,
                asesor: null,
                pageId: null
              };
            }
            
            currentCallStatus = 'ended';
          }
        }
      } catch (error) {
        console.error("[ERROR] checking active calls:", error);
      }
    }

    // FUNCIÓN PARA ENVIAR LOG A ADMINROBIN
    async function sendLogToAdminRobin(logData) {
      try {
        console.log('[AdminRobin] Enviando log...');
        
        const response = await sendMessageAsync({
          action: 'sendToAdminRobin',
          apiUrl: adminRobinUrl,
          logData: logData
        });
        
        if (response && response.success) {
          console.log('[AdminRobin] Log enviado exitosamente');
        } else {
          console.log('[AdminRobin] Error enviando log:', response.error);
        }
      } catch (error) {
        console.error('[AdminRobin] Error enviando log:', error);
      }
    }

    // Ejecución inicial
    (async () => {
      await checkActiveCalls();
    })();

    // LISTAR LLAMADAS ACTIVAS
    async function listActiveCalls() {
      console.log('[API] Listando llamadas activas...');

      try {
        const urlParams = new URLSearchParams({
          task: 'listActiveCalls',
          user: user,
          password: password,
          params: JSON.stringify({ sensorId: sensorId.toString() })
        });

        const response = await chrome.runtime.sendMessage({
          action: 'fetchVoipData',
          url: `${apiUrl}?${urlParams.toString()}`,
          method: 'GET'
        });

        if (response.success) {
          const calls = response.data.rows || response.data.calls || response.data.data || response.data || [];
          console.log('[API] Llamadas activas encontradas:', Array.isArray(calls) ? calls.length : 0);
          return Array.isArray(calls) ? calls : [];
        } else {
          console.log('[API] Error listando llamadas:', response.error);
          return [];
        }
      } catch (error) {
        console.log('[API] Error listando llamadas:', error.message);
        return [];
      }
    }

    // PAUSAR LLAMADA
    async function pauseCall(callRef) {
      console.log('[API] Pausando llamada...', callRef);

      try {
        const urlParams = new URLSearchParams({
          task: 'handleActiveCall',
          user: user,
          password: password,
          params: JSON.stringify({
            sensorId: sensorId.toString(),
            command: 'pausecall',
            callRef: callRef
          })
        });

        const response = await chrome.runtime.sendMessage({
          action: 'fetchVoipData',
          url: `${apiUrl}?${urlParams.toString()}`,
          method: 'GET'
        });

        if (response.success) {
          console.log('[API] Llamada pausada:', response.data);
          return response;
        } else {
          console.log('[API] Error pausando:', response.error);
        }
      } catch (error) {
        console.log('[API] Error pausando:', error.message);
      }
    }

    // REANUDAR LLAMADA
    async function unpauseCall(callRef) {
      console.log('[API] Reanudando llamada...', callRef);

      try {
        const urlParams = new URLSearchParams({
          task: 'handleActiveCall',
          user: user,
          password: password,
          params: JSON.stringify({
            sensorId: sensorId.toString(),
            command: 'unpausecall',
            callRef: callRef
          })
        });

        const response = await chrome.runtime.sendMessage({
          action: 'fetchVoipData',
          url: `${apiUrl}?${urlParams.toString()}`,
          method: 'GET'
        });

        if (response.success) {
          console.log('[API] Llamada reanudada:', response.data);
          return response;
        } else {
          console.log('[API] Error reanudando:', response.error);
        }
      } catch (error) {
        console.log('[API] Error reanudando:', error.message);
      }
    }

    // MANEJAR DETECCIÓN DE CAMPO SENSIBLE
    async function handleSensitiveFieldDetected(fieldInfo) {
      console.log('[SENSITIVE FIELD] Campo sensible detectado:', fieldInfo);
      const activeCalls = await listActiveCalls();
      console.log('[CALL MATCHING] Buscando llamada para extension:', extension);

      const matchedCall = activeCalls.find(call =>
        call.caller === extension || call.called === extension ||
        call.callernum === extension || call.callednum === extension ||
        call.from === extension || call.to === extension
      );

      if (matchedCall) {
        callRef = matchedCall.callreference || matchedCall.callref || matchedCall.id || matchedCall.call_id;
        currentCallRef = callRef;
        console.log("[CALL MATCHING] CallRef encontrado:", callRef);

        // Registrar inicio de pausa
        pauseStartTime = Date.now();
        const callElapsedMinutes = callStartTime ? Math.round((Date.now() - callStartTime) / 60000) : 0;

        await pauseCall(callRef);

        if (currentCallStatus !== 'paused') {
          console.log("[CALL STATUS] Llamada en pausa");
          currentCallStatus = 'paused';
        }

        console.log(`[AUTO-UNPAUSE] Programado en ${pauseDuration} segundos`);
        
        setTimeout(async () => {
          await unpauseCall(callRef);

          // Registrar evento de pausa
          if (pauseStartTime) {
            const pauseDurationActual = Math.round((Date.now() - pauseStartTime) / 1000);
            totalPauseTime += pauseDurationActual;
            
            pauseEvents.push({
              minute: callElapsedMinutes,
              duration: pauseDurationActual,
              page: window.location.href,
              fieldType: fieldInfo.fieldType,
              timestamp: new Date().toISOString()
            });
            
            console.log('[PAUSE EVENT] Evento de pausa registrado:', pauseEvents[pauseEvents.length - 1]);
            
            pauseStartTime = null;
          }

          // Verificar si la llamada sigue activa
          const calls = await listActiveCalls();
          const stillThere = calls.find(c =>
            c.callRef === callRef || c.callreference === callRef || c.id === callRef || c.call_id === callRef
          );

          if (stillThere) {
            console.log("[CALL STATUS] Llamada en curso");
            currentCallStatus = 'active';
          } else {
            console.log("[CALL STATUS] Llamada finalizada");
            currentCallStatus = 'ended';
            
            // Generar y enviar log
            if (callStartTime) {
              const totalDuration = Math.round((Date.now() - callStartTime) / 1000);
              
              callLogData.endTimestamp = new Date().toISOString();
              callLogData.callRef = currentCallRef || 'Unknown';
              callLogData.totalDuration = totalDuration;
              callLogData.pauseCount = pauseEvents.length;
              callLogData.totalPauseTime = totalPauseTime;
              callLogData.pages = Array.from(visitedPages);
              callLogData.pauseEvents = pauseEvents;
              
              if (adminRobinUrl) {
                sendLogToAdminRobin(callLogData);
              }
              
              callStartTime = null;
              callLogData = {
                startTimestamp: null,
                endTimestamp: null,
                extension: null,
                operatorName: null,
                asesor: null,
                pageId: null
              };
            }
          }
        }, (pauseDuration || 0) * 1000);
      } else {
        console.log('[CALL MATCHING] No se encontró llamada para extension:', extension);
        console.log('[CALL MATCHING] Llamadas disponibles:', activeCalls.map(c => ({
          caller: c.caller || c.callernum || c.from,
          called: c.called || c.callednum || c.to
        })));
      }
    }

    // SETUP DETECCIÓN MEJORADO
    function setupDetection() {
      console.log("[DETECTION] Iniciando sistema de detección...");

      const processedInputs = new WeakSet();

      function detectFields() {
        // PRIORIDAD 1: Catálogo de páginas
        const catalogFields = detectCatalogFields();
        let catalogFieldsProcessed = 0;
        
        catalogFields.forEach(fieldInfo => {
          if (!processedInputs.has(fieldInfo.element)) {
            catalogFieldsProcessed++;
            console.log('[CATALOG] Configurando campo', fieldInfo.fieldType, 'de', fieldInfo.siteName);
            
            processedInputs.add(fieldInfo.element);
            
            fieldInfo.element.addEventListener("focus", () => {
              console.log('[CATALOG] Campo enfocado:', fieldInfo.fieldType);
              handleSensitiveFieldDetected(fieldInfo);
            }, { once: false });
            
            fieldInfo.element.addEventListener("input", () => {
              console.log('[CATALOG] Input en campo:', fieldInfo.fieldType);
              handleSensitiveFieldDetected(fieldInfo);
            }, { once: true });
          }
        });
        
        if (catalogFieldsProcessed > 0) {
          console.log('[CATALOG]', catalogFieldsProcessed, 'campos configurados desde catálogo');
          return;
        }

        // PRIORIDAD 2: Detección genérica mejorada
        const inputs = document.querySelectorAll('input[type="text"], input[type="tel"], input[type="number"], input:not([type])');
        let genericFieldsFound = 0;

        inputs.forEach(input => {
          if (processedInputs.has(input)) {
            return;
          }

          const fieldName = input.name || input.id || 'unnamed';

          // Excluir campos que no son sensibles
          if (shouldExcludeField(input)) {
            return;
          }

          // Detectar tipo de campo
          const detectedType = detectFieldType(input);
          
          if (detectedType) {
            // Validar contexto
            const isValid = isActualSensitiveField(input, detectedType);
            
            if (isValid) {
              genericFieldsFound++;
              console.log("[DETECTION] Campo sensible confirmado:", fieldName, "tipo:", detectedType);

              processedInputs.add(input);

              const fieldInfo = {
                element: input,
                fieldType: detectedType,
                fieldName: fieldName,
                detectionMethod: 'generic'
              };

              input.addEventListener("focus", () => {
                console.log("[DETECTION] Campo enfocado:", fieldName, "tipo:", detectedType);
                handleSensitiveFieldDetected(fieldInfo);
              }, { once: false });

              input.addEventListener("input", () => {
                console.log("[DETECTION] Input en campo:", fieldName, "tipo:", detectedType);
                handleSensitiveFieldDetected(fieldInfo);
              }, { once: true });
            } else {
              console.log("[DETECTION] Campo descartado (contexto inválido):", fieldName);
            }
          }
        });

        if (genericFieldsFound > 0) {
          console.log(`[DETECTION] ${genericFieldsFound} campos sensibles detectados genéricamente`);
        } else {
          console.log("[DETECTION] No se detectaron campos sensibles en esta página");
        }
      }

      // Observador de mutaciones del DOM
      let detectTimeout = null;
      const observer = new MutationObserver((mutations) => {
        let shouldDetect = false;
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            for (let node of mutation.addedNodes) {
              if (node.nodeType === 1 && (node.tagName === 'INPUT' || (node.querySelector && node.querySelector('input')))) {
                shouldDetect = true;
                break;
              }
            }
          }
        });

        if (shouldDetect) {
          if (detectTimeout) {
            clearTimeout(detectTimeout);
          }
          detectTimeout = setTimeout(() => {
            console.log("[DETECTION] Campos dinámicos detectados, re-escaneando...");
            detectFields();
            detectTimeout = null;
          }, 300);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      // Observador de cambios de URL (SPAs)
      let lastUrl = location.href;
      let urlTimeout = null;
      const urlObserver = new MutationObserver(() => {
        if (location.href !== lastUrl) {
          console.log("[DETECTION] URL cambió de", lastUrl, "a", location.href);
          lastUrl = location.href;
          visitedPages.add(location.href);

          if (urlTimeout) {
            clearTimeout(urlTimeout);
          }
          urlTimeout = setTimeout(() => {
            console.log("[DETECTION] Re-escaneando después de cambio de URL...");
            detectFields();
            urlTimeout = null;
          }, 500);
        }
      });
      urlObserver.observe(document.body, { childList: true, subtree: true });

      // Detección inicial
      detectFields();
    }

    // REFRESH AUTOMÁTICO DEL ESTADO DE LLAMADAS
    setInterval(async () => {
      try {
        const calls = await listActiveCalls();
        if (calls.length === 0 && currentCallStatus !== 'ended' && currentCallStatus !== 'none') {
          console.log("[CALL STATUS] Llamada finalizada en refresh");
          
          // Generar y enviar log
          if (callStartTime) {
            const totalDuration = Math.round((Date.now() - callStartTime) / 1000);
            
            callLogData.endTimestamp = new Date().toISOString();
            callLogData.callRef = currentCallRef || 'Unknown';
            callLogData.totalDuration = totalDuration;
            callLogData.pauseCount = pauseEvents.length;
            callLogData.totalPauseTime = totalPauseTime;
            callLogData.pages = Array.from(visitedPages);
            callLogData.pauseEvents = pauseEvents;
            
            if (adminRobinUrl) {
              sendLogToAdminRobin(callLogData);
            }
            
            callStartTime = null;
            callLogData = {
              startTimestamp: null,
              endTimestamp: null,
              extension: null,
              operatorName: null,
              asesor: null,
              pageId: null
            };
          }
          
          currentCallStatus = 'ended';
        }
      } catch (err) {
        console.warn("[REFRESH ERROR] Error al refrescar llamadas:", err);
      }
    }, 10000);

    // INICIALIZACIÓN
    console.log("[INIT] VoipMonitor content script inicializado");
    setupDetection();
    console.log("[INIT] Sistema de detección activado");
    console.log("[INIT] AdminRobin:", adminRobinUrl ? "Configurado" : "No configurado");
  }
);