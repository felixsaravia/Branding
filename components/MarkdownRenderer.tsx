import React from 'react';

const renderLine = (line: string) => {
  const processedLine = line
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');
  return processedLine;
}

export const MarkdownRenderer: React.FC<{ text: string; className?: string }> = ({ text, className = "mt-6 p-6 bg-slate-50 rounded-lg border border-slate-200" }) => {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc space-y-1 pl-5 my-3">
          {listItems.map((item, index) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: renderLine(item) }} />
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    if (line.trim().startsWith('### ')) {
      flushList();
      elements.push(<h4 key={index} className="text-lg font-bold text-indigo-700 my-4" dangerouslySetInnerHTML={{ __html: renderLine(line.substring(4).trim()) }} />);
    } else if (line.trim().startsWith('* ')) {
      listItems.push(line.trim().substring(2));
    } else if (line.trim() !== '') {
      flushList();
      elements.push(<p key={index} className="my-2" dangerouslySetInnerHTML={{ __html: renderLine(line) }} />);
    }
  });

  flushList();

  return (
    <div className={`${className} text-slate-700 leading-relaxed`}>
        {elements}
    </div>
  );
};