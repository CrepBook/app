import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css"; // выбери тему

type MarkdownPreviewProps = { value: string };

export function MarkdownPreview({value}: MarkdownPreviewProps) {
    return (
        <div className="md-preview">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
            >
                {value}
            </ReactMarkdown>
        </div>
    );
}

