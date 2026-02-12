import {useState} from "react";
import FileContentEditor from "@/shared/ui/FileContentEditor"; // поправь путь
import {MarkdownPreview} from "@/shared/ui/MarkdownPreview";
import {ModeToggle} from "@/shared/ui/ModeToggle";

type Mode = "edit" | "preview";

type FileEditorProps = {
    value: string;
    onChange: (value: string) => void;
    initialMode?: Mode;
};

export function FileEditor({value, onChange, initialMode = "edit"}: FileEditorProps) {
    const [mode, setMode] = useState<Mode>(initialMode);

    return (
        <div style={{height: "100dvh", display: "flex", flexDirection: "column"}}>
            <div
                style={{
                    padding: 12,
                    borderBottom: "1px solid #e5e5e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                }}
            >
                <ModeToggle value={mode} onChange={setMode}/>
            </div>

            <div style={{flex: 1}}>
                {mode === "edit" ? (
                    <FileContentEditor value={value} onChange={onChange}/>
                ) : (
                    <MarkdownPreview value={value}/>
                )}
            </div>
        </div>
    );
}
