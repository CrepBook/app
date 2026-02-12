type FileContentEditorProps = {
    value: string;
    onChange: (value: string) => void;
    name?: string;
    placeholder?: string;
    disabled?: boolean;
};

export default function FileContentEditor(
    {
        value,
        onChange,
        name = "fileContentEditor",
        placeholder,
        disabled,
    }: FileContentEditorProps
) {
    const handleBlur = () => {
        console.log("Textarea content:", value);
    };

    return (
        <div style={{height: "100dvh", display: "flex", flexDirection: "column"}}>
              <textarea
                  name={name}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={handleBlur}
                  placeholder={placeholder}
                  disabled={disabled}
                  style={{
                      flex: 1,
                      width: "100%",
                      resize: "none",
                      boxSizing: "border-box",
                  }}
              />
        </div>
    );
}
