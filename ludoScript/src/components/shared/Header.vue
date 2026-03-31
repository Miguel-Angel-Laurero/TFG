<template>
    <div class="app-header" :class="{ dark: isDark }">
        <div class="header-brand">
            <Avatar 
                :image="'https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvbG9nby5wbmciLCJpYXQiOjE3NzM4MjM0MTQsImV4cCI6MTgwNTM1OTQxNH0.WY6B0Rp-ojvGR_WDYJF3BnDOyTRJJjAVSYpY_UpF9jg'" 
                size="medium" 
                shape="circle" 
            />
            <h1 class="brand-text font-righteous">
                LudoScript /&nbsp;
                <RouterLink to="/" class="brand-link">Home</RouterLink>
            </h1>
        </div>

        <div class="header-actions">
            <!-- Toggle dark/light -->
            <button class="theme-toggle" :title="isDark ? 'Modo claro' : 'Modo oscuro'" @click="toggleTheme">
                <!-- Sol (claro) -->
                <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="toggle-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
                <!-- Luna (oscuro) -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="toggle-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
            </button>
            <Menu/>
        </div>
    </div>
</template>

<script setup>
    import Menu from './Menu.vue';
    import Avatar from 'primevue/avatar';
    import { useTheme } from '@/composables/useTheme';

    const { isDark, toggleTheme } = useTheme();
</script>

<style scoped>
.app-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1.5rem;
  background: #ffffff;
  border-bottom: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: background 0.3s, border-color 0.3s;
}
.app-header.dark {
  background: #1a1d27;
  border-bottom-color: #2d3748;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.header-brand { display: flex; align-items: center; gap: 0.75rem; }

.brand-text {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
  letter-spacing: -0.01em;
  transition: color 0.3s;
  white-space: nowrap;
}
.app-header.dark .brand-text { color: #f1f5f9; }

.brand-link {
  color: #9ca3af;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}
.brand-link:hover { color: #facc15; }

.header-actions { display: flex; align-items: center; gap: 0.75rem; }

/* Theme toggle */
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.65rem;
  border: 1.5px solid #e5e7eb;
  background: #f9fafb;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
}
.theme-toggle:hover {
  background: #facc15;
  border-color: #facc15;
  transform: scale(1.07);
}
.app-header.dark .theme-toggle {
  background: #2d3748;
  border-color: #4a5568;
}
.app-header.dark .theme-toggle:hover {
  background: #1484a1;
  border-color: #1484a1;
}
.toggle-icon {
  width: 1.1rem;
  height: 1.1rem;
  color: #4b5563;
  transition: color 0.2s;
}
.theme-toggle:hover .toggle-icon { color: #1a1a2e; }
.app-header.dark .toggle-icon { color: #d1d5db; }
.app-header.dark .theme-toggle:hover .toggle-icon { color: #ffffff; }
</style>