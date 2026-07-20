import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  data: any;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(data, null, 2);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightJSON = (jsonStr: string): string => {
    // Escape HTML entities to prevent rendering issues
    const escaped = jsonStr
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Regexp matches JSON parts: strings, keys, numbers, booleans, nulls
    return escaped.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = 'text-slate-300';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-sky-400 font-semibold'; // JSON Key
          } else {
            cls = 'text-emerald-400'; // String value
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-purple-400 font-bold'; // Boolean
        } else if (/null/.test(match)) {
          cls = 'text-slate-500 italic'; // Null
        } else {
          cls = 'text-amber-400 font-mono'; // Number
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  const highlightedHtml = highlightJSON(jsonString);

  return (
    <div className="relative group bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-hidden shadow-inner">
      <div className="flex justify-between items-center px-4 py-2 border-b border-slate-900 bg-slate-950">
        <span className="text-xs font-semibold text-slate-500 font-mono">decision_payload.json</span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900/60 hover:bg-slate-900 border border-slate-800 transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed max-h-[480px]">
        <pre className="text-slate-300">
          <code dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
        </pre>
      </div>
    </div>
  );
};
