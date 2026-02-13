import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import FileItem from "@/shared/ui/file-item/FileItem";
import FolderItem from "@/shared/ui/folder-item/FolderItem";
import "./VaultExplorer.css";

type DirContent = {
    dirs: string[];
    files: string[];
};

type VaultExplorerProps = {
    rootPath: string;
    onOpenFile?: (path: string) => void;
};

export function VaultExplorer({ rootPath, onOpenFile }: VaultExplorerProps) {
    const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
        [rootPath]: true,
    });
    const [selectedPath, setSelectedPath] = useState<string>("");
    const [contentByFolder, setContentByFolder] = useState<Record<string, DirContent>>({});
    const [loadingFolder, setLoadingFolder] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string | null>(null);
    const contentRef = useRef(contentByFolder);
    const loadingRef = useRef(loadingFolder);

    useEffect(() => {
        contentRef.current = contentByFolder;
    }, [contentByFolder]);

    useEffect(() => {
        loadingRef.current = loadingFolder;
    }, [loadingFolder]);

    const loadFolder = useCallback(async (path: string, force = false) => {
        const isLoading = Boolean(loadingRef.current[path]);
        const isLoaded = Boolean(contentRef.current[path]);

        if (isLoading || (isLoaded && !force)) {
            return;
        }

        setError(null);
        setLoadingFolder((prev) => ({ ...prev, [path]: true }));

        try {
            const res = await invoke<DirContent>("fs_get_dir_content", { path });

            const dirs = [...(res.dirs ?? [])].sort((a, b) =>
                a.localeCompare(b, undefined, { sensitivity: "base" })
            );
            const files = [...(res.files ?? [])].sort((a, b) =>
                a.localeCompare(b, undefined, { sensitivity: "base" })
            );

            setContentByFolder((prev) => ({
                ...prev,
                [path]: { dirs, files },
            }));
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
        } finally {
            setLoadingFolder((prev) => ({ ...prev, [path]: false }));
        }
    }, []);

    const toggleFolder = useCallback(async (path: string) => {
        let willOpen = false;
        setOpenFolders((prev) => {
            willOpen = !prev[path];
            return { ...prev, [path]: willOpen };
        });

        if (willOpen) {
            await loadFolder(path);
        }
    }, [loadFolder]);

    useEffect(() => {
        setOpenFolders({ [rootPath]: true });
        setSelectedPath("");
        setContentByFolder({});
        setLoadingFolder({});
        setError(null);

        void loadFolder(rootPath, true);
    }, [rootPath, loadFolder]);

    const treeItems = useMemo(() => {
        const out: React.ReactNode[] = [];

        const walk = (folderPath: string, depth: number) => {
            const isOpen = Boolean(openFolders[folderPath]);
            const isLoading = Boolean(loadingFolder[folderPath]);
            const content = contentByFolder[folderPath];

            out.push(
                <FolderItem
                    key={folderPath}
                    path={folderPath}
                    isOpen={isOpen}
                    onToggle={toggleFolder}
                    selected={selectedPath === folderPath}
                    onSelect={setSelectedPath}
                    depth={depth}
                />
            );

            if (!isOpen) {
                return;
            }

            if (isLoading && !content) {
                out.push(
                    <div
                        key={`${folderPath}:loading`}
                        className="vault-explorer__loading"
                        style={{ paddingLeft: 10 + (depth + 1) * 14 }}
                    >
                        Loading...
                    </div>
                );
                return;
            }

            if (!content) {
                return;
            }

            for (const dir of content.dirs) {
                walk(dir, depth + 1);
            }

            for (const file of content.files) {
                out.push(
                    <div key={file} style={{ paddingLeft: 10 + (depth + 1) * 14 }}>
                        <FileItem
                            path={file}
                            selected={selectedPath === file}
                            onClick={setSelectedPath}
                            onDoubleClick={(path) => onOpenFile?.(path)}
                        />
                    </div>
                );
            }
        };

        walk(rootPath, 0);

        return out;
    }, [contentByFolder, loadingFolder, onOpenFile, openFolders, rootPath, selectedPath, toggleFolder]);

    return (
        <div className="vault-explorer">
            <div className="vault-explorer__header">
                <div className="vault-explorer__title">Vault</div>
                <button
                    className="vault-explorer__btn"
                    type="button"
                    onClick={() => {
                        setContentByFolder({});
                        setLoadingFolder({});
                        void loadFolder(rootPath, true);
                    }}
                >
                    Refresh
                </button>
            </div>

            {error ? <div className="vault-explorer__error">{error}</div> : null}

            <div className="vault-explorer__tree">{treeItems}</div>
        </div>
    );
}
