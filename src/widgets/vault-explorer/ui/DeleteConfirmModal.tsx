import { DeleteModal } from "@/widgets/vault-explorer/model/types";
import { entryName } from "@/widgets/vault-explorer/lib/pathUtils";

type DeleteConfirmModalProps = {
    modal: DeleteModal;
    onCancel: () => void;
    onSubmit: () => void;
};

export function DeleteConfirmModal({ modal, onCancel, onSubmit }: DeleteConfirmModalProps) {
    if (!modal) {
        return null;
    }

    return (
        <div className="vault-explorer__modal-backdrop">
            <div className="vault-explorer__modal">
                <div className="vault-explorer__modal-title">Confirm Delete</div>
                <div className="vault-explorer__loading">
                    {modal.kind === "folder"
                        ? `Delete folder "${entryName(modal.path)}" and all its contents?`
                        : `Delete file "${entryName(modal.path)}"?`}
                </div>
                <div className="vault-explorer__modal-actions">
                    <button type="button" className="vault-explorer__btn" onClick={onCancel}>
                        Cancel
                    </button>
                    <button type="button" className="vault-explorer__btn" onClick={onSubmit}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
