import { useEffect } from 'react'
import type { CSSProperties } from 'react'
import { Image, View } from '@tarojs/components'
import { ensureSpriteMounted, getIconDataUri, getIconViewBox, isH5Env, normalizeIconName } from './svg-sprite'

export interface IconProps {
  name: string
  size?: number | string
  color?: string
  className?: string
  onClick?: () => void
  style?: CSSProperties
}

const resolveSize = (size?: number | string) => {
  if (size === undefined || size === null) return '20px'
  if (typeof size === 'number') return `${size}px`
  const trimmed = size.trim()
  if (/^\d+$/.test(trimmed)) return `${trimmed}px`
  return trimmed
}

export const Icon = ({ name, size, color = 'currentColor', className = '', onClick, style }: IconProps) => {
  const iconName = normalizeIconName(name)
  const iconSize = resolveSize(size)

  useEffect(() => {
    if (isH5Env()) {
      ensureSpriteMounted()
    }
  }, [])

  if (isH5Env()) {
    const viewBox = getIconViewBox(iconName)
    return (
      <View
        className={`nut-icon ${className}`.trim()}
        style={{ width: iconSize, height: iconSize, color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }}
        onClick={onClick}
      >
        <svg width="100%" height="100%" viewBox={viewBox} aria-hidden="true">
          <use href={`#icon-${iconName}`} />
        </svg>
      </View>
    )
  }

  const src = getIconDataUri(iconName, color)
  return (
    <Image
      className={`nut-icon ${className}`.trim()}
      src={src}
      style={{ width: iconSize, height: iconSize, ...style }}
      mode="aspectFit"
      onClick={onClick}
    />
  )
}

export default Icon
