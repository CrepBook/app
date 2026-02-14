import { invoke } from "@tauri-apps/api/core";

import { entryName, isPathInside, parentDir } from "@/widgets/vault-explorer/lib/pathUtils";
import { DirContent } from "@/widgets/vault-explorer/model/types";

type HandleDeleteFolderParams = {
    folderPath: string;
    rootPath: string;
    loadFolder: (path: string, force?: boolean) => Promise<void>;
    setError: (value: string | null) => void;
    setOpenFolders: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
    setContentByFolder: (updater: (prev: Record<string, DirContent>) => Record<string, DirContent>) => void;
    setLoadingFolder: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
    setSelectedPath: (updater: (prev: string) => string) => void;
};

type HandleDeleteFileParams = {
    filePath: string;
    onDeleteFile?: (path: string) => void | Promise<void>;
    loadFolder: (path: string, force?: boolean) => Promise<void>;
    setError: (value: string | null) => void;
    setSelectedPath: (updater: (prev: string) => string) => void;
};

export async function handleDeleteFile({
    filePath,
    onDeleteFile,
    loadFolder,
    setError,
    setSelectedPath,
}: HandleDeleteFileParams) {
    await onDeleteFile?.(filePath);
    await invoke("fs_delete_file", { filename: filePath });

    const dir = parentDir(filePath);
    setError(null);

    if (dir) {
        await loadFolder(dir, true);
    }

    setSelectedPath((prev) => (prev === filePath ? "" : prev));
}

export async function handleDeleteFolder({
    folderPath,
    rootPath,
    loadFolder,
    setError,
    setOpenFolders,
    setContentByFolder,
    setLoadingFolder,
    setSelectedPath,
}: HandleDeleteFolderParams) {
    const deleted = await invoke<boolean>("fs_delete_dir", { path: folderPath });
    if (!deleted) {
        setError(`Cannot delete folder: ${entryName(folderPath)}`);
        return;
    }

    const parentPath = parentDir(folderPath);
    setError(null);

    setOpenFolders((prev) => {
        const next: Record<string, boolean> = {};
        for (const [path, isOpen] of Object.entries(prev)) {
            if (!isPathInside(path, folderPath)) {
                next[path] = isOpen;
            }
        }
        return next;
    });

    setContentByFolder((prev) => {
        const next: Record<string, DirContent> = {};
        for (const [path, value] of Object.entries(prev)) {
            if (!isPathInside(path, folderPath)) {
                next[path] = value;
            }
        }
        return next;
    });

    setLoadingFolder((prev) => {
        const next: Record<string, boolean> = {};
        for (const [path, isLoading] of Object.entries(prev)) {
            if (!isPathInside(path, folderPath)) {
                next[path] = isLoading;
            }
        }
        return next;
    });

    setSelectedPath((prev) => (isPathInside(prev, folderPath) ? "" : prev));

    if (parentPath) {
        await loadFolder(parentPath, true);
    } else {
        await loadFolder(rootPath, true);
    }
}
