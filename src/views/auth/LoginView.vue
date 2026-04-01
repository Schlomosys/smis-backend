<template>
  <div class="login-page">
    <div class="login-bg">
      <div class="login-bg__grid"></div>
      <div class="login-bg__glow login-bg__glow--1"></div>
      <div class="login-bg__glow login-bg__glow--2"></div>
    </div>

    <div class="login-shell">
      <!-- Logos partenaires -->
      <div class="partner-bar">
        <div class="partner-logo">
          <img src="/logo_dedras.png" alt="Partenaire 1" class="partner-logo__img" />
          <span class="partner-logo__placeholder">Logo Partenaire 1</span>
        </div>
        <div class="partner-divider"></div>
        <div class="partner-logo">
          <img src="/logo_plan.jpg" alt="Partenaire 2" class="partner-logo__img" />
          <span class="partner-logo__placeholder">Logo Partenaire 2</span>
        </div>
      </div>

      <!-- Logo + Titre application -->
      <div class="app-identity">
        <div class="app-logo">
          <img src="/logo_smis.png" alt="SMIS Logo" class="app-logo__img" />
          <div class="app-logo__fallback">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="22" stroke="currentColor" stroke-width="2.5" />
              <path
                d="M14 30 C14 22 20 16 24 16 C28 16 34 22 34 30"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
              />
              <circle cx="24" cy="28" r="4" fill="currentColor" />
              <path
                d="M18 36 L24 28 L30 36"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
        <h1 class="app-title">
          <span class="app-title__main">Sponsorship Monitoring</span>
          <span class="app-title__amp">&amp;</span>
          <span class="app-title__sub">Impact System</span>
          <span class="app-title__acronym">SMIS</span>
        </h1>
      </div>

      <!-- Carte de connexion -->
      <div class="login-card">
        <div class="login-card__header">
          <h2 class="login-card__title">Connexion</h2>
          <p class="login-card__subtitle">Accédez à votre espace de gestion</p>
        </div>

        <form class="login-form" @submit.prevent="submit">
          <div class="field-group">
            <label class="field-label" for="email">Adresse email</label>
            <div class="field-wrap">
              <span class="field-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path
                    d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"
                  />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </span>
              <input
                id="email"
                v-model="email"
                type="email"
                class="field-input"
                placeholder="votre@email.com"
                required
                autocomplete="email"
              />
            </div>
          </div>

          <div class="field-group">
            <label class="field-label" for="password">Mot de passe</label>
            <div class="field-wrap">
              <span class="field-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="field-input"
                placeholder="••••••••"
                required
                autocomplete="current-password"
              />
              <button type="button" class="field-toggle" @click="showPassword = !showPassword">
                <svg v-if="!showPassword" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fill-rule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                <svg v-else viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                    clip-rule="evenodd"
                  />
                  <path
                    d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div v-if="errorMessage" class="login-error">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            {{ errorMessage }}
          </div>

          <button class="login-btn" :disabled="loading" type="submit">
            <span v-if="loading" class="login-btn__spinner"></span>
            <span v-else class="login-btn__icon">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
            {{ loading ? 'Connexion en cours…' : 'Se connecter' }}
          </button>
        </form>
      </div>

      <p class="login-footer">&copy; {{ new Date().getFullYear() }} SMIS — Tous droits réservés</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')

async function submit() {
  loading.value = true
  errorMessage.value = ''
  try {
    await auth.login({ email: email.value, password: password.value })
    const targetRoute = auth.role === 'admin' ? 'admin-dashboard' : 'alumni-dashboard'
    router.push({ name: targetRoute })
  } catch {
    errorMessage.value = 'Email ou mot de passe incorrect. Veuillez réessayer.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');

/* ── Variables ── */
:root {
  --c-navy: #0b1f3a;
  --c-navy-mid: #12305c;
  --c-blue: #1a5fa8;
  --c-blue-lt: #2d7dd2;
  --c-gold: #c9993a;
  --c-gold-lt: #e8b84b;
  --c-white: #ffffff;
  --c-off: #f0f4f9;
  --c-muted: #7a90aa;
  --c-border: rgba(255, 255, 255, 0.1);
  --c-error: #e05454;
  --r-card: 1.5rem;
  --r-field: 0.75rem;
  --shadow-card: 0 32px 80px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.06);
}

/* ── Page layout ── */
.login-page {
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-navy);
  position: relative;
  overflow: hidden;
  padding: 2rem 1rem;
}

/* ── Background decorations ── */
.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.login-bg__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 48px 48px;
}

.login-bg__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.18;
}

.login-bg__glow--1 {
  width: 600px;
  height: 600px;
  background: var(--c-blue);
  top: -200px;
  right: -100px;
}

.login-bg__glow--2 {
  width: 500px;
  height: 500px;
  background: var(--c-gold);
  bottom: -200px;
  left: -100px;
}

/* ── Shell ── */
.login-shell {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.75rem;
  animation: fadeUp 0.6s ease both;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Partner bar ── */
.partner-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--c-border);
  border-radius: 999px;
  padding: 0.75rem 2rem;
  width: 100%;
  backdrop-filter: blur(12px);
}

.partner-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  flex: 1;
}

.partner-logo__img {
  max-height: 36px;
  max-width: 120px;
  object-fit: contain;
  /*filter: brightness(0) invert(1);*/
  opacity: 0.75;
  display: none; /* masqué si src vide */
}

.partner-logo__img[src]:not([src='']) {
  display: block;
}

.partner-logo__placeholder {
  color: var(--c-muted);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: 1px dashed rgba(255, 255, 255, 0.15);
  border-radius: 0.5rem;
  padding: 0.4rem 0.8rem;
  white-space: nowrap;
}

/* Masquer le placeholder quand l'image est chargée */
.partner-logo__img[src]:not([src='']) + .partner-logo__placeholder {
  display: none;
}

.partner-divider {
  width: 1px;
  height: 36px;
  background: var(--c-border);
  flex-shrink: 0;
}

/* ── App identity ── */
.app-identity {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  text-align: center;
}

.app-logo {
  position: relative;
  width: 72px;
  height: 72px;
}

.app-logo__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: none;
}

.app-logo__img[src]:not([src='']) {
  display: block;
}

.app-logo__fallback {
  width: 72px;
  height: 72px;
  border-radius: 1.25rem;
  background: linear-gradient(135deg, var(--c-blue) 0%, var(--c-navy-mid) 100%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-gold-lt);
  box-shadow: 0 8px 32px rgba(26, 95, 168, 0.4);
}

.app-logo__img[src]:not([src='']) + .app-logo__fallback {
  display: none;
}

.app-logo__fallback svg {
  width: 40px;
  height: 40px;
}

.app-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  margin: 0;
}

.app-title__main {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.7rem;
  font-weight: 700;
  color: var(--c-white);
  line-height: 1.1;
  letter-spacing: -0.01em;
}

.app-title__amp {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1rem;
  color: var(--c-gold);
  font-weight: 400;
}

.app-title__sub {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.7rem;
  font-weight: 700;
  color: var(--c-white);
  line-height: 1.1;
}

.app-title__acronym {
  margin-top: 0.5rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.3em;
  color: var(--c-gold);
  text-transform: uppercase;
  background: rgba(201, 153, 58, 0.12);
  border: 1px solid rgba(201, 153, 58, 0.3);
  border-radius: 999px;
  padding: 0.25rem 1rem;
}

/* ── Login card ── */
.login-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--c-border);
  border-radius: var(--r-card);
  backdrop-filter: blur(24px);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.login-card__header {
  padding: 2rem 2rem 0;
  border-bottom: 1px solid var(--c-border);
  padding-bottom: 1.5rem;
  margin-bottom: 0;
}

.login-card__title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--c-white);
  margin: 0 0 0.25rem;
}

.login-card__subtitle {
  color: var(--c-muted);
  font-size: 0.88rem;
  margin: 0;
}

/* ── Form ── */
.login-form {
  padding: 1.75rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.65);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.field-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 1rem;
  display: flex;
  align-items: center;
  color: var(--c-muted);
  pointer-events: none;
}

.field-icon svg {
  width: 1rem;
  height: 1rem;
}

.field-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--r-field);
  color: var(--c-white);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  padding: 0.85rem 1rem 0.85rem 2.75rem;
  outline: none;
  transition:
    border-color 0.2s,
    background 0.2s,
    box-shadow 0.2s;
}

.field-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.field-input:focus {
  border-color: var(--c-blue-lt);
  background: rgba(255, 255, 255, 0.09);
  box-shadow: 0 0 0 3px rgba(45, 125, 210, 0.18);
}

.field-toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: var(--c-muted);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.field-toggle:hover {
  color: var(--c-white);
}

.field-toggle svg {
  width: 1.1rem;
  height: 1.1rem;
}

/* ── Error ── */
.login-error {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(224, 84, 84, 0.12);
  border: 1px solid rgba(224, 84, 84, 0.3);
  border-radius: 0.65rem;
  color: #f08080;
  font-size: 0.875rem;
  padding: 0.75rem 1rem;
}

.login-error svg {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

/* ── Submit button ── */
.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: 100%;
  background: linear-gradient(135deg, var(--c-blue) 0%, var(--c-blue-lt) 100%);
  border: none;
  border-radius: var(--r-field);
  color: var(--c-white);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 1rem;
  cursor: pointer;
  transition:
    opacity 0.2s,
    transform 0.2s,
    box-shadow 0.2s;
  box-shadow: 0 8px 24px rgba(26, 95, 168, 0.35);
  margin-top: 0.25rem;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 32px rgba(26, 95, 168, 0.5);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-btn__icon svg {
  width: 1.1rem;
  height: 1.1rem;
}

.login-btn__spinner {
  width: 1.1rem;
  height: 1.1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Footer ── */
.login-footer {
  color: rgba(255, 255, 255, 0.2);
  font-size: 0.75rem;
  text-align: center;
  margin: 0;
}
</style>
