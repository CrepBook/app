import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import { FileEditor } from "@/widgets/file-editor/ui/FileEditor";
import { VaultExplorer } from "@/widgets/vault-explorer/VaultExplorer";

const DEFAULT_TEXT = "# Welcome\n\nOpen a file from vault...\n";
const DEFAULT_FILE_NAME = "Untitled.md";

function extractFileName(path: string) {
    return path.split(/[\\/]/).filter(Boolean).pop() ?? path;
}

function extractDir(path: string) {
    const normalized = path.replace(/\\/g, "/");
    const idx = normalized.lastIndexOf("/");
    return idx > 0 ? normalized.slice(0, idx) : "";
}

function joinPath(dir: string, name: string) {
    if (!dir) {
        return name;
    }
    return `${dir}/${name}`;
}

export function EditorPage() {
    const [text, setText] = useState<string>(DEFAULT_TEXT);
    const [fileName, setFileName] = useState<string>(DEFAULT_FILE_NAME);
    const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
    const [fileNameFocusToken, setFileNameFocusToken] = useState<number>(0);
    const [explorerRefreshToken, setExplorerRefreshToken] = useState<number>(0);
    const [defaultRootPath, setDefaultRootPath] = useState<string>("");
    const [autosaveMs, setAutosaveMs] = useState<number>(10_000);

    const currentFilePathRef = useRef<string | null>(null);
    const textRef = useRef<string>(text);
    const lastSavedTextRef = useRef<string>(text);
    const isSavingRef = useRef<boolean>(false);
    const deletedPathsRef = useRef<Set<string>>(new Set());
    const openRequestIdRef = useRef<number>(0);

    useEffect(() => {
        async function loadSettings() {
            try {
                const rootPath = await invoke<string>("settings_get_default_root_path");
                setDefaultRootPath(rootPath);
            } catch (err) {
                console.error("Failed to load default root path", err);
            }

            try {
                const autosaveInterval = await invoke<number>("settings_get_autosave_ms");
                setAutosaveMs(autosaveInterval);
            } catch (err) {
                console.error("Failed to load autosave interval", err);
            }
        }

        void loadSettings();
    }, []);

    useEffect(() => {
        textRef.current = text;
    }, [text]);

    useEffect(() => {
        currentFilePathRef.current = currentFilePath;
    }, [currentFilePath]);

    const saveCurrentFile = useCallback(async () => {
        const path = currentFilePathRef.current;
        const content = textRef.current;

        if (!path || isSavingRef.current || content === lastSavedTextRef.current) {
            return;
        }

        if (deletedPathsRef.current.has(path)) {
            return;
        }

        isSavingRef.current = true;

        try {
            const saved = await invoke<boolean>("fs_write_file", {
                filename: path,
                content,
            });

            if (saved) {
                lastSavedTextRef.current = content;
            }
        } catch (err) {
            console.error("Cannot autosave file", path, err);
        } finally {
            isSavingRef.current = false;
        }
    }, []);

    const handleOpenFile = useCallback(async (path: string) => {
        const requestId = ++openRequestIdRef.current;
        deletedPathsRef.current.delete(path);
        await saveCurrentFile();

        try {
            const fileContent = await invoke<string>("fs_read_file", { filename: path });
            if (requestId !== openRequestIdRef.current) {
                return;
            }
            setCurrentFilePath(path);
            setFileName(extractFileName(path));
            setText(fileContent);

            textRef.current = fileContent;
            lastSavedTextRef.current = fileContent;
        } catch (err) {
            if (requestId !== openRequestIdRef.current) {
                return;
            }
            console.error("Cannot open file", path, err);
        }
    }, [saveCurrentFile]);

    const handleFileNameCommit = useCallback(async (nextName: string) => {
        const oldPath = currentFilePathRef.current;
        if (!oldPath) {
            return;
        }

        const sanitizedName = nextName.trim();
        const oldName = extractFileName(oldPath);
        const oldExtIndex = oldName.lastIndexOf(".");
        const oldExt = oldExtIndex > 0 ? oldName.slice(oldExtIndex) : "";

        const oldIsMd = oldPath.toLowerCase().endsWith(".md");
        const fallbackName = oldIsMd ? "Untitled1.md" : `Untitled1${oldExt}`;
        const extensionOnlyMatch = sanitizedName.match(/^\.[^.]+$/);
        const nonEmptyName = !sanitizedName
            ? fallbackName
            : extensionOnlyMatch
                ? `Untitled1${extensionOnlyMatch[0]}`
                : sanitizedName;
        const normalizedName = oldIsMd && !nonEmptyName.toLowerCase().endsWith(".md")
            ? `${nonEmptyName}.md`
            : nonEmptyName;

        if (normalizedName === oldName) {
            setFileName(normalizedName);
            return;
        }

        await saveCurrentFile();

        const dir = extractDir(oldPath);
        const desiredPath = joinPath(dir, normalizedName);

        try {
            const actualPath = await invoke<string>("fs_rename_file", {
                oldFilename: oldPath,
                newFilename: desiredPath,
            });

            setCurrentFilePath(actualPath);
            currentFilePathRef.current = actualPath;
            setFileName(extractFileName(actualPath));
            setExplorerRefreshToken((prev) => prev + 1);
        } catch (err) {
            setFileName(oldName);
            console.error("Cannot rename file", oldPath, "->", desiredPath, err);
        }
    }, [saveCurrentFile]);

    const handleDeleteFile = useCallback(async (path: string) => {
        deletedPathsRef.current.add(path);

        for (let i = 0; i < 20 && isSavingRef.current; i += 1) {
            await new Promise((resolve) => setTimeout(resolve, 25));
        }

        if (currentFilePathRef.current !== path) {
            return;
        }

        currentFilePathRef.current = null;
        setCurrentFilePath(null);
        setFileName(DEFAULT_FILE_NAME);
        setText(DEFAULT_TEXT);
        textRef.current = DEFAULT_TEXT;
        lastSavedTextRef.current = DEFAULT_TEXT;
    }, []);

    const handleCreateFile = useCallback(() => {
        setFileNameFocusToken((prev) => prev + 1);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            void saveCurrentFile();
        }, autosaveMs);

        return () => clearInterval(timer);
    }, [saveCurrentFile]);

    return (
        <div className="app-shell">
            <aside className="app-shell__sidebar">
                <VaultExplorer
                    rootPath={defaultRootPath}
                    onOpenFile={handleOpenFile}
                    onDeleteFile={handleDeleteFile}
                    onCreateFile={handleCreateFile}
                    refreshToken={explorerRefreshToken}
                />
            </aside>

            <main className="app-shell__main">
                <FileEditor
                    value={text}
                    onChange={setText}
                    fileName={fileName}
                    onFileNameChange={setFileName}
                    onFileNameCommit={handleFileNameCommit}
                    fileNameDisabled={!currentFilePath}
                    fileNameFocusToken={fileNameFocusToken}
                />
            </main>
        </div>
    );
}
