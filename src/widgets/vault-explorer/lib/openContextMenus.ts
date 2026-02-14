import React from "react";

import { buildFileContextMenuItems, buildFolderContextMenuItems } from "@/widgets/vault-explorer/lib/contextMenuItems";
import { showSystemContextMenu } from "@/widgets/vault-explorer/systemMenu";

type OpenFolderContextMenuParams = {
    event: React.MouseEvent;
    folderPath: string;
    rootPath: string;
    onCreateNote: (path: string) => void | Promise<void>;
    onCreateFolder: (path: string) => void;
    onCreateFile: (path: string) => void;
    onRenameFolder: (path: string) => void;
    onDeleteFolder: (path: string) => void | Promise<void>;
};

type OpenFileContextMenuParams = {
    event: React.MouseEvent;
    filePath: string;
    rootPath: string;
    resolveParentFolder: (filePath: string) => string;
    onCreateNote: (path: string) => void | Promise<void>;
    onCreateFolder: (path: string) => void;
    onCreateFile: (path: string) => void;
    onDeleteFile: (path: string) => void | Promise<void>;
};

export async function openFolderContextMenu({
    event,
    folderPath,
    rootPath,
    onCreateNote,
    onCreateFolder,
    onCreateFile,
    onRenameFolder,
    onDeleteFolder,
}: OpenFolderContextMenuParams) {
    event.preventDefault();
    event.stopPropagation();

    const items = buildFolderContextMenuItems({
        folderPath,
        rootPath,
        onCreateNote,
        onCreateFolder,
        onCreateFile,
        onRenameFolder,
        onDeleteFolder,
    });

    await showSystemContextMenu(event.clientX, event.clientY, items);
}

export async function openFileContextMenu({
    event,
    filePath,
    rootPath,
    resolveParentFolder,
    onCreateNote,
    onCreateFolder,
    onCreateFile,
    onDeleteFile,
}: OpenFileContextMenuParams) {
    event.preventDefault();
    event.stopPropagation();

    const folderPath = resolveParentFolder(filePath) || rootPath;
    const items = buildFileContextMenuItems({
        filePath,
        folderPath,
        onCreateNote,
        onCreateFolder,
        onCreateFile,
        onDeleteFile,
    });

    await showSystemContextMenu(event.clientX, event.clientY, items);
}
