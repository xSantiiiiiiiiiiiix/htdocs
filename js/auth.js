(function () {
  const client = window.supabaseClient;

  function userRole(user) {
    return user?.user_metadata?.rol || user?.app_metadata?.rol || null;
  }

  async function hasRole(user, role) {
    if (userRole(user) === role) return true;
    if (!client || !user) return false;
    const { data, error } = await client.from('perfiles').select('rol').eq('id', user.id).maybeSingle();
    if (error) throw error;
    return data?.rol === role;
  }

  async function currentUser() {
    if (!client) return null;
    const { data, error } = await client.auth.getUser();
    if (error && error.name !== 'AuthSessionMissingError' && error.status !== 401) throw error;
    return data.user;
  }

  async function requireRole(role) {
    const user = await currentUser();
    if (!user || !(await hasRole(user, role))) {
      window.location.replace('auth.html?redirect=admin.html');
      return null;
    }
    return user;
  }

  async function signOut() {
    if (!client) return;
    const { error } = await client.auth.signOut();
    if (error) throw error;
    window.location.href = 'index.html';
  }

  async function handleAuth(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const status = document.getElementById('auth-status');
    const submit = form.querySelector('button[type="submit"]');
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;
    const mode = form.dataset.mode || 'login';

    if (!client) {
      status.textContent = 'Configurá Supabase antes de iniciar sesión.';
      return;
    }
    submit.disabled = true;
    status.textContent = 'Procesando...';
    try {
      const response = mode === 'register'
        ? await client.auth.signUp({ email, password, options: { data: { rol: 'usuario' } } })
        : await client.auth.signInWithPassword({ email, password });
      if (response.error) throw response.error;
      status.textContent = mode === 'register'
        ? 'Registro correcto. Revisá tu correo para confirmar la cuenta.'
        : 'Inicio de sesión correcto.';
      if (mode === 'login' && !form.closest('.site-auth-modal')) {
        const destination = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
        window.location.href = destination;
      }
      if (form.closest('.site-auth-modal')) {
        await renderAuthControls();
        if (mode === 'login') closeAuthModal();
      }
    } catch (error) {
      status.textContent = error.message || 'No se pudo completar la operación.';
    } finally {
      submit.disabled = false;
    }
  }

  function closeAuthModal() {
    const modal = document.getElementById('site-auth-modal');
    if (modal) modal.hidden = true;
  }

  function openAuthModal(mode = 'login') {
    const modal = document.getElementById('site-auth-modal');
    if (!modal) return;
    modal.hidden = false;
    const form = modal.querySelector('[data-auth-form]');
    form.dataset.mode = mode;
    modal.querySelectorAll('[data-auth-tab]').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.authTab === mode);
    });
    modal.querySelector('[data-auth-title]').textContent = mode === 'register' ? 'Crear cuenta' : 'Iniciar sesión';
    modal.querySelector('[data-auth-submit]').textContent = mode === 'register' ? 'Registrarme' : 'Iniciar sesión';
    modal.querySelector('#auth-status').textContent = '';
  }

  async function renderAuthControls() {
    const container = document.getElementById('auth-controls');
    if (!container) return;
    const user = await currentUser();
    if (!user) {
      container.innerHTML = '<button type="button" class="auth-login-button" data-open-auth>Iniciar sesión</button>';
      return;
    }
    const admin = await hasRole(user, 'admin');
    const label = user.user_metadata?.nombre || user.email || 'Mi cuenta';
    container.innerHTML = `
      <details class="auth-account">
        <summary>${label}</summary>
        <div class="auth-account-menu">
          <a href="mis-compras.html">Mis compras</a>
          ${admin ? '<a href="admin.html">Panel administrador</a>' : ''}
          <button type="button" data-action="logout">Cerrar sesión</button>
        </div>
      </details>`;
    container.querySelector('[data-action="logout"]').addEventListener('click', signOut);
  }

  function createAuthModal() {
    if (document.getElementById('site-auth-modal')) return;
    document.body.insertAdjacentHTML('beforeend', `
      <div id="site-auth-modal" class="site-auth-modal" hidden role="dialog" aria-modal="true" aria-labelledby="site-auth-title">
        <div class="site-auth-card">
          <button type="button" class="site-auth-close" data-close-auth aria-label="Cerrar">×</button>
          <h2 id="site-auth-title" data-auth-title>Iniciar sesión</h2>
          <div class="site-auth-tabs" role="tablist">
            <button type="button" data-auth-tab="login" class="active">Iniciar sesión</button>
            <button type="button" data-auth-tab="register">Registrarse</button>
          </div>
          <form data-auth-form data-mode="login">
            <label>Email<input name="email" type="email" required autocomplete="email"></label>
            <label>Contraseña<input name="password" type="password" required minlength="6" autocomplete="current-password"></label>
            <button type="submit" data-auth-submit>Iniciar sesión</button>
          </form>
          <p id="auth-status" role="status"></p>
        </div>
      </div>`);
    const modal = document.getElementById('site-auth-modal');
    modal.querySelector('[data-auth-form]').addEventListener('submit', handleAuth);
    modal.querySelectorAll('[data-auth-tab]').forEach((tab) => tab.addEventListener('click', () => openAuthModal(tab.dataset.authTab)));
    modal.querySelector('[data-close-auth]').addEventListener('click', closeAuthModal);
    modal.addEventListener('click', (event) => { if (event.target === modal) closeAuthModal(); });
  }

  window.auth = { currentUser, userRole, hasRole, requireRole, signOut, openAuthModal };

  document.addEventListener('DOMContentLoaded', async () => {
    document.querySelectorAll('[data-auth-form]').forEach((form) => form.addEventListener('submit', handleAuth));
    document.querySelectorAll('[data-action="logout"]').forEach((button) => button.addEventListener('click', signOut));
    createAuthModal();
    document.addEventListener('click', (event) => {
      if (event.target.closest('[data-open-auth]')) openAuthModal('login');
    });
    await renderAuthControls();
    if (document.body.dataset.requiresRole) {
      await requireRole(document.body.dataset.requiresRole);
    }
  });
})();
