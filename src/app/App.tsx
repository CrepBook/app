import "./styles/globals.css";
import "./styles/layout.css";
import "./styles/tokens.css";

import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import { FileEditor } from "@/widgets/file-editor/ui/FileEditor";
import { VaultExplorer } from "@/widgets/vault-explorer/VaultExplorer";

const DEFAULT_TEXT = "# Welcome\n\nOpen a file from vault...\n";
const DEFAULT_FILE_NAME = "Untitled.md";
const DEFAULT_ROOT_PATH = "/Users/yeezy-na-izi/crep-book/test-vault";
const AUTOSAVE_MS = 10_000;

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

export default function App() {
    const [text, setText] = useState<string>(DEFAULT_TEXT);
    const [fileName, setFileName] = useState<string>(DEFAULT_FILE_NAME);
    const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);

    const currentFilePathRef = useRef<string | null>(null);
    const textRef = useRef<string>(text);
    const lastSavedTextRef = useRef<string>(text);
    const isSavingRef = useRef<boolean>(false);
    const openRequestIdRef = useRef<number>(0);

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
        if (!sanitizedName) {
            setFileName(extractFileName(oldPath));
            return;
        }

        const oldName = extractFileName(oldPath);
        if (sanitizedName === oldName) {
            setFileName(sanitizedName);
            return;
        }

        await saveCurrentFile();

        const dir = extractDir(oldPath);
        const newPath = joinPath(dir, sanitizedName);

        try {
            const renamed = await invoke<boolean>("fs_rename_file", {
                oldFilename: oldPath,
                newFilename: newPath,
            });

            if (!renamed) {
                setFileName(oldName);
                return;
            }

            setCurrentFilePath(newPath);
            currentFilePathRef.current = newPath;
            setFileName(sanitizedName);
        } catch (err) {
            setFileName(oldName);
            console.error("Cannot rename file", oldPath, "->", newPath, err);
        }
    }, [saveCurrentFile]);

    useEffect(() => {
        const timer = setInterval(() => {
            void saveCurrentFile();
        }, AUTOSAVE_MS);

        return () => clearInterval(timer);
    }, [saveCurrentFile]);

    return (
        <div className="app-shell">
            <aside className="app-shell__sidebar">
                <VaultExplorer rootPath={DEFAULT_ROOT_PATH} onOpenFile={handleOpenFile} />
            </aside>

            <main className="app-shell__main">
                <FileEditor
                    value={text}
                    onChange={setText}
                    fileName={fileName}
                    onFileNameChange={setFileName}
                    onFileNameCommit={handleFileNameCommit}
                    fileNameDisabled={!currentFilePath}
                />
            </main>
        </div>
    );
}
