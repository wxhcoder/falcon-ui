<template>
  <div class="falcon-docs-layout">
    <VPSkipLink />

    <VPBackdrop :show="isSidebarOpen" @click="closeSidebar" />

    <header class="navbar">
      <div class="navbar-wrapper">
        <div class="header-container">
          <div class="logo-container">
            <a class="logo-link" :href="withBase(localeHomeLink)" aria-label="Falcon UI home">
              <img v-if="logoSrc" class="logo" :src="logoSrc" alt="" />
              <span v-else class="falcon-docs-layout__mark" />
              <span class="logo-text">{{ site.title }}</span>
            </a>
          </div>

          <div class="content">
            <VPNavBarSearch class="search" />
            <VPNavBarMenu class="menu" />
            <VPNavBarTranslations class="translations" />
            <VPNavBarAppearance class="appearance" />
            <VPNavBarSocialLinks class="social-links" />
            <VPNavBarHamburger
              :active="isScreenOpen"
              class="hamburger"
              @click="toggleScreen"
            />
          </div>
        </div>
      </div>

      <VPNavScreen :open="isScreenOpen" />
    </header>

    <VPLocalNav :open="isSidebarOpen" @open-menu="openSidebar" />

    <aside
      v-if="hasSidebar"
      id="VPSidebarNav"
      class="sidebar"
      :class="{ open: isSidebarOpen }"
    >
      <nav class="sidebar-groups" aria-label="Sidebar Navigation">
        <VPSidebarGroup :items="sidebar" />
      </nav>
    </aside>

    <main
      id="VPContent"
      class="page-content"
      :class="{ 'has-sidebar': hasSidebar }"
      tabindex="-1"
    >
      <div class="VPDoc doc-content-wrapper">
        <div class="doc-content-container">
          <Content
            class="vp-doc doc-content"
            :class="[
              pageName,
              theme.externalLinkIcon && 'external-link-icon-enabled',
            ]"
          />
          <VPDocFooter />
        </div>

        <aside v-if="hasOutline" class="toc-wrapper">
          <nav class="toc-content">
            <VPDocAsideOutline />
          </nav>
          <div class="toc-content-mask" />
        </aside>
      </div>

      <VPFooter />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { inBrowser, useData, useRoute, withBase } from 'vitepress'
import VPBackdrop from 'vitepress/dist/client/theme-default/components/VPBackdrop.vue'
import VPDocAsideOutline from 'vitepress/dist/client/theme-default/components/VPDocAsideOutline.vue'
import VPDocFooter from 'vitepress/dist/client/theme-default/components/VPDocFooter.vue'
import VPFooter from 'vitepress/dist/client/theme-default/components/VPFooter.vue'
import VPLocalNav from 'vitepress/dist/client/theme-default/components/VPLocalNav.vue'
import VPNavBarAppearance from 'vitepress/dist/client/theme-default/components/VPNavBarAppearance.vue'
import VPNavBarHamburger from 'vitepress/dist/client/theme-default/components/VPNavBarHamburger.vue'
import VPNavBarMenu from 'vitepress/dist/client/theme-default/components/VPNavBarMenu.vue'
import VPNavBarSearch from 'vitepress/dist/client/theme-default/components/VPNavBarSearch.vue'
import VPNavBarSocialLinks from 'vitepress/dist/client/theme-default/components/VPNavBarSocialLinks.vue'
import VPNavBarTranslations from 'vitepress/dist/client/theme-default/components/VPNavBarTranslations.vue'
import VPNavScreen from 'vitepress/dist/client/theme-default/components/VPNavScreen.vue'
import VPSidebarGroup from 'vitepress/dist/client/theme-default/components/VPSidebarGroup.vue'
import VPSkipLink from 'vitepress/dist/client/theme-default/components/VPSkipLink.vue'
import {
  useCloseSidebarOnEscape,
  useSidebar,
} from 'vitepress/dist/client/theme-default/composables/sidebar.js'

const route = useRoute()
const { frontmatter, page, site, theme } = useData()
const { close: closeSidebar, hasSidebar, isOpen: isSidebarOpen, open: openSidebar, sidebar } =
  useSidebar()

const isScreenOpen = ref(false)
const pageName = computed(() =>
  route.path.replace(/[./]+/g, '_').replace(/_html$/, '')
)
const localeHomeLink = computed(() => (route.path.startsWith('/en/') ? '/en/' : '/'))
const logoSrc = computed(() =>
  typeof theme.value.logo === 'string' ? withBase(theme.value.logo) : ''
)
const hasOutline = computed(() => frontmatter.value.outline !== false)

const closeScreen = () => {
  isScreenOpen.value = false
}

const toggleScreen = () => {
  isScreenOpen.value = !isScreenOpen.value
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeScreen()
  }
}

watch(
  () => route.path,
  () => {
    closeSidebar()
    closeScreen()
  }
)

useCloseSidebarOnEscape(isSidebarOpen, closeSidebar)

onMounted(() => {
  if (inBrowser) {
    window.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  if (inBrowser) {
    window.removeEventListener('keydown', handleKeydown)
  }
})
</script>
