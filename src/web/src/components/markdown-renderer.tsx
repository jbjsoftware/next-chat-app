import { Copy, CopyCheck } from "lucide-react";
import React, { memo } from "react";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  materialLight,
  materialDark,
} from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Button } from "./ui/button";

function CodeCopyBtn({ children }: any) {
  const [copyOk, setCopyOk] = React.useState(false);

  const handleClick = () => {
    navigator.clipboard.writeText(children);
    setCopyOk(true);
    toast.success("Copied to clipboard", {
      duration: 500,
    });

    setTimeout(() => {
      setCopyOk(false);
    }, 500);
  };
  return (
    <Button
      variant="outline"
      className="z-1 flex cursor-pointer gap-2"
      onClick={handleClick}
      size="sm"
    >
      {copyOk ? (
        <>
          <CopyCheck />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy />
          <span>Copy</span>
        </>
      )}
    </Button>
  );
}

const remarkPlugins = [remarkGfm];
const rehypePlugins = [rehypeRaw];

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  const { resolvedTheme } = useTheme();

  const syntaxTheme = resolvedTheme === "dark" ? materialDark : materialLight;

  const code = ({ inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <SyntaxHighlighter
        {...props}
        style={syntaxTheme}
        language={(match && match[1]) || "js"}
        PreTag="section"
        wrapLines={true}
        wrapLongLines={true}
        customStyle={{
          margin: "0",
          padding: "0.8rem",
          borderBottomLeftRadius: ".8rem",
          borderBottomRightRadius: ".8rem",
          fontSize: "0.85rem",
        }}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  };

  const pre = ({ node, children, ...props }: any) => {
    return (
      <pre {...props} className="relative">
        <div className="relative my-6 rounded-2xl border-2">
          <header className="flex items-center justify-between border-b p-2">
            <span className="ps-1 text-xs text-muted-foreground">
              {node.children[0].properties?.className &&
                node.children[0].properties?.className[0]?.replace(
                  "language-",
                  "",
                )}
            </span>
            <CodeCopyBtn>{children?.props?.children}</CodeCopyBtn>
          </header>
          {children}
        </div>
      </pre>
    );
  };

  return (
    <div className="w-full">
      <ReactMarkdown
        components={{ code, pre }}
        rehypePlugins={rehypePlugins}
        remarkPlugins={remarkPlugins}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};

const MarkdownRenderer = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

export default MarkdownRenderer;
