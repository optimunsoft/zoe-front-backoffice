<template>
    <div class="relative min-h-screen overflow-hidden bg-[#F4F8FF] dark:bg-[#0A1020]">
      <!-- Base -->
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,123,255,0.14),transparent_42%),linear-gradient(180deg,#FFFFFF_0%,#E8F2FF_100%)] dark:bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.16),transparent_42%),linear-gradient(180deg,#0F172A_0%,#080D1A_100%)]"
      />
  
      <!-- Círculos suaves -->
      <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div class="absolute h-[900px] w-[900px] rounded-full border border-[#007BFF]/10 dark:border-blue-400/[0.035]" />
        <div class="absolute h-[680px] w-[680px] rounded-full border border-[#007BFF]/12 dark:border-blue-400/[0.04]" />
        <div class="absolute h-[460px] w-[460px] rounded-full border border-[#007BFF]/15 dark:border-blue-400/[0.045]" />
      </div>
  
      <!-- Luces suaves -->
      <div class="absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#007BFF]/10 blur-3xl dark:bg-blue-500/[0.04]" />
      <div class="absolute -left-32 bottom-0 h-[280px] w-[480px] rounded-full bg-[#007BFF]/12 blur-3xl dark:bg-blue-600/[0.06]" />
      <div class="absolute -right-32 bottom-0 h-[280px] w-[480px] rounded-full bg-[#007BFF]/12 blur-3xl dark:bg-blue-600/[0.06]" />
  
      <!-- Partículas -->
      <div class="absolute inset-0">
        <span class="absolute left-[15%] top-[20%] h-1 w-1 rounded-full bg-[#007BFF]/35 dark:bg-blue-300/40" />
        <span class="absolute left-[80%] top-[25%] h-2 w-2 rounded-full bg-[#007BFF]/25 dark:bg-blue-400/25" />
        <span class="absolute left-[30%] bottom-[25%] h-1.5 w-1.5 rounded-full bg-[#007BFF]/20 dark:bg-blue-300/25" />
        <span class="absolute right-[20%] bottom-[18%] h-1 w-1 rounded-full bg-[#007BFF]/30 dark:bg-blue-300/35" />
      </div>
  
      <!-- Nube izquierda — modo claro -->
      <svg
        class="pointer-events-none absolute -left-24 bottom-[-45px] w-[520px] opacity-40 dark:hidden"
        viewBox="0 0 560 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cloudLeftLight" x1="0" y1="0" x2="560" y2="0">
            <stop stop-color="#007BFF" stop-opacity="0" />
            <stop offset="0.35" stop-color="#007BFF" stop-opacity="0.55" />
            <stop offset="1" stop-color="#66B0FF" stop-opacity="0.2" />
          </linearGradient>
          <filter id="softGlowLeftLight" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
  
        <path
          d="M4 216H402C457 216 502 173 502 120C502 68 459 26 406 26C388 26 371 31 356 39C329 16 293 2 253 2C191 2 138 41 120 95C107 91 94 89 80 89C37 89 2 124 2 167C2 185 8 202 18 216"
          stroke="url(#cloudLeftLight)"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
          filter="url(#softGlowLeftLight)"
        />
      </svg>
  
      <!-- Nube izquierda — modo oscuro -->
      <svg
        class="pointer-events-none absolute -left-24 bottom-[-45px] hidden w-[520px] opacity-25 dark:block"
        viewBox="0 0 560 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cloudLeftDark" x1="0" y1="0" x2="560" y2="0">
            <stop stop-color="#2563EB" stop-opacity="0" />
            <stop offset="0.35" stop-color="#3B82F6" stop-opacity="0.65" />
            <stop offset="1" stop-color="#60A5FA" stop-opacity="0.15" />
          </linearGradient>
          <filter id="softGlowLeftDark" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
  
        <path
          d="M4 216H402C457 216 502 173 502 120C502 68 459 26 406 26C388 26 371 31 356 39C329 16 293 2 253 2C191 2 138 41 120 95C107 91 94 89 80 89C37 89 2 124 2 167C2 185 8 202 18 216"
          stroke="url(#cloudLeftDark)"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
          filter="url(#softGlowLeftDark)"
        />
      </svg>
  
      <!-- Nube derecha — modo claro -->
      <svg
        class="pointer-events-none absolute -right-24 bottom-[-35px] w-[520px] opacity-40 dark:hidden"
        viewBox="0 0 560 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cloudRightLight" x1="560" y1="0" x2="0" y2="0">
            <stop stop-color="#007BFF" stop-opacity="0" />
            <stop offset="0.35" stop-color="#007BFF" stop-opacity="0.55" />
            <stop offset="1" stop-color="#66B0FF" stop-opacity="0.2" />
          </linearGradient>
          <filter id="softGlowRightLight" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
  
        <path
          d="M4 216H402C457 216 502 173 502 120C502 68 459 26 406 26C388 26 371 31 356 39C329 16 293 2 253 2C191 2 138 41 120 95C107 91 94 89 80 89C37 89 2 124 2 167C2 185 8 202 18 216"
          stroke="url(#cloudRightLight)"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
          filter="url(#softGlowRightLight)"
        />
      </svg>
  
      <!-- Nube derecha — modo oscuro -->
      <svg
        class="pointer-events-none absolute -right-24 bottom-[-35px] hidden w-[520px] opacity-25 dark:block"
        viewBox="0 0 560 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cloudRightDark" x1="560" y1="0" x2="0" y2="0">
            <stop stop-color="#2563EB" stop-opacity="0" />
            <stop offset="0.35" stop-color="#3B82F6" stop-opacity="0.65" />
            <stop offset="1" stop-color="#60A5FA" stop-opacity="0.15" />
          </linearGradient>
          <filter id="softGlowRightDark" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
  
        <path
          d="M4 216H402C457 216 502 173 502 120C502 68 459 26 406 26C388 26 371 31 356 39C329 16 293 2 253 2C191 2 138 41 120 95C107 91 94 89 80 89C37 89 2 124 2 167C2 185 8 202 18 216"
          stroke="url(#cloudRightDark)"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
          filter="url(#softGlowRightDark)"
        />
      </svg>
  
      <!-- Formulario -->
      <div class="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div
          class="w-full max-w-[440px] rounded-2xl border border-[#007BFF]/10 bg-white/75 p-8 shadow-2xl shadow-blue-500/10 backdrop-blur-xl
                 dark:border-white/10 dark:bg-[#111827]/75 dark:shadow-black/30"
        >
          <!-- Logo nube -->
          <div class="mb-8 text-center">
            <div class="mx-auto mb-5 flex flex-col items-center justify-center gap-2 rounded-2xl px-8 py-5">
              <!-- <svg class="size-24" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="8" width="112" height="112" rx="28" fill="#EAF3FF" />
                <path
                  d="M43 79H84C92 79 98 73 98 65C98 57.5 92.2 51.5 84.8 51.2C81.8 41.8 73.6 36 64 36C53.8 36 45.2 43 43.2 52.6C35.8 53.4 30 59.5 30 67C30 73.8 35.2 79 43 79Z"
                  stroke="#007BFF"
                  stroke-width="5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg> -->
              <img
                src="/images/logo.png"
                alt="Zoe"
                class="h-20 w-auto max-w-full object-contain"
                width="128"
                height="80"
              />
            </div>
  
            <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
              Bienvenido
            </h1>
            <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Inicia sesión con tu cuenta de backoffice
            </p>
          </div>
  
  
          <!-- Formulario -->
          <form class="space-y-4" autocomplete="off" @submit.prevent="continueWithCode">
            <p
              v-if="errorMessage"
              class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
            >
              {{ errorMessage }}
            </p>

            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Correo electrónico
              </label>
              <input
                v-model="email"
                type="email"
                autocomplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                placeholder="usuario@optimunsoft.co"
                :readonly="codeStepActive"
                :aria-invalid="Boolean(emailError)"
                :aria-describedby="emailError ? 'email-error' : undefined"
                class="w-full rounded-xl border bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none transition
                       placeholder:text-slate-400 focus:ring-4 focus:ring-[#007BFF]/10
                       read-only:cursor-default read-only:opacity-80
                       dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
                :class="emailError
                  ? 'border-red-400 focus:border-red-500 dark:border-red-500/50'
                  : 'border-slate-300 focus:border-[#007BFF] dark:border-white/10'"
                @input="emailError = ''"
                @blur="validateEmailField"
              />
              <p
                v-if="emailError"
                id="email-error"
                role="alert"
                class="mt-2 text-sm text-red-600 dark:text-red-400"
              >
                {{ emailError }}
              </p>
            </div>
  
            <div v-if="codeStepActive">
              <p class="mb-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Le acabamos de enviar un código de verificación temporal. Por favor, compruebe su bandeja de entrada
              </p>
              <div
                class="flex overflow-hidden rounded-xl border border-slate-300 bg-white/80 transition focus-within:border-[#007BFF] focus-within:ring-4 focus-within:ring-[#007BFF]/10
                       dark:border-white/10 dark:bg-white/5"
              >
                <input
                  v-model="verificationCode"
                  type="text"
                  inputmode="numeric"
                  autocomplete="one-time-code"
                  maxlength="8"
                  placeholder="Introduce el código"
                  class="min-w-0 flex-1 border-0 bg-transparent px-4 py-3 text-sm text-slate-900 outline-none
                         placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                />
                <div class="w-px self-stretch bg-slate-200 dark:bg-white/10" aria-hidden="true" />
                <button
                  type="button"
                  class="shrink-0 px-4 py-3 text-sm font-semibold text-[#007BFF] transition hover:text-brand-600
                         dark:text-blue-400 dark:hover:text-blue-300"
                  @click="continueWithEmail"
                >
                  Enviar Código
                </button>
              </div>
            </div>
  
            <button
              v-if="!codeStepActive"
              type="button"
              class="w-full rounded-xl bg-[#007BFF] px-4 py-3 font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isStartingLogin"
              @click="continueWithEmail"
            >
              {{ isStartingLogin ? 'Enviando código...' : 'Continuar con correo electrónico' }}
            </button>
  
            <button
              v-else
              type="submit"
              class="w-full rounded-xl bg-[#007BFF] px-4 py-3 font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="!isCodeValid || isVerifyingLogin"
            >
              {{ isVerifyingLogin ? 'Verificando código...' : 'Continuar con código' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed, ref } from 'vue'
import { parsePasswordlessLoginEmail } from '../schemas/passwordless-login.schema'
import { useAuthStore } from '../store/auth.store'
  
  const email = ref('')
  const verificationCode = ref('')
  const codeStepActive = ref(false)
  const errorMessage = ref('')
  const emailError = ref('')
  const isStartingLogin = ref(false)
  const isVerifyingLogin = ref(false)

  const authStore = useAuthStore()

  const passwordlessLogin = async () => {
    await authStore.passwordlessLogin(email.value.trim())
  }
  
  const passwordlessLoginVerify = async () => {
    await authStore.passwordlessLoginVerify(email.value.trim(), verificationCode.value.trim())
  }

  const isCodeValid = computed(() => verificationCode.value.trim().length >= 4)

  function validateEmailField() {
    const emailValidation = parsePasswordlessLoginEmail({ email: email.value })

    if (!emailValidation.success) {
      emailError.value = emailValidation.emailError
      return false
    }

    emailError.value = ''
    return true
  }
  
  async function continueWithEmail() {
    if (!validateEmailField()) return

    if (isStartingLogin.value) return

    errorMessage.value = ''
    emailError.value = ''
    isStartingLogin.value = true

    try {
      await passwordlessLogin()
      codeStepActive.value = true
      verificationCode.value = ''
    } catch {
      errorMessage.value = 'Codigo de usuario no es valido'
    } finally {
      isStartingLogin.value = false
    }
  }
  
  async function continueWithCode() {
    if (!isCodeValid.value || isVerifyingLogin.value) return

    errorMessage.value = ''
    isVerifyingLogin.value = true

    try {
      await passwordlessLoginVerify()
      await navigateTo('/backoffice/dashboard')
    } catch {
      errorMessage.value = 'Codigo de usuario no es valido'
    } finally {
      isVerifyingLogin.value = false
    }
  }
  </script>
  
