import Taro from '@tarojs/taro'

type IconDefinition = {
  viewBox: string
  body: (color: string) => string
}

const stroke = (color: string) =>
  `stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"`

const fill = (color: string) => `fill="${color}"`

const baseDefinitions: Record<string, IconDefinition> = {
  'arrow-right': {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M5 12h14"/><path ${stroke(color)} d="M12 5l7 7-7 7"/>`
  },
  'arrow-left': {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M19 12H5"/><path ${stroke(color)} d="M11 6l-6 6 6 6"/>`
  },
  'arrow-down': {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M12 5v14"/><path ${stroke(color)} d="M6 13l6 6 6-6"/>`
  },
  plus: {
    viewBox: '0 0 24 24',
    body: (color) => `<path ${stroke(color)} d="M12 5v14"/><path ${stroke(color)} d="M5 12h14"/>`
  },
  minus: {
    viewBox: '0 0 24 24',
    body: (color) => `<path ${stroke(color)} d="M5 12h14"/>`
  },
  close: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M6 6l12 12"/><path ${stroke(color)} d="M18 6l-12 12"/>`
  },
  check: {
    viewBox: '0 0 24 24',
    body: (color) => `<path ${stroke(color)} d="M5 12l4 4 10-10"/>`
  },
  'check-circle': {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<circle ${stroke(color)} cx="12" cy="12" r="9"/><path ${stroke(color)} d="M8 12l3 3 5-6"/>`
  },
  'info-circle': {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<circle ${stroke(color)} cx="12" cy="12" r="9"/><path ${stroke(color)} d="M12 10v6"/><circle ${fill(color)} cx="12" cy="7" r="1.4"/>`
  },
  'warning-circle': {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<circle ${stroke(color)} cx="12" cy="12" r="9"/><path ${stroke(color)} d="M12 7v6"/><circle ${fill(color)} cx="12" cy="17" r="1.4"/>`
  },
  'warning-triangle': {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M12 4l9 16H3z"/><path ${stroke(color)} d="M12 10v5"/><circle ${fill(color)} cx="12" cy="18" r="1.2"/>`
  },
  refresh: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M23 4v6h-6"/><path ${stroke(color)} d="M1 20v-6h6"/><path ${stroke(color)} d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>`
  },
  loading: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M12 2v4"/><path ${stroke(color)} d="M12 18v4"/><path ${stroke(color)} d="M4.93 4.93l2.83 2.83"/><path ${stroke(color)} d="M16.24 16.24l2.83 2.83"/><path ${stroke(color)} d="M2 12h4"/><path ${stroke(color)} d="M18 12h4"/><path ${stroke(color)} d="M4.93 19.07l2.83-2.83"/><path ${stroke(color)} d="M16.24 7.76l2.83-2.83"/>`
  },
  clock: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<circle ${stroke(color)} cx="12" cy="12" r="9"/><path ${stroke(color)} d="M12 7v5l4 2"/>`
  },
  download: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M12 4v10"/><path ${stroke(color)} d="M7 10l5 5 5-5"/><path ${stroke(color)} d="M5 20h14"/>`
  },
  edit: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M4 20h6"/><path ${stroke(color)} d="M14 4l6 6"/><path ${stroke(color)} d="M5 15l9-9 4 4-9 9H5z"/>`
  },
  'map-pin': {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M20 10c0 4-5 10-8 12-3-2-8-8-8-12a8 8 0 0116 0z"/><circle ${stroke(color)} cx="12" cy="10" r="3"/>`
  },
  order: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M9 2v2"/><path ${stroke(color)} d="M15 2v2"/><rect ${stroke(color)} x="3" y="6" width="18" height="16" rx="3"/><path ${stroke(color)} d="M8 12h8"/><path ${stroke(color)} d="M8 16h5"/>`
  },
  service: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M4 10a8 8 0 1116 0"/><path ${stroke(color)} d="M7 10v5a2 2 0 002 2h6a2 2 0 002-2v-5"/><circle ${stroke(color)} cx="9" cy="14" r="1.5"/><circle ${stroke(color)} cx="15" cy="14" r="1.5"/>`
  },
  setting: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<circle ${stroke(color)} cx="12" cy="12" r="3.2"/><path ${stroke(color)} d="M19.4 15a7.8 7.8 0 000-6"/><path ${stroke(color)} d="M4.6 9a7.8 7.8 0 000 6"/><path ${stroke(color)} d="M9 4.6a7.8 7.8 0 006 0"/><path ${stroke(color)} d="M15 19.4a7.8 7.8 0 01-6 0"/>`
  },
  money: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<rect ${stroke(color)} x="3" y="4" width="18" height="16" rx="3"/><path ${stroke(color)} d="M12 8v8"/><path ${stroke(color)} d="M15 10a3 3 0 00-3-3 3 3 0 00-3 3v4a3 3 0 003 3 3 3 0 003-3"/>`
  },
  // 叶子 - 减碳环保图标
  leaf: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M12 2C7 2 3 6 3 11c0 4 3 8 8 9 1 0 1-1 1-1v-2c0-1 1-2 2-2h2c3 0 5-2 5-5 0-5-4-8-9-8z"/><path ${stroke(color)} d="M12 22V11"/><path ${stroke(color)} d="M12 11c0-3 2-5 4-6"/>`
  },
  // 余额提现 - 钱包/提现图标
  wallet: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M19 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2z"/><path ${stroke(color)} d="M16 11a2 2 0 110 4 2 2 0 010-4z"/><path ${stroke(color)} d="M2 10V6a2 2 0 012-2h16"/>`
  },
  // 提现 - 带箭头的钱包
  withdraw: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<rect ${stroke(color)} x="2" y="6" width="20" height="14" rx="3"/><path ${stroke(color)} d="M17 11v2"/><circle ${stroke(color)} cx="17" cy="13" r="2.5"/><path ${stroke(color)} d="M6 3l3 3"/><path ${stroke(color)} d="M9 6V2"/><path ${stroke(color)} d="M9 6H5"/>`
  },
  // 设置 - 更现代的齿轮图标
  'settings-gear': {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<circle ${stroke(color)} cx="12" cy="12" r="3"/><path ${stroke(color)} d="M19.5 12c0-.3 0-.5-.1-.8l1.5-1.3a.5.5 0 00.1-.6l-1.4-2.5a.5.5 0 00-.6-.2l-1.8.7a6 6 0 00-1.4-.8l-.3-1.9a.5.5 0 00-.5-.4h-2.8a.5.5 0 00-.5.4l-.3 1.9a6 6 0 00-1.4.8l-1.8-.7a.5.5 0 00-.6.2L4.1 9.3a.5.5 0 00.1.6l1.5 1.3c0 .3-.1.5-.1.8s0 .5.1.8l-1.5 1.3a.5.5 0 00-.1.6l1.4 2.5a.5.5 0 00.6.2l1.8-.7c.4.3.9.6 1.4.8l.3 1.9a.5.5 0 00.5.4h2.8a.5.5 0 00.5-.4l.3-1.9a6 6 0 001.4-.8l1.8.7a.5.5 0 00.6-.2l1.4-2.5a.5.5 0 00-.1-.6l-1.5-1.3c0-.3.1-.5.1-.8z"/>`
  },
  // 交易记录 - 列表/账单图标
  transaction: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M4 6h16"/><path ${stroke(color)} d="M4 10h16"/><path ${stroke(color)} d="M4 14h10"/><path ${stroke(color)} d="M4 18h7"/><path ${stroke(color)} d="M16 15l2 2 4-4"/>`
  },
  'shopping-bag': {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M6 8h12l-1 12H7z"/><path ${stroke(color)} d="M9 8a3 3 0 016 0"/>`
  },
  'credit-card': {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<rect ${stroke(color)} x="3" y="6" width="18" height="12" rx="2"/><path ${stroke(color)} d="M3 10h18"/><path ${stroke(color)} d="M7 15h4"/>`
  },
  copy: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<rect ${stroke(color)} x="8" y="8" width="12" height="12" rx="2"/><path ${stroke(color)} d="M5 16V6a2 2 0 012-2h10"/>`
  },
  phone: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M6.5 4.5l3 1.5-1.5 3a12 12 0 006 6l3-1.5 1.5 3-2 2a3 3 0 01-3.2.7 16 16 0 01-7.1-4.6A16 16 0 014.8 7.7a3 3 0 01.7-3.2z"/>`
  },
  trash: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M4 7h16"/><path ${stroke(color)} d="M9 7V5h6v2"/><rect ${stroke(color)} x="6" y="7" width="12" height="13" rx="2"/><path ${stroke(color)} d="M10 11v6"/><path ${stroke(color)} d="M14 11v6"/>`
  },
  search: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<circle ${stroke(color)} cx="11" cy="11" r="6"/><path ${stroke(color)} d="M16.5 16.5L20 20"/>`
  },
  star: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M12 4l2.8 5.7 6.2.9-4.5 4.3 1 6.1-5.5-2.9-5.5 2.9 1-6.1-4.5-4.3 6.2-.9z"/>`
  },
  cart: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M5 6h2l2 10h8l2-7H9"/><circle ${fill(color)} cx="10" cy="19" r="1.3"/><circle ${fill(color)} cx="17" cy="19" r="1.3"/>`
  },
  tag: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M3 12l9 9 9-9-9-9H7z"/><circle ${fill(color)} cx="9" cy="9" r="1.5"/>`
  },
  photograph: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<rect ${stroke(color)} x="4" y="6" width="16" height="12" rx="2"/><circle ${stroke(color)} cx="12" cy="12" r="3.5"/><path ${stroke(color)} d="M8 6l1.5-2h5L16 6"/>`
  },
  notifications: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M12 4a5 5 0 00-5 5v4l-2 2h14l-2-2V9a5 5 0 00-5-5"/><path ${stroke(color)} d="M10 19a2 2 0 004 0"/>`
  },
  privacy: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M12 4l7 3v5c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V7z"/><path ${stroke(color)} d="M9.5 12l2 2 3-3"/>`
  },
  about: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<circle ${stroke(color)} cx="12" cy="12" r="9"/><path ${stroke(color)} d="M12 10v6"/><circle ${fill(color)} cx="12" cy="7" r="1.4"/>`
  },
  feedback: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M5 6h14v9H9l-4 4z"/><path ${stroke(color)} d="M8 10h8"/><path ${stroke(color)} d="M8 13h5"/>`
  },
  book: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path ${stroke(color)} d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>`
  },
  clothes: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M20.38 3.4a1.6 1.6 0 00-1.6-1.4H5.22a1.6 1.6 0 00-1.6 1.4l-1.6 6a1.6 1.6 0 001.6 1.9h1.38v10a1.6 1.6 0 001.6 1.6h10.8a1.6 1.6 0 001.6-1.6v-10h1.38a1.6 1.6 0 001.6-1.9l-1.6-6z"/>`
  },
  rank: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M8 21h8"/><path ${stroke(color)} d="M12 17v4"/><path ${stroke(color)} d="M7 4h10"/><path ${stroke(color)} d="M9 17v-4a2 2 0 012-2h2a2 2 0 012 2v4"/><path ${stroke(color)} d="M6 8v9"/><path ${stroke(color)} d="M18 8v9"/>`
  },
  poster: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<rect ${stroke(color)} x="3" y="3" width="18" height="18" rx="2"/><path ${stroke(color)} d="M3 15l4-4 4 4"/><path ${stroke(color)} d="M13 11l3-3 5 5"/><circle ${fill(color)} cx="8.5" cy="8.5" r="1.5"/>`
  },
  share: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M18 8a3 3 0 100-6 3 3 0 000 6z"/><path ${stroke(color)} d="M6 15a3 3 0 100-6 3 3 0 000 6z"/><path ${stroke(color)} d="M18 22a3 3 0 100-6 3 3 0 000 6z"/><path ${stroke(color)} d="M8.59 13.51l6.83 3.98"/><path ${stroke(color)} d="M15.41 6.51l-6.82 3.98"/>`
  },
  users: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<path ${stroke(color)} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle ${stroke(color)} cx="9" cy="7" r="4"/><path ${stroke(color)} d="M23 21v-2a4 4 0 00-3-3.87"/><path ${stroke(color)} d="M16 3.13a4 4 0 010 7.75"/>`
  },
  gift: {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<rect ${stroke(color)} x="3" y="8" width="18" height="4" rx="1"/><path ${stroke(color)} d="M12 8v13"/><path ${stroke(color)} d="M19 12v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7"/><path ${stroke(color)} d="M7.5 8a2.5 2.5 0 010-5 2.5 2.5 0 01.5 5z"/><path ${stroke(color)} d="M16.5 8a2.5 2.5 0 000-5 2.5 2.5 0 00-.5 5z"/>`
  },
  'qr-code': {
    viewBox: '0 0 24 24',
    body: (color) =>
      `<rect ${stroke(color)} x="3" y="3" width="7" height="7" rx="1"/><rect ${stroke(color)} x="14" y="3" width="7" height="7" rx="1"/><rect ${stroke(color)} x="3" y="14" width="7" height="7" rx="1"/><path ${stroke(color)} d="M14 14h7"/><path ${stroke(color)} d="M14 17h7"/><path ${stroke(color)} d="M14 20h7"/><path ${stroke(color)} d="M17 14v7"/>`
  }
}

const iconDefinitions: Record<string, IconDefinition> = { ...baseDefinitions }

const aliasMap: Record<string, string> = {
  back: 'arrow-left',
  add: 'plus',
  cross: 'close',
  success: 'check-circle',
  info: 'info-circle',
  tips: 'info-circle',
  warn: 'warning-triangle',
  warning: 'warning-circle',
  waiting: 'clock',
  location: 'map-pin',
  'map-pin': 'map-pin'
}

Object.keys(aliasMap).forEach((alias) => {
  const target = aliasMap[alias]
  if (target && baseDefinitions[target]) {
    iconDefinitions[alias] = baseDefinitions[target]
  }
})

export const normalizeIconName = (name: string) => aliasMap[name] || name

export const getIconViewBox = (name: string) => {
  const normalized = normalizeIconName(name)
  return iconDefinitions[normalized]?.viewBox || '0 0 24 24'
}

export const getIconDataUri = (name: string, color: string) => {
  const normalized = normalizeIconName(name)
  const def = iconDefinitions[normalized] ?? iconDefinitions['info-circle']!
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${def.viewBox}">${def.body(color)}</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const createSprite = () => {
  const symbols = Object.keys(iconDefinitions)
    .map((name) => {
      const def = iconDefinitions[name]!
      return `<symbol id="icon-${name}" viewBox="${def.viewBox}">${def.body('currentColor')}</symbol>`
    })
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden">${symbols}</svg>`
}

export const isH5Env = () => {
  const env = Taro.getEnv()
  return env === (Taro as any).ENV_TYPE?.WEB || env === (Taro as any).ENV_TYPE?.H5
}

export const ensureSpriteMounted = () => {
  if (!isH5Env()) return
  if (typeof document === 'undefined') return
  if (document.getElementById('app-icon-sprite')) return
  const container = document.createElement('div')
  container.id = 'app-icon-sprite'
  container.style.position = 'absolute'
  container.style.width = '0'
  container.style.height = '0'
  container.style.overflow = 'hidden'
  container.innerHTML = createSprite()
  if (document.body.prepend) {
    document.body.prepend(container)
  } else {
    document.body.insertBefore(container, document.body.firstChild)
  }
}
