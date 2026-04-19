type CdnOpts = {
  w?: number
  h?: number
  q?: number
  fmt?: 'webp' | 'jpeg' | 'png' | 'avif'
}

export const getCdnUrl = (url?: string, opts: CdnOpts = {}) => {
  if (!url) return ''
  const params: string[] = []
  if (opts.w) params.push(`w=${opts.w}`)
  if (opts.h) params.push(`h=${opts.h}`)
  if (opts.q) params.push(`q=${opts.q}`)
  if (opts.fmt) params.push(`fmt=${opts.fmt}`)
  const query = params.length ? (url.includes('?') ? `&${params.join('&')}` : `?${params.join('&')}`) : ''
  return `${url}${query}`
}

