export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'corp-secret-key-change-in-production',
    databaseUrl: process.env.DATABASE_URL,
    public: {}
  },
  app: {
    head: {
      title: 'АвтоУчёт — Система путевых листов',
      meta: [{ name: 'description', content: 'Корпоративная система учёта путевых листов и топлива' }],
    }
  }
})
