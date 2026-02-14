import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import { DirContent } from "@/widgets/vault-explorer/model/types";

type UseVaultTreeStateParams = {
    rootPath: string;
    refreshToken: number;
};

export function useVaultTreeState({ rootPath, refreshToken }: UseVaultTreeStateParams) {
    const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({ [rootPath]: true });
    const [selectedPath, setSelectedPath] = useState<string>("");
    const [contentByFolder, setContentByFolder] = useState<Record<string, DirContent>>({});
    const [loadingFolder, setLoadingFolder] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string | null>(null);

    const contentRef = useRef(contentByFolder);
    const loadingRef = useRef(loadingFolder);
    const openFoldersRef = useRef(openFolders);

    useEffect(() => {
        contentRef.current = contentByFolder;
    }, [contentByFolder]);

    useEffect(() => {
        loadingRef.current = loadingFolder;
    }, [loadingFolder]);

    useEffect(() => {
        openFoldersRef.current = openFolders;
    }, [openFolders]);

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
            const dirs = [...(res.dirs ?? [])].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
            const files = [...(res.files ?? [])].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
            setContentByFolder((prev) => ({ ...prev, [path]: { dirs, files } }));
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

    const refreshRoot = useCallback(async () => {
        setContentByFolder({});
        setLoadingFolder({});
        await loadFolder(rootPath, true);
    }, [loadFolder, rootPath]);

    useEffect(() => {
        setOpenFolders({ [rootPath]: true });
        setSelectedPath("");
        setContentByFolder({});
        setLoadingFolder({});
        setError(null);
        void loadFolder(rootPath, true);
    }, [rootPath, loadFolder]);

    useEffect(() => {
        const paths = Object.entries(openFoldersRef.current)
            .filter(([, isOpen]) => Boolean(isOpen))
            .map(([path]) => path);

        if (paths.length === 0) {
            paths.push(rootPath);
        }

        void Promise.all(paths.map((path) => loadFolder(path, true)));
    }, [loadFolder, refreshToken, rootPath]);

    return {
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
    };
}
