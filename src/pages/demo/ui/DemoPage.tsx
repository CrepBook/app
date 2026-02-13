import React, { useMemo, useState } from "react";
import "./DemoPage.css";

import FileItem from "@/shared/ui/file-item/FileItem";
import FolderItem from "@/shared/ui/folder-item/FolderItem";

type Node =
    | { type: "folder"; path: string; children: Node[] }
    | { type: "file"; path: string };

const MOCK_TREE: Node = {
    type: "folder",
    path: "/vault",
    children: [
        {
            type: "folder",
            path: "/vault/notes",
            children: [
                { type: "file", path: "/vault/notes/Hello.md" },
                { type: "file", path: "/vault/notes/Math.md" },
                { type: "file", path: "/vault/notes/data.json" },
            ],
        },
        {
            type: "folder",
            path: "/vault/projects",
            children: [
                { type: "file", path: "/vault/projects/README.md" },
                {
                    type: "folder",
                    path: "/vault/projects/crepbook",
                    children: [
                        { type: "file", path: "/vault/projects/crepbook/plan.md" },
                        { type: "file", path: "/vault/projects/crepbook/todo.txt" },
                    ],
                },
            ],
        },
        { type: "file", path: "/vault/Inbox.md" },
    ],
};

function isMd(path: string) {
    return path.toLowerCase().endsWith(".md");
}

export default function DemoPage() {
    const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
        "/vault": true,
        "/vault/notes": true,
    });

    const [selectedPath, setSelectedPath] = useState<string>("");

    const toggleFolder = (path: string) => {
        setOpenFolders((prev) => ({ ...prev, [path]: !prev[path] }));
    };

    const select = (path: string) => setSelectedPath(path);

    const items = useMemo(() => {
        const out: React.ReactNode[] = [];

        const walk = (node: Node, depth: number) => {
            if (node.type === "folder") {
                const isOpen = openFolders[node.path];
                out.push(
                    <FolderItem
                        key={node.path}
                        path={node.path}
                        isOpen={isOpen}
                        onToggle={toggleFolder}
                        selected={selectedPath === node.path}
                        onSelect={select}
                        depth={depth}
                    />
                );

                if (isOpen) {
                    for (const ch of node.children) walk(ch, depth + 1);
                }
            } else {
                out.push(
                    <FileItem
                        key={node.path}
                        path={node.path}
                        selected={selectedPath === node.path}
                        onClick={select}
                        onDoubleClick={(p) => {
                            // просто демо-логика
                            console.log("open file:", p, "md:", isMd(p));
                        }}
                    />
                );
            }
        };

        walk(MOCK_TREE, 0);
        return out;
    }, [openFolders, selectedPath]);

    return (
        <div className="demo">
            <div className="demo__sidebar">
                <div className="demo__title">Demo: File Explorer</div>
                <div className="demo__list">{items}</div>
            </div>

            <div className="demo__main">
                <div className="demo__panel">
                    <div className="demo__label">Selected:</div>
                    <div className="demo__value">{selectedPath || "—"}</div>
                </div>

                <div className="demo__hint">
                    Попробуй:
                    <ul>
                        <li>клик по папке — select</li>
                        <li>треугольник — expand/collapse</li>
                        <li>double click по файлу — console.log(open file)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
