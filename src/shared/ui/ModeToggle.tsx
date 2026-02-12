type Mode = "edit" | "preview";

type ModeToggleProps = {
    value: Mode;
    onChange: (mode: Mode) => void;
};

export function ModeToggle({value, onChange}: ModeToggleProps) {
    return (
        <div style={{display: "inline-flex", gap: 8}}>
            <button
                type="button"
                onClick={() => onChange("edit")}
                style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "1px solid #e5e5e5",
                    background: value === "edit" ? "#e8e8e8" : "transparent",
                    cursor: "pointer",
                }}
            >
                Editor
            </button>

            <button
                type="button"
                onClick={() => onChange("preview")}
                style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "1px solid #e5e5e5",
                    background: value === "preview" ? "#e8e8e8" : "transparent",
                    cursor: "pointer",
                }}
            >
                Preview
            </button>
        </div>
    );
}
