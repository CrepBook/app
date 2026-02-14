import React from "react";

import FileItem from "@/shared/ui/file-item/FileItem";
import FolderItem from "@/shared/ui/folder-item/FolderItem";
import { DirContent } from "@/widgets/vault-explorer/model/types";

type VaultTreeProps = {
    rootPath: string;
    openFolders: Record<string, boolean>;
    loadingFolder: Record<string, boolean>;
    contentByFolder: Record<string, DirContent>;
    selectedPath: string;
    onToggleFolder: (path: string) => void | Promise<void>;
    onSelectPath: (path: string) => void;
    onOpenFile?: (path: string) => void | Promise<void>;
    onFolderContextMenu: (event: React.MouseEvent, folderPath: string) => void | Promise<void>;
    onFileContextMenu: (event: React.MouseEvent, filePath: string) => void | Promise<void>;
};

export function VaultTree({
    rootPath,
    openFolders,
    loadingFolder,
    contentByFolder,
    selectedPath,
    onToggleFolder,
    onSelectPath,
    onOpenFile,
    onFolderContextMenu,
    onFileContextMenu,
}: VaultTreeProps) {
    const out: React.ReactNode[] = [];

    const walk = (folderPath: string, depth: number) => {
        const isOpen = Boolean(openFolders[folderPath]);
        const isLoading = Boolean(loadingFolder[folderPath]);
        const content = contentByFolder[folderPath];

        out.push(
            <div
                key={folderPath}
                onContextMenu={(event) => onFolderContextMenu(event, folderPath)}
            >
                <FolderItem
                    path={folderPath}
                    isOpen={isOpen}
                    onToggle={onToggleFolder}
                    selected={selectedPath === folderPath}
                    onSelect={onSelectPath}
                    depth={depth}
                />
            </div>
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
                <div
                    key={file}
                    style={{ paddingLeft: 10 + (depth + 1) * 14 }}
                    onContextMenu={(event) => onFileContextMenu(event, file)}
                >
                    <FileItem
                        path={file}
                        selected={selectedPath === file}
                        onClick={onSelectPath}
                        onDoubleClick={(path) => onOpenFile?.(path)}
                    />
                </div>
            );
        }
    };

    walk(rootPath, 0);
    return <>{out}</>;
}
