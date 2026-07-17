'use client';
import React from 'react';

interface HTMLTextProps {
  html: string;
  className?: string;
}

export default function HTMLText({ html, className }: HTMLTextProps) {
  const renderedContent = React.useMemo(() => {
    if (!html || !html.includes('<')) return html;

    const result: React.ReactNode[] = [];
    const cleaned = html.replace(/\s+/g, ' ').trim();
    let lastEnd = 0;

    for (const match of cleaned.matchAll(/<strong>([^<]+)<\/strong>/gi)) {
      if (match.index && match.index > lastEnd) {
        const preText = cleaned.slice(lastEnd, match.index!).trim();
        if (preText) result.push(preText);
      }

      if (match[1]) {
        result.push(<strong key={match.index}>{match[1]}</strong>);
      }

      lastEnd = Number(match.index) + match[0].length;
    }

    if (lastEnd < cleaned.length) {
      const postText = cleaned.slice(lastEnd).trim();
      if (postText) result.push(postText);
    }

    return result.length > 0 ? result : html;
  }, [html]);

  return <span className={className}>{renderedContent}</span>;
}
