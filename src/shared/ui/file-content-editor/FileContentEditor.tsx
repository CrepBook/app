import "./FileContentEditor.css";
import CodeMirror from "@uiw/react-codemirror";
import {EditorView} from "@codemirror/view";
import {markdown} from "@codemirror/lang-markdown";
import {oneDark} from "@codemirror/theme-one-dark";

type FileContentEditorProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
};

export default function FileContentEditor(
    {
        value,
        onChange,
        placeholder = "Write markdown...",
        disabled,
    }: FileContentEditorProps
) {
    return (
        <div className="file-content-editor">
            <CodeMirror
                value={value}
                height="100%"
                editable={!disabled}
                placeholder={placeholder}
                theme={oneDark}
                extensions={[
                    markdown(),
                    EditorView.lineWrapping,
                ]}
                onChange={(val) => onChange(val)}
                onBlur={() => console.log("Editor content:", value)}
            />
        </div>
    );
}
