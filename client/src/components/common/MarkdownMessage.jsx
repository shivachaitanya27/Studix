import React from 'react';

/**
 * Custom lightweight, secure, and beautiful Markdown parser for AI academic responses.
 * Renders headings, bold text, bullet points, blockquotes, inline code, and code/ASCII blocks.
 */
export const MarkdownMessage = ({ content }) => {
  if (!content) return null;

  // Split into lines for structured block rendering
  const lines = content.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeBlockLines = [];
  let codeLanguage = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block fences
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        elements.push(
          <div
            key={`code-${i}`}
            className="my-3 rounded-2xl bg-slate-950/80 border border-slate-700/50 p-3.5 overflow-x-auto font-mono text-[11px] text-emerald-300 shadow-inner"
          >
            {codeLanguage && (
              <div className="text-[9px] font-bold uppercase text-slate-500 mb-1 border-b border-slate-800 pb-1">
                {codeLanguage}
              </div>
            )}
            <pre className="leading-relaxed whitespace-pre font-mono">
              {codeBlockLines.join('\n')}
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBlockLines = [];
        codeLanguage = '';
      } else {
        // Start of code block
        inCodeBlock = true;
        codeLanguage = line.trim().replace('```', '');
        codeBlockLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Triple Asterisk Highlights / Decorative Dividers (*** ...)
    if (line.trim().startsWith('***') || line.trim() === '---') {
      const bannerText = line.replace(/^\*{3,}/, '').replace(/\*{3,}$/, '').trim();
      if (bannerText) {
        elements.push(
          <div
            key={`banner-${i}`}
            className="my-3.5 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-brand-500/20 to-indigo-500/20 border border-amber-400/40 text-amber-300 font-extrabold text-xs sm:text-sm tracking-wide flex items-center justify-center space-x-2 shadow-md"
          >
            <span>✨</span>
            <span>{bannerText}</span>
            <span>✨</span>
          </div>
        );
      } else {
        elements.push(
          <div
            key={`banner-${i}`}
            className="my-3 flex items-center justify-center space-x-2 text-brand-400/60"
          >
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-brand-500/40" />
            <span className="text-xs">⚡ ✦ ⚡</span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-brand-500/40" />
          </div>
        );
      }
      continue;
    }

    // Exam Part-A / Part-B Section Detection (e.g. Part-A 2 Marks, Part-B 10 Marks)
    if (/^(part[-\s]?[a-c]|section[-\s]?[a-c])/i.test(line.trim())) {
      const isPartA = /part[-\s]?a/i.test(line);
      const isPartB = /part[-\s]?b/i.test(line);
      elements.push(
        <div
          key={`part-${i}`}
          className={`my-3.5 p-3 rounded-2xl border text-sm sm:text-base font-black flex items-center justify-between shadow-md ${
            isPartA
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              : isPartB
              ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
              : 'bg-brand-500/15 border-brand-500/40 text-brand-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span>{isPartA ? '⚡' : isPartB ? '📚' : '🎯'}</span>
            <span className="uppercase tracking-wide">{formatInline(line)}</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-black/40 border border-white/10">
            {isPartA ? 'Short Answer / 2M' : isPartB ? 'Essay / 10-16M' : 'Curriculum Spec'}
          </span>
        </div>
      );
      continue;
    }

    // Heading 1 (# ...)
    if (line.startsWith('# ')) {
      elements.push(
        <h2
          key={`h1-${i}`}
          className="text-lg sm:text-xl font-black text-white mt-4 mb-2 flex items-center space-x-2 border-b border-slate-700/40 pb-1.5"
        >
          {formatInline(line.replace('# ', ''))}
        </h2>
      );
      continue;
    }

    // Heading 2 (## ...)
    if (line.startsWith('## ')) {
      elements.push(
        <h3
          key={`h2-${i}`}
          className="text-base sm:text-lg font-extrabold text-brand-300 mt-3.5 mb-1.5 flex items-center space-x-1.5"
        >
          {formatInline(line.replace('## ', ''))}
        </h3>
      );
      continue;
    }

    // Heading 3 (### ...)
    if (line.startsWith('### ')) {
      elements.push(
        <h4
          key={`h3-${i}`}
          className="text-sm sm:text-base font-bold text-amber-300 mt-3 mb-1 flex items-center space-x-1.5"
        >
          {formatInline(line.replace('### ', ''))}
        </h4>
      );
      continue;
    }

    // Blockquote (> ...)
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-2.5 pl-3.5 py-1.5 border-l-4 border-brand-400 bg-brand-500/10 rounded-r-xl text-xs sm:text-sm text-slate-200 italic leading-relaxed"
        >
          {formatInline(line.replace('> ', ''))}
        </blockquote>
      );
      continue;
    }

    // Bulleted list item (- * •)
    if (/^\s*[-*•]\s+/.test(line)) {
      const text = line.replace(/^\s*[-*•]\s+/, '');
      elements.push(
        <div
          key={`li-${i}`}
          className="flex items-start space-x-2.5 my-1.5 pl-1 text-xs sm:text-sm text-slate-200"
        >
          <span className="text-brand-400 mt-1 flex-shrink-0 text-[10px]">●</span>
          <span className="leading-relaxed">{formatInline(text)}</span>
        </div>
      );
      continue;
    }

    // Numbered list item (1. ...)
    if (/^\s*\d+\.\s+/.test(line)) {
      const match = line.match(/^\s*(\d+)\.\s+(.*)/);
      if (match) {
        elements.push(
          <div
            key={`ol-${i}`}
            className="flex items-start space-x-2.5 my-1.5 pl-1 text-xs sm:text-sm text-slate-200"
          >
            <span className="px-2 py-0.5 rounded-lg neu-pressed text-[11px] font-extrabold text-brand-300 mt-0.5 flex-shrink-0">
              {match[1]}
            </span>
            <span className="leading-relaxed">{formatInline(match[2])}</span>
          </div>
        );
        continue;
      }
    }

    // Empty line / paragraph break
    if (!line.trim()) {
      elements.push(<div key={`br-${i}`} className="h-2" />);
      continue;
    }

    // Standard paragraph line
    elements.push(
      <p key={`p-${i}`} className="text-xs sm:text-sm leading-relaxed text-slate-200 my-1">
        {formatInline(line)}
      </p>
    );
  }

  return <div className="space-y-1 text-xs sm:text-sm text-slate-200">{elements}</div>;
};

/**
 * Parses inline formatting: **bold**, `inline code`, and *italics*
 */
function formatInline(text) {
  if (!text) return '';

  // Tokenize bold, code, italics
  const parts = [];
  const regex = /(\*\*.*?\*\*|`.*?`|\*.*?\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-extrabold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 rounded-md bg-slate-900 border border-slate-700/50 font-mono text-[10px] text-amber-300"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-slate-300">
          {token.slice(1, -1)}
        </em>
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export default MarkdownMessage;
