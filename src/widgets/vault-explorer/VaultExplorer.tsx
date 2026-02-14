import React, { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import { handleDeleteFile as handleDeleteFileHelper, handleDeleteFolder as handleDeleteFolderHelper } from "@/widgets/vault-explorer/lib/deleteHandlers";
import { requestDeleteFile as requestDeleteFileHelper, requestDeleteFolder as requestDeleteFolderHelper } from "@/widgets/vault-explorer/lib/deleteRequests";
import { openFileContextMenu as showFileContextMenu, openFolderContextMenu as showFolderContextMenu } from "@/widgets/vault-explorer/lib/openContextMenus";
import { submitCreateEntry as submitCreateEntryHelper, submitRenameFolder as submitRenameFolderHelper } from "@/widgets/vault-explorer/lib/submitHandlers";
import { entryName, joinPath, parentDir } from "@/widgets/vault-explorer/lib/pathUtils";
import { useVaultTreeState } from "@/widgets/vault-explorer/model/useVaultTreeState";
import {
    CreateEntryKind,
    CreateEntryModal as CreateEntryModalState,
    DeleteModal,
    RenameFolderModal as RenameFolderModalState,
    VaultExplorerProps,
} from "@/widgets/vault-explorer/model/types";
import { CreateEntryModal } from "@/widgets/vault-explorer/ui/CreateEntryModal";
import { DeleteConfirmModal } from "@/widgets/vault-explorer/ui/DeleteConfirmModal";
import { RenameFolderModal } from "@/widgets/vault-explorer/ui/RenameFolderModal";
import { VaultTree } from "@/widgets/vault-explorer/ui/VaultTree";
import "./VaultExplorer.css";

export function VaultExplorer({
    rootPath,
    onOpenFile,
    onDeleteFile,
    onCreateFile,
    refreshToken = 0,
}: VaultExplorerProps) {
    const [createEntryModal, setCreateEntryModal] = useState<CreateEntryModalState>(null);
    const [renameFolderModal, setRenameFolderModal] = useState<RenameFolderModalState>(null);
    const [deleteModal, setDeleteModal] = useState<DeleteModal>(null);
    const createEntryInputRef = useRef<HTMLInputElement>(null);
    const wasModalOpenRef = useRef<boolean>(false);

    const {
        openFolders,
        setOpenFolders,
        selectedPath,
        setSelectedPath,
        contentByFolder,
        setContentByFolder,
        loadingFolder,
        setLoadingFolder,
        error,
        setError,
        loadFolder,
        toggleFolder,
        refreshRoot,
    } = useVaultTreeState({ rootPath, refreshToken });

    useEffect(() => {
        const isOpen = Boolean(createEntryModal || renameFolderModal);
        const justOpened = isOpen && !wasModalOpenRef.current;
        wasModalOpenRef.current = isOpen;

        if (!justOpened || !createEntryInputRef.current) {
            return;
        }

        createEntryInputRef.current.focus();
        createEntryInputRef.current.select();
    }, [createEntryModal, renameFolderModal]);

    const handleCreateNote = useCallback(async (targetFolder: string) => {
        try {
            const desiredFilePath = joinPath(targetFolder, "Untitled.md");
            const filePath = await invoke<string>("fs_next_available_file_path", {
                filename: desiredFilePath,
            });
            const nextFileName = entryName(filePath);

            const created = await invoke<boolean>("fs_create_file", { filename: filePath });
            if (!created) {
                setError(`Cannot create file: ${nextFileName}`);
                return;
            }

            setError(null);
            setOpenFolders((prev) => ({ ...prev, [targetFolder]: true }));
            await loadFolder(targetFolder, true);
            setSelectedPath(filePath);
            await onOpenFile?.(filePath);
            await onCreateFile?.(filePath);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
        }
    }, [loadFolder, onCreateFile, onOpenFile]);

    const openCreateEntryModal = useCallback((kind: CreateEntryKind, folderPath: string) => {
        setCreateEntryModal({
            kind,
            folderPath,
            value: kind === "file" ? "Untitled1.txt" : "Untitled1",
        });
    }, []);

    const submitCreateEntry = useCallback(async () => {
        await submitCreateEntryHelper({
            createEntryModal,
            onOpenFile,
            onCreateFile,
            loadFolder,
            setError,
            setCreateEntryModal,
            setOpenFolders,
            setSelectedPath,
        });
    }, [createEntryModal, loadFolder, onCreateFile, onOpenFile]);

    const submitRenameFolder = useCallback(async () => {
        await submitRenameFolderHelper({
            renameFolderModal,
            rootPath,
            loadFolder,
            setError,
            setRenameFolderModal,
            setOpenFolders,
            setContentByFolder,
            setLoadingFolder,
            setSelectedPath,
        });
    }, [loadFolder, renameFolderModal, rootPath]);

    const handleDeleteFile = useCallback(async (filePath: string) => {
        try {
            await handleDeleteFileHelper({
                filePath,
                onDeleteFile,
                loadFolder,
                setError,
                setSelectedPath,
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
        }
    }, [loadFolder, onDeleteFile]);

    const handleDeleteFolder = useCallback(async (folderPath: string) => {
        try {
            await handleDeleteFolderHelper({
                folderPath,
                rootPath,
                loadFolder,
                setError,
                setOpenFolders,
                setContentByFolder,
                setLoadingFolder,
                setSelectedPath,
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
        }
    }, [loadFolder, rootPath]);

    const requestDeleteFolder = useCallback(async (folderPath: string) => {
        await requestDeleteFolderHelper({
            folderPath,
            onDeleteEmptyFolder: handleDeleteFolder,
            onNeedConfirm: (path) => setDeleteModal({ kind: "folder", path }),
            onError: setError,
        });
    }, [handleDeleteFolder]);

    const requestDeleteFile = useCallback(async (filePath: string) => {
        await requestDeleteFileHelper({
            filePath,
            onDeleteEmptyFile: handleDeleteFile,
            onNeedConfirm: (path) => setDeleteModal({ kind: "file", path }),
            onError: setError,
        });
    }, [handleDeleteFile]);

    const submitDelete = useCallback(async () => {
        if (!deleteModal) {
            return;
        }

        const { kind, path } = deleteModal;
        setDeleteModal(null);

        if (kind === "file") {
            await handleDeleteFile(path);
            return;
        }

        await handleDeleteFolder(path);
    }, [deleteModal, handleDeleteFile, handleDeleteFolder]);

    const openFolderContextMenu = useCallback(async (event: React.MouseEvent, folderPath: string) => {
        await showFolderContextMenu({
            event,
            folderPath,
            rootPath,
            onCreateNote: handleCreateNote,
            onCreateFolder: (path) => openCreateEntryModal("folder", path),
            onCreateFile: (path) => openCreateEntryModal("file", path),
            onRenameFolder: (path) => {
                setRenameFolderModal({
                    folderPath: path,
                    parentPath: parentDir(path),
                    value: entryName(path),
                });
            },
            onDeleteFolder: requestDeleteFolder,
        });
    }, [handleCreateNote, openCreateEntryModal, requestDeleteFolder, rootPath]);

    const openFileContextMenu = useCallback(async (event: React.MouseEvent, filePath: string) => {
        await showFileContextMenu({
            event,
            filePath,
            rootPath,
            resolveParentFolder: parentDir,
            onCreateNote: handleCreateNote,
            onCreateFolder: (path) => openCreateEntryModal("folder", path),
            onCreateFile: (path) => openCreateEntryModal("file", path),
            onDeleteFile: requestDeleteFile,
        });
    }, [handleCreateNote, openCreateEntryModal, requestDeleteFile, rootPath]);

    return (
        <div className="vault-explorer">
            <div className="vault-explorer__header">
                <div className="vault-explorer__title">Vault</div>
                <button
                    className="vault-explorer__btn"
                    type="button"
                    onClick={() => {
                        void refreshRoot();
                    }}
                >
                    Refresh
                </button>
            </div>

            {error ? <div className="vault-explorer__error">{error}</div> : null}

            <div className="vault-explorer__tree" onContextMenu={(event) => openFolderContextMenu(event, rootPath)}>
                <VaultTree
                    rootPath={rootPath}
                    openFolders={openFolders}
                    loadingFolder={loadingFolder}
                    contentByFolder={contentByFolder}
                    selectedPath={selectedPath}
                    onToggleFolder={toggleFolder}
                    onSelectPath={setSelectedPath}
                    onOpenFile={onOpenFile}
                    onFolderContextMenu={openFolderContextMenu}
                    onFileContextMenu={openFileContextMenu}
                />
            </div>

            <CreateEntryModal
                modal={createEntryModal}
                inputRef={createEntryInputRef}
                onChange={(value) => setCreateEntryModal((prev) => (prev ? { ...prev, value } : prev))}
                onCancel={() => setCreateEntryModal(null)}
                onSubmit={() => void submitCreateEntry()}
            />

            <RenameFolderModal
                modal={renameFolderModal}
                inputRef={createEntryInputRef}
                onChange={(value) => setRenameFolderModal((prev) => (prev ? { ...prev, value } : prev))}
                onCancel={() => setRenameFolderModal(null)}
                onSubmit={() => void submitRenameFolder()}
            />

            <DeleteConfirmModal
                modal={deleteModal}
                onCancel={() => setDeleteModal(null)}
                onSubmit={() => void submitDelete()}
            />
        </div>
    );
}
