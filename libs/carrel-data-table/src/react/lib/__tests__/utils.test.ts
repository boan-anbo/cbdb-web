import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('cn utility', () => {
  it('should merge class names', () => {
    const result = cn('foo', 'bar')
    expect(result).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    const result = cn('foo', false && 'bar', 'baz')
    expect(result).toBe('foo baz')
  })

  it('should handle undefined and null', () => {
    const result = cn('foo', undefined, null, 'bar')
    expect(result).toBe('foo bar')
  })

  it('should merge tailwind classes correctly', () => {
    const result = cn('px-2 py-1', 'px-4')
    expect(result).toBe('py-1 px-4')
  })

  it('should handle arrays', () => {
    const result = cn(['foo', 'bar'], 'baz')
    expect(result).toBe('foo bar baz')
  })

  it('should handle objects', () => {
    const result = cn({ foo: true, bar: false, baz: true })
    expect(result).toBe('foo baz')
  })

  it('should override conflicting tailwind classes', () => {
    const result = cn('text-red-500', 'text-blue-500')
    expect(result).toBe('text-blue-500')
  })

  it('should preserve non-conflicting classes', () => {
    const result = cn('text-red-500 font-bold', 'text-blue-500')
    expect(result).toBe('font-bold text-blue-500')
  })

  it('should handle complex tailwind merging', () => {
    const result = cn(
      'bg-gray-100 hover:bg-gray-200',
      'bg-blue-100'
    )
    expect(result).toBe('hover:bg-gray-200 bg-blue-100')
  })

  it('should handle empty input', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should handle mixed input types', () => {
    const result = cn(
      'base',
      ['array-class'],
      { 'object-class': true },
      undefined,
      'final'
    )
    expect(result).toBe('base array-class object-class final')
  })

  it('should handle responsive tailwind classes', () => {
    const result = cn('md:px-4', 'md:px-8')
    expect(result).toBe('md:px-8')
  })

  it('should handle state variants', () => {
    const result = cn(
      'hover:bg-gray-100 focus:bg-gray-200',
      'hover:bg-blue-100'
    )
    expect(result).toBe('focus:bg-gray-200 hover:bg-blue-100')
  })

  it('should preserve important modifiers', () => {
    const result = cn('!text-red-500', 'text-blue-500')
    expect(result).toBe('!text-red-500 text-blue-500')
  })

  it('should handle arbitrary values', () => {
    const result = cn('w-[100px]', 'w-[200px]')
    expect(result).toBe('w-[200px]')
  })

  it('should handle negative values', () => {
    const result = cn('-mt-4', '-mt-8')
    expect(result).toBe('-mt-8')
  })
})