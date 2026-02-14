export type DirContent = {
    dirs: string[];
    files: string[];
};

export type VaultExplorerProps = {
    rootPath: string;
    onOpenFile?: (path: string) => void | Promise<void>;
    onDeleteFile?: (path: string) => void | Promise<void>;
    onCreateFile?: (path: string) => void | Promise<void>;
    refreshToken?: number;
};

export type CreateEntryKind = "file" | "folder";

export type CreateEntryModal = {
    kind: CreateEntryKind;
    folderPath: string;
    value: string;
} | null;

export type RenameFolderModal = {
    folderPath: string;
    parentPath: string;
    value: string;
} | null;

export type DeleteModal = {
    kind: "file" | "folder";
    path: string;
} | null;
