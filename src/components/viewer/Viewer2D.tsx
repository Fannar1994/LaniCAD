import { useMemo } from 'react'
import DOMPurify from 'dompurify'

interface Viewer2DProps {
  svgContent: string
  className?: string
}

/**
 * Renders a Maker.js SVG string with responsive sizing
 */
export function Viewer2D({ svgContent, className = '' }: Viewer2DProps) {
  const processedSvg = useMemo(() => {
    if (!svgContent) return ''
    // Ensure the SVG fills the container responsively
    const styled = svgContent
      .replace(/<svg /, '<svg style="width:100%;height:auto;max-height:700px;display:block;margin:0 auto" ')
    return DOMPurify.sanitize(styled, { USE_PROFILES: { svg: true, svgFilters: true }, ADD_TAGS: ['style'] })
  }, [svgContent])

  if (!svgContent) {
    return (
      <div className={`flex items-center justify-center h-[500px] bg-white border rounded-lg ${className}`}>
        <p className="text-gray-400">Engin teikning — stilltu breytur til að sjá 2D uppdrátt</p>
      </div>
    )
  }

  return (
    <div
      className={`overflow-auto bg-white border rounded-lg p-6 min-h-[400px] ${className}`}
      dangerouslySetInnerHTML={{ __html: processedSvg }}
    />
  )
}
