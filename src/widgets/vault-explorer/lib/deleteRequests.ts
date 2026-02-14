import { invoke } from "@tauri-apps/api/core";

type RequestDeleteFileParams = {
    filePath: string;
    onDeleteEmptyFile: (filePath: string) => void | Promise<void>;
    onNeedConfirm: (filePath: string) => void;
    onError: (message: string) => void;
};

type RequestDeleteFolderParams = {
    folderPath: string;
    onDeleteEmptyFolder: (folderPath: string) => void | Promise<void>;
    onNeedConfirm: (folderPath: string) => void;
    onError: (message: string) => void;
};

export async function requestDeleteFile({
    filePath,
    onDeleteEmptyFile,
    onNeedConfirm,
    onError,
}: RequestDeleteFileParams) {
    try {
        const isEmpty = await invoke<boolean>("fs_is_file_empty", { filename: filePath });
        if (isEmpty) {
            await onDeleteEmptyFile(filePath);
            return;
        }

        onNeedConfirm(filePath);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        onError(message);
    }
}

export async function requestDeleteFolder({
    folderPath,
    onDeleteEmptyFolder,
    onNeedConfirm,
    onError,
}: RequestDeleteFolderParams) {
    try {
        const isEmpty = await invoke<boolean>("fs_is_dir_empty", { path: folderPath });
        if (isEmpty) {
            await onDeleteEmptyFolder(folderPath);
            return;
        }

        onNeedConfirm(folderPath);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        onError(message);
    }
}
