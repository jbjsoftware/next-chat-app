import { CheckSquare, Copy } from "lucide-react";
import React from "react";
import rehypeRaw from "rehype-raw";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";

function CodeCopyBtn({ children }: any) {
  const [copyOk, setCopyOk] = React.useState(false);
  const icon = copyOk ? <CheckSquare /> : <Copy />;

  const handleClick = (_e: any) => {
    navigator.clipboard.writeText(children);
    setCopyOk(true);
    setTimeout(() => {
      setCopyOk(false);
    }, 500);
  };
  return (
    <button
      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      onClick={handleClick}
    >
      {icon}
    </button>
  );
}

interface MarkdownRendererProps {
  content: string; // Required prop for the markdown content (e.g., YAML in a code block)
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const syntaxTheme = dracula;

  const Pre = ({ children, ...props }: any) => (
    <pre {...props} className="relative">
      <CodeCopyBtn>{children}</CodeCopyBtn>
      {children}
    </pre>
  );
  const MarkdownComponents: object = {
    pre: Pre,
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter
          {...props}
          children={String(children).replace(/\n$/, "")}
          style={syntaxTheme}
          language={(match && match[1]) || "js"}
          PreTag="section"
        />
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <div className="w-full">
      <ReactMarkdown
        components={MarkdownComponents}
        rehypePlugins={[rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
