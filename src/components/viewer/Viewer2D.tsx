import { useMemo } from 'react'

interface Viewer2DProps {
  svgContent: string
  className?: string
}

/**
 * Renders a Maker.js SVG string with pan/zoom support via CSS
 */
export function Viewer2D({ svgContent, className = '' }: Viewer2DProps) {
  const processedSvg = useMemo(() => {
    // Inject viewBox-based responsive sizing if not present
    return svgContent
      .replace(/<svg /, '<svg style="width:100%;height:100%;max-height:600px" ')
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
      className={`overflow-auto bg-white border rounded-lg p-4 ${className}`}
      dangerouslySetInnerHTML={{ __html: processedSvg }}
    />
  )
}
