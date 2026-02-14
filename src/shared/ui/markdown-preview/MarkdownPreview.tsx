import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";
import "./MarkdownPreview.css";

type MarkdownPreviewProps = { value: string };

export function MarkdownPreview({ value }: MarkdownPreviewProps) {
    return (
        <div className="md-preview">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeHighlight]}
            >
                {value}
            </ReactMarkdown>
        </div>
    );
}
