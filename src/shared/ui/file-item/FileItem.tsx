import "./FileItem.css";

export type FileItemProps = {
    path: string;
    selected?: boolean;
    disabled?: boolean;
    onClick?: (path: string) => void;
    onDoubleClick?: (path: string) => void;
};

function prettyName(path: string) {
    const name = path.split(/[/\\]/).filter(Boolean).pop() ?? path;

    if (name.toLowerCase().endsWith(".md")) {
        return name.slice(0, -3); // убираем ".md"
    }

    return name;
}

export default function FileItem(
    {
        path,
        selected = false,
        disabled = false,
        onClick,
        onDoubleClick,
    }: FileItemProps,
) {
    const name = prettyName(path);

    return (
        <button
            type="button"
            className={`file-item ${selected ? "file-item--selected" : ""}`}
            disabled={disabled}
            onClick={() => onClick?.(path)}
            onDoubleClick={() => onDoubleClick?.(path)}
            title={path}
        >
            <span className="file-item__icon" aria-hidden="true">
                📄
            </span>
            <span className="file-item__name">{name}</span>
        </button>
    );
}
