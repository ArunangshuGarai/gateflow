import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  block?: boolean;
  displayMode?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({ math, block = false, displayMode, className = '' }) => {
  const isBlock = displayMode !== undefined ? displayMode : block;
  const html = useMemo(() => {
    try {
      // Clean leading and trailing $ signs if present
      let cleanMath = math.trim();
      if (cleanMath.startsWith('$$') && cleanMath.endsWith('$$')) {
        cleanMath = cleanMath.slice(2, -2).trim();
      } else if (cleanMath.startsWith('$') && cleanMath.endsWith('$')) {
        cleanMath = cleanMath.slice(1, -1).trim();
      }

      return katex.renderToString(cleanMath, {
        displayMode: isBlock,
        throwOnError: false,
      });
    } catch (e) {
      return math;
    }
  }, [math, block]);

  return (
    <span
      className={`inline-block font-mono ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

/**
 * Text renderer that automatically detects $...$ and $$...$$ LaTeX blocks in normal text!
 */
export const FormattedMathText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const parts = useMemo(() => {
    if (!text) return [];
    // Split by $$...$$ or $...$
    const regex = /(\$\$[\s\S]+?\$\$|\$[^\$]+?\$)/g;
    const segments = text.split(regex);
    return segments.map((seg, idx) => {
      if (seg.startsWith('$$') && seg.endsWith('$$')) {
        return <MathView key={idx} math={seg} block={true} className="my-2 block text-center" />;
      }
      if (seg.startsWith('$') && seg.endsWith('$')) {
        return <MathView key={idx} math={seg} block={false} />;
      }
      return <span key={idx}>{seg}</span>;
    });
  }, [text]);

  return <div className={`whitespace-pre-wrap leading-relaxed ${className}`}>{parts}</div>;
};
