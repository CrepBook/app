import { RenameFolderModal as RenameFolderModalState } from "@/widgets/vault-explorer/model/types";

type RenameFolderModalProps = {
    modal: RenameFolderModalState;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onChange: (value: string) => void;
    onCancel: () => void;
    onSubmit: () => void;
};

export function RenameFolderModal({ modal, inputRef, onChange, onCancel, onSubmit }: RenameFolderModalProps) {
    if (!modal) {
        return null;
    }

    return (
        <div className="vault-explorer__modal-backdrop">
            <div className="vault-explorer__modal">
                <div className="vault-explorer__modal-title">Rename Folder</div>
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
                    placeholder="Folder name"
                />
                <div className="vault-explorer__modal-actions">
                    <button type="button" className="vault-explorer__btn" onClick={onCancel}>
                        Cancel
                    </button>
                    <button type="button" className="vault-explorer__btn" onClick={onSubmit}>
                        Rename
                    </button>
                </div>
            </div>
        </div>
    );
}
