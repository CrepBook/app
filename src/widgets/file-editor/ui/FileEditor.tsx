import {useState} from "react";
import FileNameInput from "../../../features/file-name-input/ui/FileNameInput.tsx"; // поправь пути под свой проект
import FileContentEditor from "../../../features/file-content-editor/ui/FileContentEditor.tsx";

type FileEditorProps = {
    initialFileName?: string;
    initialText?: string;
};

export default function FileEditor(
    {
        initialFileName = "Untitled",
        initialText = "(Х)ороший (У)мный (Й)огурт",
    }: FileEditorProps
) {
    const [fileName] = useState(initialFileName);
    const [text, setText] = useState(initialText);

    return (
        <div style={{height: "100dvh", display: "flex", flexDirection: "column"}}>
            <div
                style={{
                    padding: 12,
                    borderBottom: "1px solid #e5e5e5",
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                }}
            >
                <FileNameInput initialValue={fileName}/>
                <span style={{opacity: 0.7, fontSize: 12}}>{fileName}</span>
            </div>

            <div style={{flex: 1}}>
                <FileContentEditor value={text} onChange={setText}/>
            </div>
        </div>
    );
}
