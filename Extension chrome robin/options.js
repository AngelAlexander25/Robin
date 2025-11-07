// options.js - Gestión de configuración simplificada

let isAdminMode = false;

// Verificar estados de conexión al cargar
document.addEventListener('DOMContentLoaded', () => {
  checkConnectionStatuses();
  loadConfig();
});

// Verificar estado de conexiones
async function checkConnectionStatuses() {
  // Verificar VoipMonitor
  chrome.storage.sync.get(['apiUrl', 'user', 'password', 'sensorId'], async (result) => {
    const { apiUrl, user, password, sensorId } = result || {};
    const voipStatusIndicator = document.getElementById('voipStatus');
    const voipStatusText = document.getElementById('voipStatusText');
    
    if (!apiUrl || !user || !password) {
      voipStatusIndicator.className = 'status-indicator status-disconnected';
      voipStatusText.textContent = 'No configurado';
      return;
    }
    
    try {
      const urlParams = new URLSearchParams({
        task: 'listActiveCalls',
        user: user,
        password: password,
        params: JSON.stringify({ sensorId: sensorId || '' })
      });
      
      const response = await fetch(`${apiUrl}?${urlParams.toString()}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        voipStatusIndicator.className = 'status-indicator status-connected';
        voipStatusText.textContent = 'Conectado';
      } else {
        voipStatusIndicator.className = 'status-indicator status-disconnected';
        voipStatusText.textContent = 'Error de conexión';
      }
    } catch (error) {
      voipStatusIndicator.className = 'status-indicator status-disconnected';
      voipStatusText.textContent = 'Desconectado';
    }
  });
  
  // Verificar AdminRobin - COMENTADO TEMPORALMENTE
  /*
  chrome.storage.sync.get(['adminRobinUrl'], async (result) => {
    const { adminRobinUrl } = result || {};
    const adminStatusIndicator = document.getElementById('adminStatus');
    const adminStatusText = document.getElementById('adminStatusText');
    
    if (!adminRobinUrl) {
      adminStatusIndicator.className = 'status-indicator status-disconnected';
      adminStatusText.textContent = 'No configurado';
      return;
    }
    
    try {
      const response = await fetch(`${adminRobinUrl}/api/Extension/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        adminStatusIndicator.className = 'status-indicator status-connected';
        adminStatusText.textContent = 'Conectado';
      } else {
        adminStatusIndicator.className = 'status-indicator status-disconnected';
        adminStatusText.textContent = 'Error de conexión';
      }
    } catch (error) {
      adminStatusIndicator.className = 'status-indicator status-disconnected';
      adminStatusText.textContent = 'Desconectado';
    }
  });
  */
  
  // Marcar AdminRobin como no configurado por defecto
  const adminStatusIndicator = document.getElementById('adminStatus');
  const adminStatusText = document.getElementById('adminStatusText');
  if (adminStatusIndicator && adminStatusText) {
    adminStatusIndicator.className = 'status-indicator status-disconnected';
    adminStatusText.textContent = 'No configurado';
  }
}

// Cargar configuración
function loadConfig() {
  chrome.storage.sync.get(
    ['apiUrl', 'user', 'password', 'sensorId', 'adminRobinUrl', 'extension', 'operatorName', 'asesor', 'pauseDuration'],
    (data) => {
      // Campos de operador (siempre visibles)
      document.getElementById('extension').value = data.extension || '';
      document.getElementById('operatorName').value = data.operatorName || '';
      document.getElementById('asesor').value = data.asesor || '';
      document.getElementById('pauseDuration').value = data.pauseDuration || 10;
      
      // Campos admin (solo se cargan si se accede a modo admin)
      if (isAdminMode) {
        document.getElementById('apiUrl').value = data.apiUrl || '';
        document.getElementById('user').value = data.user || '';
        document.getElementById('password').value = data.password || '';
        document.getElementById('sensorId').value = data.sensorId || '';
        document.getElementById('adminRobinUrl').value = data.adminRobinUrl || '';
      }
    }
  );
}

// Guardar configuración de usuario
document.getElementById('save').addEventListener('click', () => {
  const settings = {
    extension: document.getElementById('extension').value.trim(),
    operatorName: document.getElementById('operatorName').value.trim(),
    asesor: document.getElementById('asesor').value.trim(),
    pauseDuration: parseInt(document.getElementById('pauseDuration').value, 10) || 10
  };
  
  // Validar que extension no esté vacía
  if (!settings.extension) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = 'La Extension es requerida';
    errorMessage.style.display = 'block';
    setTimeout(() => {
      errorMessage.style.display = 'none';
    }, 3000);
    return;
  }
  
  chrome.storage.sync.set(settings, () => {
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.style.display = 'none';
    successMessage.style.display = 'block';
    
    setTimeout(() => {
      successMessage.style.display = 'none';
    }, 3000);
    
    console.log('[Options] Configuración de usuario guardada:', settings);
  });
});

// Mostrar configuración admin (con validación de contraseña)
document.getElementById('showAdminConfig').addEventListener('click', () => {
  chrome.storage.sync.get(['password'], ({ password }) => {
    if (!password) {
      alert('No hay configuración administrativa. Contacte al administrador del sistema.');
      return;
    }
    
    const inputPassword = prompt('Ingrese contraseña administrativa:');
    
    if (inputPassword === null) {
      return; // Usuario canceló
    }
    
    if (inputPassword === password) {
      // Contraseña correcta - activar modo admin
      isAdminMode = true;
      activateAdminMode();
      loadConfig(); // Recargar para llenar campos admin
      console.log('[Options] Acceso admin concedido');
    } else {
      alert('Contraseña incorrecta');
      console.log('[Options] Acceso admin denegado');
    }
  });
});

// Activar modo admin
function activateAdminMode() {
  // Mostrar campos admin
  document.getElementById('adminBanner').style.display = 'block';
  document.getElementById('adminFields').style.display = 'block';
  
  // Cambiar botones
  document.getElementById('userButtons').style.display = 'none';
  document.getElementById('adminButtons').style.display = 'flex';
  
  // Ocultar botón de admin y divisor
  document.getElementById('showAdminConfig').style.display = 'none';
  document.getElementById('divider').style.display = 'none';
}

// Volver a vista de usuario
document.getElementById('backToUser').addEventListener('click', () => {
  isAdminMode = false;
  deactivateAdminMode();
  loadConfig();
  checkConnectionStatuses();
  console.log('[Options] Vuelto a vista usuario');
});

// Desactivar modo admin
function deactivateAdminMode() {
  // Ocultar campos admin
  document.getElementById('adminBanner').style.display = 'none';
  document.getElementById('adminFields').style.display = 'none';
  
  // Cambiar botones
  document.getElementById('userButtons').style.display = 'flex';
  document.getElementById('adminButtons').style.display = 'none';
  
  // Mostrar botón de admin y divisor
  document.getElementById('showAdminConfig').style.display = 'block';
  document.getElementById('divider').style.display = 'block';
}

// Guardar configuración admin completa
document.getElementById('saveAdmin').addEventListener('click', () => {
  const settings = {
    // VoipMonitor
    apiUrl: document.getElementById('apiUrl').value.trim(),
    user: document.getElementById('user').value.trim(),
    password: document.getElementById('password').value.trim(),
    sensorId: document.getElementById('sensorId').value.trim(),
    
    // AdminRobin
    adminRobinUrl: document.getElementById('adminRobinUrl').value.trim(),
    
    // Operador (mismos campos)
    extension: document.getElementById('extension').value.trim(),
    operatorName: document.getElementById('operatorName').value.trim(),
    asesor: document.getElementById('asesor').value.trim(),
    pauseDuration: parseInt(document.getElementById('pauseDuration').value, 10)
  };
  
  // Validar campos requeridos
  if (!settings.apiUrl || !settings.user || !settings.password || !settings.extension) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = 'Por favor complete los campos requeridos: API URL, User, Password y Extension';
    errorMessage.style.display = 'block';
    setTimeout(() => {
      errorMessage.style.display = 'none';
    }, 5000);
    return;
  }
  
  chrome.storage.sync.set(settings, () => {
    const successMessage = document.getElementById('successMessage');
    successMessage.style.display = 'block';
    setTimeout(() => {
      successMessage.style.display = 'none';
    }, 3000);
    
    console.log('[Options] Configuración administrativa guardada');
    
    // Recargar estados de conexión
    setTimeout(() => {
      checkConnectionStatuses();
    }, 500);
  });
});