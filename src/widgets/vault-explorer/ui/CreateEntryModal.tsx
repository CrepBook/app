import { CreateEntryModal as CreateEntryModalState } from "@/widgets/vault-explorer/model/types";

type CreateEntryModalProps = {
    modal: CreateEntryModalState;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onChange: (value: string) => void;
    onCancel: () => void;
    onSubmit: () => void;
};

export function CreateEntryModal({ modal, inputRef, onChange, onCancel, onSubmit }: CreateEntryModalProps) {
    if (!modal) {
        return null;
    }

    return (
        <div className="vault-explorer__modal-backdrop">
            <div className="vault-explorer__modal">
                <div className="vault-explorer__modal-title">
                    {modal.kind === "file" ? "New File" : "New Folder"}
                </div>
                <input
                    ref={inputRef}
                    className="vault-explorer__modal-input"
                    value={modal.value}
                    onChange={(event) => onChange(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            onSubmit();
                        }
                        if (event.key === "Escape") {
                            event.preventDefault();
                            onCancel();
                        }
                    }}
                    placeholder={modal.kind === "file" ? "Untitled1.txt" : "Untitled1"}
                />
                <div className="vault-explorer__modal-actions">
                    <button type="button" className="vault-explorer__btn" onClick={onCancel}>
                        Cancel
                    </button>
                    <button type="button" className="vault-explorer__btn" onClick={onSubmit}>
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
}
