import type MarkdownIt from 'markdown-it'

const fallbackEscape = (code: string) =>
  code
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

export const highlightSourceCode = (md: MarkdownIt, code: string, lang = 'vue') => {
  const highlight = md.options.highlight
  if (typeof highlight === 'function') {
    return highlight(code, lang, '')
  }

  return `<pre class="vp-code"><code>${fallbackEscape(code)}</code></pre>`
}
