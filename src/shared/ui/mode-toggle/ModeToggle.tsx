import "./ModeToggle.css";

type Mode = "edit" | "preview";

type Props = {
    value: Mode;
    onChange: (mode: Mode) => void;
};

export function ModeToggle({ value, onChange }: Props) {
    return (
        <div className="mode-toggle">
            <button
                type="button"
                className={`mode-toggle__btn ${value === "edit" ? "mode-toggle__btn--active" : ""}`}
                onClick={() => onChange("edit")}
            >
                Editor
            </button>
            <button
                type="button"
                className={`mode-toggle__btn ${value === "preview" ? "mode-toggle__btn--active" : ""}`}
                onClick={() => onChange("preview")}
            >
                Preview
            </button>
        </div>
    );
}
