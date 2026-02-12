import ReactMarkdown from "react-markdown";

type MarkdownPreviewProps = {
    value: string;
};

export function MarkdownPreview({ value }: MarkdownPreviewProps) {
    return (
        <div style={{ height: "100dvh", overflow: "auto", padding: 12 }}>
            <ReactMarkdown>{value}</ReactMarkdown>
        </div>
    );
}
