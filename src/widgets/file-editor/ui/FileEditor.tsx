import {useState} from "react";
import "./FileEditor.css";

import FileContentEditor from "@/shared/ui/file-content-editor/FileContentEditor";
import FileNameInput from "@/shared/ui/file-name-input/FileNameInput";
import {MarkdownPreview} from "@/shared/ui/markdown-preview/MarkdownPreview";
import {ModeToggle} from "@/shared/ui/mode-toggle/ModeToggle";

type Mode = "edit" | "preview";

type FileEditorProps = {
    value: string;
    onChange: (value: string) => void;
    fileName: string;
    onFileNameChange: (value: string) => void;
    onFileNameCommit?: (value: string) => void;
    fileNameDisabled?: boolean;
};

export function FileEditor({
    value,
    onChange,
    fileName,
    onFileNameChange,
    onFileNameCommit,
    fileNameDisabled = false,
}: FileEditorProps) {
    const [mode, setMode] = useState<Mode>("edit");

    return (
        <div className="file-editor">
            <div className="file-editor__top">
                <div className="file-editor__name">
                    <FileNameInput
                        value={fileName}
                        onChange={onFileNameChange}
                        onCommit={onFileNameCommit}
                        disabled={fileNameDisabled}
                    />
                </div>

                <ModeToggle value={mode} onChange={setMode}/>
            </div>

            <div className="file-editor__body">
                {mode === "edit" ? (
                    <FileContentEditor value={value} onChange={onChange}/>
                ) : (
                    <MarkdownPreview value={value}/>
                )}
            </div>
        </div>
    );
}
