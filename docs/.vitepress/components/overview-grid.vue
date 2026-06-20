<template>
  <section class="falcon-overview vp-raw">
    <p class="falcon-overview__description">{{ texts.description }}</p>

    <label class="falcon-overview__search" for="falcon-overview-search">
      <span class="falcon-overview__search-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path
            d="m21 21-4.3-4.3m1.8-5.2a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8" />
        </svg>
      </span>
      <input
        id="falcon-overview-search"
        v-model.trim="keyword"
        type="search"
        autocomplete="off"
        spellcheck="false"
        :placeholder="texts.searchPlaceholder" />
    </label>

    <template v-if="hasResults">
      <section v-for="group in filteredGroups" :key="group.key" class="falcon-overview__group">
        <header class="falcon-overview__group-header">
          <h2 class="falcon-overview__group-title">{{ group.localizedTitle }}</h2>
          <span class="falcon-overview__group-count">{{ group.items.length }}</span>
        </header>

        <div class="falcon-overview__grid">
          <a
            v-for="item in group.items"
            :key="item.name"
            class="falcon-overview-card"
            :href="withBase(toLocalizedLink(item.link))">
            <div class="falcon-overview-card__header">
              <span class="falcon-overview-card__title">{{ localizedItemTitle(item) }}</span>
              <span v-if="item.version" class="falcon-overview-card__version">{{
                item.version
              }}</span>
            </div>
            <div class="falcon-overview-card__preview">
              <img
                :src="withBase(item.icon)"
                :alt="`${item.name} ${texts.previewAltSuffix}`"
                loading="lazy" />
            </div>
          </a>
        </div>
      </section>
    </template>

    <p v-else class="falcon-overview__empty">{{ texts.empty }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData, withBase } from 'vitepress'
import { overviewComponentGroups, overviewComponents } from '../data/overview-components'
import type { OverviewItem } from '../data/overview-components'

const keyword = ref('')
const { localeIndex } = useData()

const isEnglish = computed(() => localeIndex.value === 'en')
const normalizedKeyword = computed(() => keyword.value.trim().toLowerCase())
const texts = computed(() =>
  isEnglish.value
    ? {
        description: 'Quick entry points for all published components.',
        empty: 'No matching components. Try another keyword.',
        previewAltSuffix: 'preview',
        searchPlaceholder: 'Search components'
      }
    : {
        description: '所有已发布组件的快速入口。',
        empty: '未找到匹配组件，请调整关键词后重试。',
        previewAltSuffix: '预览图',
        searchPlaceholder: '搜索组件'
      }
)

const filteredGroups = computed(() =>
  overviewComponentGroups
    .map((group) => ({
      ...group,
      localizedTitle: isEnglish.value ? group.titleEn : group.title,
      items: overviewComponents.filter((item) => {
        if (item.group !== group.key) {
          return false
        }

        if (!normalizedKeyword.value) {
          return true
        }

        const title = localizedItemTitle(item)
        const description = isEnglish.value ? item.descriptionEn : item.description
        const searchableText = `${item.name} ${title} ${description}`.toLowerCase()
        return searchableText.includes(normalizedKeyword.value)
      })
    }))
    .filter((group) => group.items.length > 0)
)

const hasResults = computed(() => filteredGroups.value.length > 0)
const localizedItemTitle = (item: OverviewItem) => (isEnglish.value ? item.titleEn : item.title)
const toLocalizedLink = (link: string) => (isEnglish.value ? `/en${link}` : link)
</script>

<style scoped>
.falcon-overview {
  margin-top: 14px;
}

.falcon-overview__description {
  margin: 0 0 16px;
  color: var(--vp-c-text-2);
}

.falcon-overview__search {
  position: sticky;
  top: calc(var(--vp-nav-height, 64px) + 8px);
  z-index: 19;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  box-shadow: 0 8px 18px rgb(0 0 0 / 8%);
  padding: 0 12px;
  transition: border-color 0.2s ease;
}

.falcon-overview__search:focus-within {
  border-color: var(--vp-c-brand-1);
}

.falcon-overview__search-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: var(--vp-c-text-3);
}

.falcon-overview__search-icon svg {
  width: 16px;
  height: 16px;
}

.falcon-overview__search input {
  width: 100%;
  height: 42px;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--vp-c-text-1);
}

.falcon-overview__search input::placeholder {
  color: var(--vp-c-text-3);
}

.falcon-overview__group {
  margin-top: 24px;
}

.falcon-overview__group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.VPDoc .falcon-overview__group-title {
  margin: 0;
  padding-top: 0;
  border-top: 0;
  font-size: 22px;
  line-height: 1.2;
}

.falcon-overview__group-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  border-radius: 999px;
  padding: 0 6px;
  background: color-mix(in srgb, var(--vp-c-brand-1) 24%, transparent);
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

.falcon-overview__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.falcon-overview-card {
  display: block;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  color: inherit;
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
  overflow: hidden;
}

.falcon-overview-card:hover {
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 55%, var(--vp-c-divider));
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgb(0 0 0 / 15%);
}

.falcon-overview-card:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.falcon-overview-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.falcon-overview-card__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.falcon-overview-card__version {
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 65%, transparent);
  border-radius: 999px;
  padding: 0 6px;
  color: var(--vp-c-brand-1);
  font-size: 11px;
  line-height: 18px;
}

.falcon-overview-card__preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 168px;
  padding: 18px 16px;
  background: linear-gradient(140deg, rgb(89 103 122 / 22%), rgb(50 57 69 / 12%));
}

.falcon-overview-card__preview img {
  display: block;
  width: 184px;
  max-width: 100%;
  height: auto;
  object-fit: contain;
}

.falcon-overview__empty {
  margin-top: 24px;
  color: var(--vp-c-text-2);
}

@media (max-width: 768px) {
  .falcon-overview__grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }

  .VPDoc .falcon-overview__group-title {
    font-size: 20px;
  }
}
</style>
