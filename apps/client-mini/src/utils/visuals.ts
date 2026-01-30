/**
 * 生成清爽、现代、3D 插画风格的 SVG 占位图
 * 用于模拟回收场景中的各类物品
 */

export const getPlaceholderSvg = (type: 'book' | 'clothes' | 'electronics' | 'article', width: number, height: number) => {
    const configs = {
        book: {
            primary: '#E3F2FD',
            secondary: '#BBDEFB',
            accent: '#2196F3',
            elements: `
        <!-- 书本 3D 叠放 -->
        <g transform="translate(${width * 0.5}, ${height * 0.6})">
          <path d="M-60,0 L0,30 L60,0 L0,-30 Z" fill="#BBDEFB" />
          <path d="M-60,0 L-60,15 L0,45 L0,30 Z" fill="#90CAF9" />
          <path d="M0,30 L0,45 L60,15 L60,0 Z" fill="#64B5F6" />
          
          <path d="M-60,-20 L0,10 L60,-20 L0,-50 Z" fill="#E3F2FD" />
          <path d="M-60,-20 L-60,-5 L0,25 L0,10 Z" fill="#BBDEFB" />
          <path d="M0,10 L0,25 L60,-5 L60,-20 Z" fill="#90CAF9" />
          
          <!-- 小植物 -->
          <circle cx="40" cy="-40" r="15" fill="#A5D6A7" opacity="0.8" />
          <rect x="38" y="-30" width="4" height="20" fill="#8D6E63" />
        </g>
      `
        },
        clothes: {
            primary: '#E8F5E9',
            secondary: '#C8E6C9',
            accent: '#4CAF50',
            elements: `
        <!-- 衣物 3D 叠放 -->
        <g transform="translate(${width * 0.5}, ${height * 0.6})">
          <rect x="-40" y="-30" width="80" height="40" rx="10" fill="#C8E6C9" transform="skewY(-10)" />
          <rect x="-35" y="-45" width="80" height="40" rx="10" fill="#E8F5E9" transform="skewY(-10)" />
          <circle cx="20" cy="-20" r="8" fill="#FFCDD2" opacity="0.6" />
        </g>
      `
        },
        electronics: {
            primary: '#F3E5F5',
            secondary: '#E1BEE7',
            accent: '#9C27B0',
            elements: `
        <!-- 电子产品 3D 风格 -->
        <g transform="translate(${width * 0.5}, ${height * 0.55})">
          <rect x="-30" y="-50" width="60" height="100" rx="8" fill="#E1BEE7" transform="rotate(-15)" />
          <rect x="-25" y="-45" width="50" height="90" rx="4" fill="#F3E5F5" transform="rotate(-15)" />
          <circle cx="10" cy="35" r="5" fill="#CE93D8" transform="rotate(-15)" />
        </g>
      `
        },
        article: {
            primary: '#FFF3E0',
            secondary: '#FFE0B2',
            accent: '#FF9800',
            elements: `
        <!-- 文章配图 3D 风格 -->
        <g transform="translate(${width * 0.5}, ${height * 0.5})">
          <rect x="-40" y="-30" width="80" height="60" rx="4" fill="#FFE0B2" />
          <rect x="-30" y="-10" width="60" height="4" rx="2" fill="#FFB74D" />
          <rect x="-30" y="5" width="40" height="4" rx="2" fill="#FFB74D" />
          <circle cx="30" cy="-40" r="10" fill="#FFF3E0" />
        </g>
      `
        }
    }

    const selected = configs[type] || configs.book

    const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad_${type}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${selected.primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${selected.secondary};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad_${type})" />
      ${selected.elements}
      <!-- 装饰性漂浮物 -->
      <circle cx="20" cy="20" r="5" fill="white" opacity="0.3" />
      <circle cx="${width - 40}" cy="${height - 40}" r="10" fill="white" opacity="0.2" />
    </svg>
  `.trim()

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
