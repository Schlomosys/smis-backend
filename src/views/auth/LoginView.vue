<template>
  <div class="login-root">
    <!-- ════════════════════════════════════════════
         PANNEAU GAUCHE — Branding
    ════════════════════════════════════════════ -->
    <aside class="branding-panel">
      <!-- Fond décoratif -->
      <div class="branding-bg" aria-hidden="true">
        <div class="blob blob--1"></div>
        <div class="blob blob--2"></div>
        <div class="blob blob--3"></div>
        <div class="grid-overlay"></div>
      </div>

      <!-- Contenu branding -->
      <div class="branding-content">
        <!-- Logos partenaires -->
        <div class="partners-row anim-slide-down" style="--delay: 0.1s">
          <div class="partner-chip">
            <img
              v-if="!imgError.dedras"
              src="/logo_dedras.png"
              alt="DEDRAS"
              class="partner-logo-img"
              @error="imgError.dedras = true"
            />
            <template v-else>
              <div class="partner-icon-fallback">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path
                    d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <span class="partner-label">DEDRAS</span>
            </template>
          </div>

          <div class="partner-sep-dot"><span></span><span></span><span></span></div>

          <div class="partner-chip">
            <img
              v-if="!imgError.plan"
              src="/logo_plan.jpg"
              alt="PLAN International"
              class="partner-logo-img"
              @error="imgError.plan = true"
            />
            <template v-else>
              <div class="partner-icon-fallback">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path
                    d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <span class="partner-label">PLAN</span>
            </template>
          </div>
        </div>

        <!-- Logo SMIS + Titre -->
        <div class="app-brand anim-slide-up" style="--delay: 0.25s">
          <!--<div class="app-logo-box">
            <img
              v-if="!imgError.smis"
              src="/logo_smis.png"
              alt="SMIS"
              class="app-logo-real"
              @error="imgError.smis = true"
            />
            <div v-else class="app-logo-icon">
              <svg viewBox="0 0 56 56" fill="none">
                <circle
                  cx="28"
                  cy="28"
                  r="18"
                  stroke="currentColor"
                  stroke-width="2"
                  opacity=".25"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="11"
                  stroke="currentColor"
                  stroke-width="2"
                  opacity=".5"
                />
                <circle cx="28" cy="28" r="4" fill="currentColor" />
                <line
                  x1="28"
                  y1="3"
                  x2="28"
                  y2="10"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <line
                  x1="28"
                  y1="46"
                  x2="28"
                  y2="53"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <line
                  x1="3"
                  y1="28"
                  x2="10"
                  y2="28"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <line
                  x1="46"
                  y1="28"
                  x2="53"
                  y2="28"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </div>
            <div class="app-logo-ring"></div>
          </div>-->

          <div class="app-title-block">
            <h1 class="app-title-main">
              Sponsorship Monitoring
              <span class="title-amp"> &amp; </span>
              Impact System
            </h1>
            <!--<div class="app-acronym-pill">
              <span class="acronym-dot"></span>
              SMIS
              <span class="acronym-dot"></span>
            </div>-->
          </div>
        </div>

        <!-- Tagline & stats -->
        <div class="branding-stats anim-fade" style="--delay: 0.45s">
          <div class="tagline">
            Plateforme de suivi &amp; d'impact du programme de parrainage des enfants vulnérables
          </div>

          <!--<div class="stat-pills">
            <div class="stat-pill">
              <span class="stat-val">30+</span>
              <span class="stat-lbl">ans d'impact</span>
            </div>
            <div class="stat-pill-sep"></div>
            <div class="stat-pill">
              <span class="stat-val">500+</span>
              <span class="stat-lbl">bénéficiaires</span>
            </div>
            <div class="stat-pill-sep"></div>
            <div class="stat-pill">
              <span class="stat-val">3</span>
              <span class="stat-lbl">modules</span>
            </div>
          </div>-->
        </div>
      </div>

      <!-- Footer branding -->
      <p class="branding-footer anim-fade" style="--delay: 0.6s">
        © {{ new Date().getFullYear() }} DEDRAS · Tous droits réservés
      </p>
    </aside>

    <!-- ════════════════════════════════════════════
         PANNEAU DROIT — Formulaire
    ════════════════════════════════════════════ -->
    <main class="form-panel">
      <div class="form-bg-dots" aria-hidden="true"></div>

      <div class="form-wrap anim-slide-up" style="--delay: 0.15s">
        <!-- En-tête formulaire -->
        <div class="form-header">
          <div class="form-header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div>
            <h2 class="form-title">Connexion</h2>
            <p class="form-subtitle">Accédez à votre espace de gestion</p>
          </div>
        </div>

        <!-- Formulaire -->
        <form @submit.prevent="submit" novalidate class="the-form">
          <!-- Email -->
          <div class="field-block">
            <label for="email" class="field-lbl">
              <svg viewBox="0 0 20 20" fill="currentColor" class="lbl-icon">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Adresse email
            </label>
            <div
              class="input-wrap"
              :class="{
                'input-wrap--focused': focused.email,
                'input-wrap--error': touched.email && errors.email,
              }"
            >
              <input
                id="email"
                v-model.trim="form.email"
                type="email"
                class="field-inp"
                placeholder="votre@email.com"
                autocomplete="email"
                required
                @focus="focused.email = true"
                @blur="
                  ;((focused.email = false), (touched.email = true))
                  validate()
                "
              />
              <span v-if="touched.email && !errors.email && form.email" class="input-check">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
            </div>
            <p v-if="touched.email && errors.email" class="field-err">{{ errors.email }}</p>
          </div>

          <!-- Mot de passe -->
          <div class="field-block">
            <label for="password" class="field-lbl">
              <svg viewBox="0 0 20 20" fill="currentColor" class="lbl-icon">
                <path
                  fill-rule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clip-rule="evenodd"
                />
              </svg>
              Mot de passe
            </label>
            <div class="input-wrap" :class="{ 'input-wrap--focused': focused.password }">
              <input
                id="password"
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                class="field-inp field-inp--pr"
                placeholder="••••••••"
                autocomplete="current-password"
                required
                @focus="focused.password = true"
                @blur="focused.password = false"
              />
              <button
                type="button"
                class="eye-btn"
                :aria-label="showPass ? 'Masquer' : 'Afficher'"
                @click="showPass = !showPass"
              >
                <svg v-if="!showPass" viewBox="0 0 20 20" fill="currentColor">
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
                    d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 00-5.478-5.478z"
                    clip-rule="evenodd"
                  />
                  <path
                    d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Erreur API -->
          <Transition name="alert-slide">
            <div v-if="apiError" class="api-error" role="alert">
              <svg viewBox="0 0 20 20" fill="currentColor" class="alert-icon">
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              <span>{{ apiError }}</span>
              <button type="button" class="alert-close" @click="apiError = ''">✕</button>
            </div>
          </Transition>

          <!-- Submit -->
          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="!loading" class="submit-inner">
              <svg viewBox="0 0 20 20" fill="currentColor" class="btn-icon">
                <path
                  fill-rule="evenodd"
                  d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              Se connecter
            </span>
            <span v-else class="loading-row">
              <span class="spinner"></span>
              Connexion en cours…
            </span>
          </button>

          <!-- Divider -->
          <div class="divider">
            <span class="divider-line"></span>
            <span class="divider-txt">ou</span>
            <span class="divider-line"></span>
          </div>

          <!-- Lien alumni -->
          <router-link to="/register" class="alumni-link">
            Ancien bénéficiaire ? Créer un compte alumni
          </router-link>
        </form>

        <p class="form-footer">
          <svg
            viewBox="0 0 16 16"
            fill="currentColor"
            style="width: 12px; height: 12px; opacity: 0.5"
          >
            <path
              d="M8 1a3.5 3.5 0 00-3.5 3.5V6H4a1 1 0 00-1 1v6a1 1 0 001 1h8a1 1 0 001-1V7a1 1 0 00-1-1h-.5V4.5A3.5 3.5 0 008 1zm2.5 5V4.5a2.5 2.5 0 00-5 0V6h5z"
            />
          </svg>
          A smile for life· DEDRAS {{ new Date().getFullYear() }}
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const form = reactive({ email: '', password: '' })
const focused = reactive({ email: false, password: false })
const touched = reactive({ email: false })
const errors = reactive({ email: '' })
const loading = ref(false)
const showPass = ref(false)
const apiError = ref('')
const imgError = reactive({ dedras: false, plan: false, smis: false })

function validate() {
  errors.email = form.email
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
      ? ''
      : 'Email invalide'
    : 'Ce champ est obligatoire'
}

async function submit() {
  touched.email = true
  validate()
  if (errors.email || !form.password) {
    if (!form.password) apiError.value = 'Veuillez renseigner votre mot de passe.'
    return
  }
  loading.value = true
  apiError.value = ''
  try {
    await auth.login({ email: form.email, password: form.password })
    router.push({ name: auth.role === 'admin' ? 'admin-dashboard' : 'alumni-dashboard' })
  } catch (err) {
    apiError.value = err?.response?.data?.message ?? 'Email ou mot de passe incorrect.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

:root {
  --navy-900: #060f1e;
  --navy-800: #0b1f3a;
  --navy-700: #0f2a4e;
  --navy-600: #1a3a66;
  --blue-500: #1a5fa8;
  --blue-400: #2d7dd2;
  --blue-300: #5ba3e8;
  --gold-500: #c9993a;
  --gold-400: #e8b84b;
  --gold-300: #f5d080;
  --white: #ffffff;
  --slate-50: #f8fafc;
  --slate-100: #f1f5f9;
  --slate-200: #e2e8f0;
  --slate-400: #94a3b8;
  --slate-600: #475569;
  --slate-800: #1e293b;
  --success: #22c55e;
  --danger: #ef4444;
}

/* ─── Split screen ─── */
.login-root {
  font-family: 'Plus Jakarta Sans', sans-serif;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
}
@media (max-width: 900px) {
  .login-root {
    grid-template-columns: 1fr;
  }
}

/* ─── Panneau gauche ─── */
.branding-panel {
  position: relative;
  background: var(--navy-800);
  display: flex;
  flex-direction: column;
  padding: 3rem 3.5rem;
  overflow: hidden;
  min-height: 100vh;
}
@media (max-width: 900px) {
  .branding-panel {
    min-height: auto;
    padding: 2rem 1.75rem 2.5rem;
  }
}

.branding-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  animation: blobFloat 9s ease-in-out infinite;
}
.blob--1 {
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(26, 95, 168, 0.55) 0%, transparent 70%);
  top: -120px;
  right: -80px;
  animation-delay: 0s;
}
.blob--2 {
  width: 360px;
  height: 360px;
  background: radial-gradient(circle, rgba(201, 153, 58, 0.35) 0%, transparent 70%);
  bottom: -80px;
  left: -60px;
  animation-delay: -3s;
}
.blob--3 {
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, rgba(45, 125, 210, 0.2) 0%, transparent 70%);
  top: 45%;
  left: 20%;
  animation-delay: -6s;
}
@keyframes blobFloat {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(18px, -18px) scale(1.04);
  }
  66% {
    transform: translate(-10px, 14px) scale(0.97);
  }
}
.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 44px 44px;
}

.branding-content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2.75rem;
}
@media (max-width: 900px) {
  .branding-content {
    gap: 1.75rem;
  }
}

/* Partners */
.partners-row {
  display: flex;
  align-items: center;
  gap: 2rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  padding: 0.65rem 1.5rem;
  backdrop-filter: blur(14px);
  width: fit-content;
}
.partner-chip {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}
.partner-logo-img {
  height: 80px;
  width: auto;
  max-width: 220px;
  object-fit: contain;
  /* retire filter si tes logos sont déjà sur fond transparent */
  opacity: 0.9;
  transition: opacity 0.2s;
}
.partner-logo-img:hover {
  opacity: 1;
}
.partner-icon-fallback {
  width: 40px;
  height: 40px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
}
.partner-icon-fallback svg {
  width: 20px;
  height: 20px;
}
.partner-label {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.65);
}
.partner-sep-dot {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0 0.25rem;
}
.partner-sep-dot span {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
}

/* App Brand */
.app-brand {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
@media (max-width: 640px) {
  .app-brand {
    gap: 6rem;
  }
}

.app-logo-box {
  position: relative;
  width: 92px;
  height: 92px;
  flex-shrink: 0;
}
.app-logo-real {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 1.3rem;
  position: relative;
  z-index: 1;
}
.app-logo-icon {
  width: 92px;
  height: 92px;
  border-radius: 1.3rem;
  background: linear-gradient(145deg, var(--blue-500) 0%, var(--navy-700) 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gold-400);
  position: relative;
  z-index: 1;
  box-shadow:
    0 0 0 8px rgba(26, 95, 168, 0.12),
    0 16px 48px rgba(0, 0, 0, 0.4);
}
.app-logo-icon svg {
  width: 52px;
  height: 52px;
}
.app-logo-ring {
  position: absolute;
  inset: -7px;
  border-radius: 1.7rem;
  border: 1.5px solid rgba(201, 153, 58, 0.3);
  animation: ringPulse 3s ease-in-out infinite;
}
@keyframes ringPulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.03);
  }
}

.app-title-block {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.app-title-main {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2.1rem;
  font-weight: 700;
  color: var(--white);
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0;
  text-align: center;
}
.title-amp {
  font-style: italic;
  color: var(--gold-400);
  font-weight: 400;
}
@media (max-width: 640px) {
  .app-title-main {
    font-size: 1.6rem;
  }
}

.app-acronym-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--gold-400);
  background: rgba(201, 153, 58, 0.1);
  border: 1px solid rgba(201, 153, 58, 0.25);
  border-radius: 999px;
  padding: 0.25rem 0.9rem;
  width: fit-content;
}
.acronym-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--gold-400);
  flex-shrink: 0;
}

/* Stats */
.branding-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.tagline {
  font-size: 0.9 rem;
  color: rgba(0, 0, 0, 0.4);
  line-height: 1.7;
  margin: 0;
  font-weight: bold;
  text-align: center;
  /*max-width: 360px;
  /*font-style: italic;*/
}
.stat-pills {
  display: flex;
  align-items: center;
}
.stat-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
}
.stat-val {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.7rem;
  font-weight: 700;
  color: var(--gold-400);
  line-height: 1;
}
.stat-lbl {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.38);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 500;
}
.stat-pill-sep {
  width: 1px;
  height: 36px;
  background: rgba(255, 255, 255, 0.12);
  margin: 0 1.5rem;
  flex-shrink: 0;
}
@media (max-width: 900px) {
  .stat-pills {
    display: none;
  }
}

.branding-footer {
  position: relative;
  z-index: 1;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.2);
  margin: 0;
  letter-spacing: 0.04em;
}

/* ─── Panneau droit ─── */
.form-panel {
  position: relative;
  background: var(--slate-50);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 2.5rem;
  min-height: 100vh;
}
@media (max-width: 900px) {
  .form-panel {
    padding: 2.5rem 1.5rem 3rem;
    min-height: auto;
  }
}

.form-bg-dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, var(--slate-200) 1px, transparent 1px);
  background-size: 22px 22px;
  opacity: 0.5;
  pointer-events: none;
}

.form-wrap {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  background: var(--white);
  border-radius: 1.25rem;
  box-shadow:
    0 0 0 1px var(--slate-200),
    0 24px 64px rgba(15, 23, 42, 0.1),
    0 4px 16px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

/* Form header */
.form-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.75rem 2rem 1.5rem;
  border-bottom: 1px solid var(--slate-100);
  background: linear-gradient(135deg, var(--navy-800) 0%, var(--navy-700) 100%);
}
.form-header-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gold-400);
  flex-shrink: 0;
}
.form-header-icon svg {
  width: 24px;
  height: 24px;
}
.form-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--white);
  margin: 0 0 0.15rem;
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.form-subtitle {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

/* Form body */
.the-form {
  padding: 1.75rem 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
@media (max-width: 400px) {
  .form-header {
    padding: 1.4rem 1.5rem;
  }
  .the-form {
    padding: 1.4rem 1.5rem;
  }
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.field-lbl {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--slate-600);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
}
.lbl-icon {
  width: 13px;
  height: 13px;
  color: var(--blue-400);
  flex-shrink: 0;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 0.75rem;
  border: 1.5px solid black;
  background: burlywood;
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    background 0.2s;
}
.input-wrap--focused {
  border-color: var(--blue-400);
  background: var(--white);
  box-shadow: 0 0 0 3px rgba(45, 125, 210, 0.12);
}
.input-wrap--error {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.field-inp {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.95rem;
  color: var(--slate-800);
  padding: 0.85rem 1rem;
  -webkit-appearance: none;
}
.field-inp::placeholder {
  color: var(--slate-400);
  font-size: 0.9rem;
}
.field-inp--pr {
  padding-right: 3rem;
}

.input-check {
  position: absolute;
  right: 0.85rem;
  display: flex;
  align-items: center;
  color: var(--success);
}
.input-check svg {
  width: 16px;
  height: 16px;
}

.eye-btn {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: var(--slate-400);
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 0.35rem;
  display: flex;
  align-items: center;
  transition:
    color 0.2s,
    background 0.15s;
}
.eye-btn:hover {
  color: var(--blue-400);
  background: rgba(45, 125, 210, 0.08);
}
.eye-btn svg {
  width: 1rem;
  height: 1rem;
}

.field-err {
  font-size: 0.775rem;
  color: var(--danger);
  margin: 0;
}
.field-err::before {
  content: '⚠ ';
}

.api-error {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-left: 3px solid var(--danger);
  border-radius: 0.65rem;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  color: #b91c1c;
}
.alert-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.api-error span {
  flex: 1;
}
.alert-close {
  background: none;
  border: none;
  color: #b91c1c;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0.15rem 0.3rem;
  border-radius: 0.25rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.alert-close:hover {
  opacity: 1;
}
.alert-slide-enter-active,
.alert-slide-leave-active {
  transition: all 0.25s ease;
}
.alert-slide-enter-from,
.alert-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.submit-btn {
  width: 100%;
  border: none;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, var(--blue-500) 0%, var(--blue-400) 100%);
  color: var(--white);
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.95rem 1rem;
  cursor: pointer;
  letter-spacing: 0.01em;
  position: relative;
  overflow: hidden;
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    opacity 0.2s;
  box-shadow: 0 4px 18px rgba(26, 95, 168, 0.35);
  margin-top: 0.15rem;
}
.submit-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--blue-400) 0%, var(--blue-300) 100%);
  opacity: 0;
  transition: opacity 0.2s;
}
.submit-btn:hover:not(:disabled)::before {
  opacity: 1;
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 28px rgba(26, 95, 168, 0.5);
}
.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.submit-inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
}
.btn-icon {
  width: 1rem;
  height: 1rem;
}
.loading-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}
.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
  flex-shrink: 0;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.divider-line {
  flex: 1;
  height: 1px;
  background: var(--slate-200);
}
.divider-txt {
  font-size: 0.75rem;
  color: var(--slate-400);
  white-space: nowrap;
  font-weight: 500;
}

.alumni-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem 1rem;
  border: 1.5px dashed var(--slate-200);
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--blue-500);
  text-decoration: none;
  transition:
    border-color 0.2s,
    background 0.2s,
    color 0.2s;
}
.alumni-link:hover {
  border-color: var(--blue-400);
  background: rgba(45, 125, 210, 0.04);
  color: var(--blue-400);
}
.alumni-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.form-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  font-size: 0.72rem;
  color: var(--slate-400);
  margin: 0;
  padding: 0.9rem 2rem;
  border-top: 1px solid var(--slate-100);
  background: var(--slate-50);
}

/* ─── Animations d'entrée ─── */
.anim-slide-down {
  animation: slideDown 0.5s ease both;
  animation-delay: var(--delay, 0s);
}
.anim-slide-up {
  animation: slideUp 0.55s ease both;
  animation-delay: var(--delay, 0s);
}
.anim-fade {
  animation: fadeIn 0.6s ease both;
  animation-delay: var(--delay, 0s);
}
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* ─── Responsive ─── */
/*@media (max-width: 640px) {
  .branding-panel {
    min-height: auto;
    padding: 2rem 1.75rem 2.5rem;
  }
  .app-logo-box,
  .app-logo-icon {
    width: 72px;
    height: 72px;
  }
  .app-logo-icon svg {
    width: 40px;
    height: 40px;
  }
  .app-logo-ring {
    inset: -5px;
  }
  .partner-logo-img {
    height: 32px;
  }
  .form-panel {
    padding: 1.5rem 1.25rem 2.5rem;
  }
}
@media (max-width: 400px) {
  .branding-panel {
    padding: 1.75rem 1.5rem 2rem;
  }
  .app-logo-box,
  .app-logo-icon {
    width: 72px;
    height: 72px;
  }
  .app-logo-icon svg {
    width: 40px;
    height: 40px;
  }
  .app-logo-ring {
    inset: -5px;
  }
  .partner-logo-img {
    height: 32px;
  }
  .form-panel {
    padding: 1.5rem 1.25rem 2.5rem;
  }
}*/

@media (max-width: 640px) {
  .app-logo-box,
  .app-logo-icon {
    width: 90px;
    height: 90px;
  }
  .app-logo-icon svg {
    width: 40px;
    height: 40px;
  }
  .app-logo-ring {
    inset: -5px;
  }
  .partner-logo-img {
    height: 50px;
  }
  .form-panel {
    padding: 1.5rem 1.25rem 2.5rem;
  }
}
@media (max-width: 400px) {
  .app-logo-box,
  .app-logo-icon {
    width: 90px;
    height: 90px;
  }
  .app-logo-icon svg {
    width: 40px;
    height: 40px;
  }
  .app-logo-ring {
    inset: -5px;
  }
  .partner-logo-img {
    height: 50px;
  }
  .form-panel {
    padding: 1.5rem 1.25rem 2.5rem;
  }
}
</style>
