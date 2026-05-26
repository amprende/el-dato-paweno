// ============================================================
// AUTH.JS - Protección del Panel de Administración
// Usa Supabase Auth: solo correos autorizados pueden entrar
// ============================================================

(async function() {
  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    await new Promise(r => document.addEventListener('DOMContentLoaded', r));
  }

  // Esperar a que Supabase esté disponible
  let attempts = 0;
  while ((!window.supabaseClient) && attempts < 20) {
    await new Promise(r => setTimeout(r, 150));
    attempts++;
  }

  if (!window.supabaseClient) {
    console.error('Auth: Supabase no disponible');
    showLoginOverlay('Error al conectar con el servidor de autenticación.');
    return;
  }

  const client = window.supabaseClient;

  // Verificar si ya hay sesión activa
  const { data: { session } } = await client.auth.getSession();

  if (session) {
    // Ya está logueado → mostrar panel
    showAdminPanel();
  } else {
    // No tiene sesión → mostrar login
    showLoginOverlay();
  }

  // Escuchar cambios de sesión
  client.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      showAdminPanel();
    } else if (event === 'SIGNED_OUT') {
      showLoginOverlay();
    }
  });

  // ─── MOSTRAR PANEL ───────────────────────────────────────
  function showAdminPanel() {
    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.remove();
    document.body.classList.remove('auth-locked');
  }

  // ─── MOSTRAR LOGIN OVERLAY ────────────────────────────────
  function showLoginOverlay(errorMsg = '') {
    document.body.classList.add('auth-locked');

    // Evitar duplicados
    if (document.getElementById('login-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'login-overlay';
    overlay.innerHTML = `
      <div class="login-card">
        <div class="login-logo">
          <img src="img/logo_frames/frame_1.png" alt="Logo" style="height:70px; mix-blend-mode:multiply;">
        </div>
        <h2 class="login-title">Panel de Administración</h2>
        <p class="login-subtitle">Ingresa tus credenciales para continuar</p>

        <div class="login-form">
          <div class="login-field">
            <label for="auth-email">Correo electrónico</label>
            <input type="email" id="auth-email" placeholder="tu@correo.com" autocomplete="email">
          </div>
          <div class="login-field">
            <label for="auth-password">Contraseña</label>
            <div style="position:relative;">
              <input type="password" id="auth-password" placeholder="••••••••" autocomplete="current-password">
              <button type="button" id="toggle-pw" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#6b7280;">
                <span class="material-icons" style="font-size:20px;">visibility</span>
              </button>
            </div>
          </div>

          <p id="auth-error" class="login-error" style="display:${errorMsg ? 'block' : 'none'}">${errorMsg}</p>

          <button id="auth-submit" class="login-btn" onclick="handleLogin()">
            <span id="auth-btn-text">Ingresar</span>
            <span id="auth-spinner" style="display:none;" class="material-icons spin">refresh</span>
          </button>
        </div>

        <p class="login-footer">¿No tienes acceso? Contacta al administrador.</p>
      </div>
    `;

    document.body.appendChild(overlay);

    // Mostrar/ocultar contraseña
    document.getElementById('toggle-pw').addEventListener('click', () => {
      const pw = document.getElementById('auth-password');
      const icon = document.querySelector('#toggle-pw .material-icons');
      if (pw.type === 'password') {
        pw.type = 'text';
        icon.textContent = 'visibility_off';
      } else {
        pw.type = 'password';
        icon.textContent = 'visibility';
      }
    });

    // Enter para login
    ['auth-email', 'auth-password'].forEach(id => {
      document.getElementById(id).addEventListener('keydown', e => {
        if (e.key === 'Enter') handleLogin();
      });
    });
  }

  // ─── MANEJAR LOGIN ────────────────────────────────────────
  window.handleLogin = async function() {
    const email    = document.getElementById('auth-email')?.value?.trim();
    const password = document.getElementById('auth-password')?.value;
    const errorEl  = document.getElementById('auth-error');
    const spinner  = document.getElementById('auth-spinner');
    const btnText  = document.getElementById('auth-btn-text');
    const btn      = document.getElementById('auth-submit');

    if (!email || !password) {
      errorEl.textContent = 'Por favor completa todos los campos.';
      errorEl.style.display = 'block';
      return;
    }

    // Loading state
    btn.disabled = true;
    spinner.style.display = 'inline-block';
    btnText.textContent = 'Verificando...';
    errorEl.style.display = 'none';

    const { error } = await client.auth.signInWithPassword({ email, password });

    btn.disabled = false;
    spinner.style.display = 'none';
    btnText.textContent = 'Ingresar';

    if (error) {
      let msg = 'Correo o contraseña incorrectos.';
      if (error.message?.includes('Email not confirmed')) {
        msg = 'Debes confirmar tu correo antes de ingresar.';
      } else if (error.message?.includes('Invalid login')) {
        msg = 'Correo o contraseña incorrectos.';
      }
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
      document.getElementById('auth-password').value = '';
    }
    // Si el login es exitoso, onAuthStateChange lo detecta automáticamente
  };

  // ─── CERRAR SESIÓN ────────────────────────────────────────
  window.adminLogout = async function() {
    await client.auth.signOut();
  };
})();
