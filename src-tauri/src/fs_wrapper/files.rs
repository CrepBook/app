use std::path::{Path, PathBuf};

fn split_stem_number(stem: &str) -> (&str, u32) {
    let mut idx = stem.len();
    for (i, ch) in stem.char_indices().rev() {
        if ch.is_ascii_digit() {
            idx = i;
            continue;
        }
        idx = i + ch.len_utf8();
        break;
    }

    if idx < stem.len() {
        let base = &stem[..idx];
        let num = stem[idx..].parse::<u32>().unwrap_or(0);
        return (base, num);
    }

    (stem, 0)
}

fn next_available_path(path: &Path) -> PathBuf {
    if !path.exists() {
        return path.to_path_buf();
    }

    let parent = path.parent().map(Path::to_path_buf).unwrap_or_default();
    let stem = path.file_stem().and_then(|s| s.to_str()).unwrap_or("file");
    let ext = path.extension().and_then(|s| s.to_str()).unwrap_or("");
    let (base, suffix) = split_stem_number(stem);

    let mut n: u32 = if suffix > 0 { suffix + 1 } else { 1 };
    loop {
        let candidate_name = if ext.is_empty() {
            format!("{base}{n}")
        } else {
            format!("{base}{n}.{ext}")
        };
        let candidate = parent.join(candidate_name);
        if !candidate.exists() {
            return candidate;
        }
        n += 1;
    }
}

#[tauri::command]
pub fn fs_file_exist(filename: &str) -> bool {
    std::fs::File::open(filename).is_ok()
}

#[tauri::command]
pub fn fs_read_file(filename: &str) -> Result<String, String> {
    std::fs::read_to_string(filename).map_err(|err| err.to_string())
}

#[tauri::command]
pub fn fs_write_file(filename: &str, content: String) -> bool {
    std::fs::write(filename, content).is_ok()
}

#[tauri::command]
pub fn fs_create_file(filename: &str) -> bool {
    std::fs::File::create(filename).is_ok()
}

#[tauri::command]
pub fn fs_delete_file(filename: &str) -> Result<(), String> {
    std::fs::remove_file(filename).map_err(|err| err.to_string())
}

#[tauri::command]
pub fn fs_is_file_empty(filename: &str) -> Result<bool, String> {
    let metadata = std::fs::metadata(filename).map_err(|err| err.to_string())?;
    Ok(metadata.len() == 0)
}

#[tauri::command]
pub fn fs_next_available_file_path(filename: &str) -> String {
    let desired_path = Path::new(filename);
    next_available_path(desired_path)
        .to_string_lossy()
        .into_owned()
}

#[tauri::command]
pub fn fs_rename_file(old_filename: &str, new_filename: &str) -> Result<String, String> {
    let old_path = Path::new(old_filename);
    let desired_path = Path::new(new_filename);

    if old_path == desired_path {
        return Ok(old_filename.to_string());
    }

    let target_path = next_available_path(desired_path);
    std::fs::rename(old_path, &target_path).map_err(|err| err.to_string())?;

    Ok(target_path.to_string_lossy().into_owned())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::io::Write;
    use tempfile::tempdir;

    #[test]
    fn test_split_stem_number_no_number() {
        let (base, num) = split_stem_number("document");
        assert_eq!(base, "document");
        assert_eq!(num, 0);
    }

    #[test]
    fn test_split_stem_number_with_number() {
        let (base, num) = split_stem_number("document5");
        assert_eq!(base, "document");
        assert_eq!(num, 5);
    }

    #[test]
    fn test_split_stem_number_multi_digit() {
        let (base, num) = split_stem_number("file123");
        assert_eq!(base, "file");
        assert_eq!(num, 123);
    }

    #[test]
    fn test_split_stem_number_only_digits() {
        let (base, num) = split_stem_number("42");
        assert_eq!(base, "");
        assert_eq!(num, 42);
    }

    #[test]
    fn test_next_available_path_nonexistent() {
        let temp_dir = tempdir().unwrap();
        let path = temp_dir.path().join("newfile.txt");
        let result = next_available_path(&path);
        assert_eq!(result, path);
    }

    #[test]
    fn test_next_available_path_exists() {
        let temp_dir = tempdir().unwrap();
        let existing = temp_dir.path().join("file.txt");
        fs::File::create(&existing).unwrap();

        let result = next_available_path(&existing);
        assert_eq!(result, temp_dir.path().join("file1.txt"));
    }

    #[test]
    fn test_next_available_path_multiple_exist() {
        let temp_dir = tempdir().unwrap();
        fs::File::create(temp_dir.path().join("file.txt")).unwrap();
        fs::File::create(temp_dir.path().join("file1.txt")).unwrap();
        fs::File::create(temp_dir.path().join("file2.txt")).unwrap();

        let result = next_available_path(&temp_dir.path().join("file.txt"));
        assert_eq!(result, temp_dir.path().join("file3.txt"));
    }

    #[test]
    fn test_fs_file_exist_true() {
        let temp_dir = tempdir().unwrap();
        let file_path = temp_dir.path().join("test.txt");
        fs::File::create(&file_path).unwrap();

        assert!(fs_file_exist(file_path.to_str().unwrap()));
    }

    #[test]
    fn test_fs_file_exist_false() {
        let temp_dir = tempdir().unwrap();
        let file_path = temp_dir.path().join("nonexistent.txt");

        assert!(!fs_file_exist(file_path.to_str().unwrap()));
    }

    #[test]
    fn test_fs_read_write_file() {
        let temp_dir = tempdir().unwrap();
        let file_path = temp_dir.path().join("test.txt");
        let content = "Hello, World!";

        assert!(fs_write_file(
            file_path.to_str().unwrap(),
            content.to_string()
        ));
        let read_content = fs_read_file(file_path.to_str().unwrap()).unwrap();
        assert_eq!(read_content, content);
    }

    #[test]
    fn test_fs_create_and_delete_file() {
        let temp_dir = tempdir().unwrap();
        let file_path = temp_dir.path().join("newfile.txt");

        assert!(fs_create_file(file_path.to_str().unwrap()));
        assert!(file_path.exists());

        fs_delete_file(file_path.to_str().unwrap()).unwrap();
        assert!(!file_path.exists());
    }

    #[test]
    fn test_fs_is_file_empty() {
        let temp_dir = tempdir().unwrap();
        let empty_file = temp_dir.path().join("empty.txt");
        let non_empty_file = temp_dir.path().join("nonempty.txt");

        fs::File::create(&empty_file).unwrap();
        let mut file = fs::File::create(&non_empty_file).unwrap();
        file.write_all(b"content").unwrap();

        assert!(fs_is_file_empty(empty_file.to_str().unwrap()).unwrap());
        assert!(!fs_is_file_empty(non_empty_file.to_str().unwrap()).unwrap());
    }

    #[test]
    fn test_fs_next_available_file_path() {
        let temp_dir = tempdir().unwrap();
        fs::File::create(temp_dir.path().join("doc.txt")).unwrap();

        let result = fs_next_available_file_path(temp_dir.path().join("doc.txt").to_str().unwrap());
        assert_eq!(result, temp_dir.path().join("doc1.txt").to_str().unwrap());
    }

    #[test]
    fn test_fs_rename_file() {
        let temp_dir = tempdir().unwrap();
        let old_path = temp_dir.path().join("old.txt");
        let new_path = temp_dir.path().join("new.txt");

        fs::File::create(&old_path).unwrap();

        let result =
            fs_rename_file(old_path.to_str().unwrap(), new_path.to_str().unwrap()).unwrap();

        assert_eq!(result, new_path.to_str().unwrap());
        assert!(!old_path.exists());
        assert!(new_path.exists());
    }

    #[test]
    fn test_fs_rename_file_same_path() {
        let temp_dir = tempdir().unwrap();
        let path = temp_dir.path().join("file.txt");
        fs::File::create(&path).unwrap();

        let result = fs_rename_file(path.to_str().unwrap(), path.to_str().unwrap()).unwrap();

        assert_eq!(result, path.to_str().unwrap());
    }
}
