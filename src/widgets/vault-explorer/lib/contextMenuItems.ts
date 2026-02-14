import { ContextMenuItem } from "@/widgets/vault-explorer/systemMenu";

type FolderMenuParams = {
    folderPath: string;
    rootPath: string;
    onCreateNote: (folderPath: string) => void | Promise<void>;
    onCreateFolder: (folderPath: string) => void;
    onCreateFile: (folderPath: string) => void;
    onRenameFolder: (folderPath: string) => void;
    onDeleteFolder: (folderPath: string) => void | Promise<void>;
};

type FileMenuParams = {
    filePath: string;
    folderPath: string;
    onCreateNote: (folderPath: string) => void | Promise<void>;
    onCreateFolder: (folderPath: string) => void;
    onCreateFile: (folderPath: string) => void;
    onDeleteFile: (filePath: string) => void | Promise<void>;
};

export function buildFolderContextMenuItems({
    folderPath,
    rootPath,
    onCreateNote,
    onCreateFolder,
    onCreateFile,
    onRenameFolder,
    onDeleteFolder,
}: FolderMenuParams): ContextMenuItem[] {
    const canManageFolder = folderPath !== rootPath;

    return [
        {
            id: "vault-new-note",
            text: "New Note",
            action: () => {
                void onCreateNote(folderPath);
            },
        },
        {
            id: "vault-new-folder",
            text: "New Folder",
            action: () => {
                onCreateFolder(folderPath);
            },
        },
        {
            id: "vault-new-file",
            text: "New File",
            action: () => {
                onCreateFile(folderPath);
            },
        },
        ...(canManageFolder ? [{ item: "Separator" as const }] : []),
        ...(canManageFolder ? [{
            id: "vault-rename-folder",
            text: "Rename",
            action: () => {
                onRenameFolder(folderPath);
            },
        }] : []),
        ...(canManageFolder ? [{ item: "Separator" as const }] : []),
        ...(canManageFolder ? [{
            id: "vault-delete-folder",
            text: "Delete",
            action: () => {
                void onDeleteFolder(folderPath);
            },
        }] : []),
    ];
}

export function buildFileContextMenuItems({
    filePath,
    folderPath,
    onCreateNote,
    onCreateFolder,
    onCreateFile,
    onDeleteFile,
}: FileMenuParams): ContextMenuItem[] {
    return [
        {
            id: "vault-new-note-from-file",
            text: "New Note",
            action: () => {
                void onCreateNote(folderPath);
            },
        },
        {
            id: "vault-new-folder-from-file",
            text: "New Folder",
            action: () => {
                onCreateFolder(folderPath);
            },
        },
        {
            id: "vault-new-file-from-file",
            text: "New File",
            action: () => {
                onCreateFile(folderPath);
            },
        },
        {
            item: "Separator",
        },
        {
            id: "vault-delete-file",
            text: "Delete",
            action: () => {
                void onDeleteFile(filePath);
            },
        },
    ];
}
