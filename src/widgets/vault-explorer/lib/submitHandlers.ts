import { invoke } from "@tauri-apps/api/core";

import { entryName, joinPath, remapPath } from "@/widgets/vault-explorer/lib/pathUtils";
import { CreateEntryModal, DirContent, RenameFolderModal } from "@/widgets/vault-explorer/model/types";

type SubmitCreateEntryParams = {
    createEntryModal: CreateEntryModal;
    onOpenFile?: (path: string) => void | Promise<void>;
    onCreateFile?: (path: string) => void | Promise<void>;
    loadFolder: (path: string, force?: boolean) => Promise<void>;
    setError: (value: string | null) => void;
    setCreateEntryModal: (value: CreateEntryModal) => void;
    setOpenFolders: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
    setSelectedPath: (value: string | ((prev: string) => string)) => void;
};

type SubmitRenameFolderParams = {
    renameFolderModal: RenameFolderModal;
    rootPath: string;
    loadFolder: (path: string, force?: boolean) => Promise<void>;
    setError: (value: string | null) => void;
    setRenameFolderModal: (value: RenameFolderModal) => void;
    setOpenFolders: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
    setContentByFolder: (updater: (prev: Record<string, DirContent>) => Record<string, DirContent>) => void;
    setLoadingFolder: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
    setSelectedPath: (updater: (prev: string) => string) => void;
};

export async function submitCreateEntry({
    createEntryModal,
    onOpenFile,
    onCreateFile,
    loadFolder,
    setError,
    setCreateEntryModal,
    setOpenFolders,
    setSelectedPath,
}: SubmitCreateEntryParams) {
    if (!createEntryModal) {
        return;
    }

    const requested = createEntryModal.value.trim();
    if (!requested) {
        setError("Name is required");
        return;
    }

    try {
        const requestedPath = joinPath(createEntryModal.folderPath, requested);

        if (createEntryModal.kind === "folder") {
            const fullPath = await invoke<string>("fs_next_available_dir_path", { path: requestedPath });
            const uniqueName = entryName(fullPath);
            const created = await invoke<boolean>("fs_create_dir", { path: fullPath });
            if (!created) {
                setError(`Cannot create folder: ${uniqueName}`);
                return;
            }

            setOpenFolders((prev) => ({
                ...prev,
                [createEntryModal.folderPath]: true,
                [fullPath]: true,
            }));
        } else {
            const fullPath = await invoke<string>("fs_next_available_file_path", { filename: requestedPath });
            const uniqueName = entryName(fullPath);
            const created = await invoke<boolean>("fs_create_file", { filename: fullPath });
            if (!created) {
                setError(`Cannot create file: ${uniqueName}`);
                return;
            }

            setOpenFolders((prev) => ({ ...prev, [createEntryModal.folderPath]: true }));
            setSelectedPath(fullPath);
            await onOpenFile?.(fullPath);
            await onCreateFile?.(fullPath);
        }

        setError(null);
        setCreateEntryModal(null);
        await loadFolder(createEntryModal.folderPath, true);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
    }
}

export async function submitRenameFolder({
    renameFolderModal,
    rootPath,
    loadFolder,
    setError,
    setRenameFolderModal,
    setOpenFolders,
    setContentByFolder,
    setLoadingFolder,
    setSelectedPath,
}: SubmitRenameFolderParams) {
    if (!renameFolderModal) {
        return;
    }

    const requested = renameFolderModal.value.trim();
    if (!requested) {
        setError("Name is required");
        return;
    }

    const oldPath = renameFolderModal.folderPath;
    const newPath = joinPath(renameFolderModal.parentPath, requested);

    if (newPath === oldPath) {
        setRenameFolderModal(null);
        return;
    }

    try {
        const renamed = await invoke<boolean>("fs_rename_dir", { oldPath, newPath });
        if (!renamed) {
            setError(`Cannot rename folder: ${entryName(oldPath)}`);
            return;
        }

        setError(null);
        setRenameFolderModal(null);

        setOpenFolders((prev) => {
            const next: Record<string, boolean> = {};
            for (const [path, isOpen] of Object.entries(prev)) {
                next[remapPath(path, oldPath, newPath)] = isOpen;
            }
            return next;
        });

        setContentByFolder((prev) => {
            const next: Record<string, DirContent> = {};
            for (const [path, value] of Object.entries(prev)) {
                next[remapPath(path, oldPath, newPath)] = value;
            }
            return next;
        });

        setLoadingFolder((prev) => {
            const next: Record<string, boolean> = {};
            for (const [path, isLoading] of Object.entries(prev)) {
                next[remapPath(path, oldPath, newPath)] = isLoading;
            }
            return next;
        });

        setSelectedPath((prev) => remapPath(prev, oldPath, newPath));

        if (renameFolderModal.parentPath) {
            await loadFolder(renameFolderModal.parentPath, true);
        } else {
            await loadFolder(rootPath, true);
        }
        await loadFolder(newPath, true);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
    }
}
