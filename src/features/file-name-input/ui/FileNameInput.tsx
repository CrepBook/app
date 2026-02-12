import {useEffect, useRef, useState} from "react";
import "./FileNameInput.css"

export default function FileNameInput(
    {
        initialValue = "Untitled",
        name = "fileNameInput",
    }
) {
    const [value, setValue] = useState(initialValue);

    const prevValueRef = useRef(initialValue);

    useEffect(() => {
        setValue(initialValue);
        prevValueRef.current = initialValue;
    }, [initialValue]);

    const handleBlur = () => {
        const prev = prevValueRef.current;
        const curr = value;

        console.log("prev:", prev, "curr:", curr);

        prevValueRef.current = curr;
    };

    return (
        <input
            name={name}
            value={value}
            className="fileNameInput"
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            placeholder="Enter file name"
        />
    );
}
