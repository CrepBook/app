import "./FolderItem.css";

export type FolderItemProps = {
    path: string;

    isOpen: boolean;
    onToggle: (path: string) => void;

    selected?: boolean;
    onSelect?: (path: string) => void;

    disabled?: boolean;
    depth?: number; // для дерева: отступ слева
};

function folderName(path: string) {
    return path.split(/[/\\]/).filter(Boolean).pop() ?? path;
}

export default function FolderItem(
    {
        path,
        isOpen,
        onToggle,
        selected = false,
        onSelect,
        disabled = false,
        depth = 0,
    }: FolderItemProps
) {
    const name = folderName(path);

    return (
        <div
            className={`folder-item ${selected ? "folder-item--selected" : ""} ${
                disabled ? "folder-item--disabled" : ""
            }`}
            style={{paddingLeft: 10 + depth * 14}}
            title={path}
        >
            <button
                type="button"
                className="folder-item__toggle"
                onClick={() => onToggle(path)}
                disabled={disabled}
                aria-label={isOpen ? "Collapse folder" : "Expand folder"}
            >
                <span className={`folder-item__chev ${isOpen ? "is-open" : ""}`}>▶</span>
            </button>

            <button
                type="button"
                className="folder-item__main"
                onClick={() => onSelect?.(path)}
                disabled={disabled}
            >
        <span className="folder-item__icon" aria-hidden="true">
          {isOpen ? "📂" : "📁"}
        </span>
                <span className="folder-item__name">{name}</span>
            </button>
        </div>
    );
}
