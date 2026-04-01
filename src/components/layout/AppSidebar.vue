<template>
  <transition name="sidebar-backdrop">
    <button
      v-if="open"
      type="button"
      class="sidebar-backdrop"
      aria-label="Close menu"
      @click="$emit('close')"
    ></button>
  </transition>

  <aside class="app-sidebar" :class="{ 'app-sidebar--open': open }">
    <div class="app-sidebar__brand">
      <router-link to="/admin/dashboard" class="app-sidebar__logo">
        <span>SMIS DEDRAS</span>
      </router-link>
      <button type="button" class="app-sidebar__close" @click="$emit('close')">×</button>
    </div>

    <nav class="app-sidebar__nav">
      <div v-for="section in sections" :key="section.title" class="app-sidebar__section">
        <p class="app-sidebar__section-title">{{ section.title }}</p>

        <router-link
          v-for="item in section.items"
          :key="item.to"
          :to="item.to"
          class="app-sidebar__link"
          active-class="app-sidebar__link--active"
        >
          <span class="app-sidebar__icon" v-html="item.icon"></span>
          <span>{{ item.label }}</span>
        </router-link>
      </div>
    </nav>
  </aside>
</template>

<script setup>
defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close'])

const sections = [
  {
    title: 'Navigation',
    items: [
      {
        label: 'Tableau de bord',
        to: '/admin/dashboard',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 13.2 12 4l9 9.2"/><path d="M5 10.8V20h14v-9.2"/></svg>',
      },
      {
        label: 'Beneficiaires',
        to: '/admin/beneficiaries',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/></svg>',
      },
      {
        label: 'Sponsors',
        to: '/admin/sponsors',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 4 7v6c0 4.6 3 8.8 8 10 5-1.2 8-5.4 8-10V7l-8-4Z"/><path d="m9 12 2 2 4-4"/></svg>',
      },
      /*{
        label: 'Parrainages',
        to: '/admin/sponsorships',
        icon:
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h10M7 13h6"/></svg>',
      },
      {
        label: 'Statistiques',
        to: '/admin/statistics',
        icon:
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M20 20v-3"/></svg>',
      },*/
    ],
  },
  {
    title: 'Referentiels',
    items: [
      {
        label: 'Pays',
        to: '/admin/countries',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18"/><path d="M12 3a15 15 0 0 0 0 18"/></svg>',
      },
      {
        label: 'Regions',
        to: '/admin/regions',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="m4 12 8 4 8-4"/><path d="m4 17 8 4 8-4"/></svg>',
      },
      {
        label: 'Communes',
        to: '/admin/communes',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 21V9l8-6 8 6v12"/><path d="M9 21v-6h6v6"/></svg>',
      },
      {
        label: 'Ecoles',
        to: '/admin/schools',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m2 8 10-5 10 5-10 5L2 8Z"/><path d="M6 10.5V15c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5"/></svg>',
      },
      {
        label: 'Profils familiaux',
        to: '/admin/family-profiles',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      },
      {
        label: "Types d'appui",
        to: '/admin/support-types',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14"/><path d="M5 12h14"/><rect x="3" y="3" width="18" height="18" rx="4"/></svg>',
      },
    ],
  },
]
</script>
