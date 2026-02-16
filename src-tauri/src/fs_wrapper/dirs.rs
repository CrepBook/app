use serde::Serialize;
use std::path::Path;

fn split_name_number(name: &str) -> (&str, u32) {
    let mut idx = name.len();
    for (i, ch) in name.char_indices().rev() {
        if ch.is_ascii_digit() {
            idx = i;
            continue;
        }
        idx = i + ch.len_utf8();
        break;
    }

    if idx < name.len() {
        let base = &name[..idx];
        let num = name[idx..].parse::<u32>().unwrap_or(0);
        return (base, num);
    }

    (name, 0)
}

fn next_available_dir_path(path: &Path) -> String {
    if !path.exists() {
        return path.to_string_lossy().into_owned();
    }

    let parent = path.parent().map(Path::to_path_buf).unwrap_or_default();
    let name = path
        .file_name()
        .and_then(|s| s.to_str())
        .unwrap_or("Untitled");
    let (base, suffix) = split_name_number(name);

    let mut n: u32 = if suffix > 0 { suffix + 1 } else { 1 };
    loop {
        let candidate = parent.join(format!("{base}{n}"));
        if !candidate.exists() {
            return candidate.to_string_lossy().into_owned();
        }
        n += 1;
    }
}

#[derive(Serialize)]
pub struct DirContent {
    dirs: Vec<String>,
    files: Vec<String>,
}

#[tauri::command]
pub fn fs_get_dir_content(path: &str) -> DirContent {
    let mut dirs = Vec::new();
    let mut files = Vec::new();

    if let Ok(entries) = std::fs::read_dir(path) {
        for entry in entries.flatten() {
            let entry_path = entry.path();
            let full_path = entry_path.to_string_lossy().into_owned();

            if entry_path.is_dir() {
                dirs.push(full_path);
            } else {
                files.push(full_path);
            }
        }
    }

    DirContent { dirs, files }
}

#[tauri::command]
pub fn fs_create_dir(path: &str) -> bool {
    std::fs::create_dir(path).is_ok()
}

#[tauri::command]
pub fn fs_delete_dir(path: &str) -> bool {
    std::fs::remove_dir_all(path).is_ok()
}

#[tauri::command]
pub fn fs_is_dir_empty(path: &str) -> Result<bool, String> {
    let mut entries = std::fs::read_dir(path).map_err(|err| err.to_string())?;
    Ok(entries.next().is_none())
}

#[tauri::command]
pub fn fs_next_available_dir_path(path: &str) -> String {
    next_available_dir_path(Path::new(path))
}

#[tauri::command]
pub fn fs_rename_dir(old_path: &str, new_path: &str) -> bool {
    std::fs::rename(old_path, new_path).is_ok()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::tempdir;

    #[test]
    fn test_split_name_number_no_number() {
        let (base, num) = split_name_number("folder");
        assert_eq!(base, "folder");
        assert_eq!(num, 0);
    }

    #[test]
    fn test_split_name_number_with_number() {
        let (base, num) = split_name_number("folder3");
        assert_eq!(base, "folder");
        assert_eq!(num, 3);
    }

    #[test]
    fn test_split_name_number_multi_digit() {
        let (base, num) = split_name_number("dir42");
        assert_eq!(base, "dir");
        assert_eq!(num, 42);
    }

    #[test]
    fn test_next_available_dir_path_nonexistent() {
        let temp_dir = tempdir().unwrap();
        let path = temp_dir.path().join("newfolder");
        let result = next_available_dir_path(&path);
        assert_eq!(result, path.to_string_lossy().into_owned());
    }

    #[test]
    fn test_next_available_dir_path_exists() {
        let temp_dir = tempdir().unwrap();
        let existing = temp_dir.path().join("mydir");
        fs::create_dir(&existing).unwrap();

        let result = next_available_dir_path(&existing);
        assert_eq!(
            result,
            temp_dir
                .path()
                .join("mydir1")
                .to_string_lossy()
                .into_owned()
        );
    }

    #[test]
    fn test_next_available_dir_path_multiple_exist() {
        let temp_dir = tempdir().unwrap();
        fs::create_dir(temp_dir.path().join("project")).unwrap();
        fs::create_dir(temp_dir.path().join("project1")).unwrap();
        fs::create_dir(temp_dir.path().join("project2")).unwrap();

        let result = next_available_dir_path(&temp_dir.path().join("project"));
        assert_eq!(
            result,
            temp_dir
                .path()
                .join("project3")
                .to_string_lossy()
                .into_owned()
        );
    }

    #[test]
    fn test_fs_get_dir_content() {
        let temp_dir = tempdir().unwrap();
        fs::create_dir(temp_dir.path().join("subdir")).unwrap();
        fs::File::create(temp_dir.path().join("file.txt")).unwrap();

        let content = fs_get_dir_content(temp_dir.path().to_str().unwrap());

        assert_eq!(content.dirs.len(), 1);
        assert!(content.dirs[0].contains("subdir"));
        assert_eq!(content.files.len(), 1);
        assert!(content.files[0].contains("file.txt"));
    }

    #[test]
    fn test_fs_create_and_delete_dir() {
        let temp_dir = tempdir().unwrap();
        let new_dir = temp_dir.path().join("testdir");

        assert!(fs_create_dir(new_dir.to_str().unwrap()));
        assert!(new_dir.exists());
        assert!(new_dir.is_dir());

        assert!(fs_delete_dir(new_dir.to_str().unwrap()));
        assert!(!new_dir.exists());
    }

    #[test]
    fn test_fs_is_dir_empty() {
        let temp_dir = tempdir().unwrap();
        let empty_dir = temp_dir.path().join("empty");
        let non_empty_dir = temp_dir.path().join("nonempty");

        fs::create_dir(&empty_dir).unwrap();
        fs::create_dir(&non_empty_dir).unwrap();
        fs::File::create(non_empty_dir.join("file.txt")).unwrap();

        assert!(fs_is_dir_empty(empty_dir.to_str().unwrap()).unwrap());
        assert!(!fs_is_dir_empty(non_empty_dir.to_str().unwrap()).unwrap());
    }

    #[test]
    fn test_fs_next_available_dir_path() {
        let temp_dir = tempdir().unwrap();
        fs::create_dir(temp_dir.path().join("mydir")).unwrap();

        let result = fs_next_available_dir_path(temp_dir.path().join("mydir").to_str().unwrap());
        assert_eq!(result, temp_dir.path().join("mydir1").to_str().unwrap());
    }

    #[test]
    fn test_fs_rename_dir() {
        let temp_dir = tempdir().unwrap();
        let old_dir = temp_dir.path().join("oldname");
        let new_dir = temp_dir.path().join("newname");

        fs::create_dir(&old_dir).unwrap();

        assert!(fs_rename_dir(
            old_dir.to_str().unwrap(),
            new_dir.to_str().unwrap()
        ));
        assert!(!old_dir.exists());
        assert!(new_dir.exists());
    }

    #[test]
    fn test_fs_get_dir_content_nonexistent() {
        let content = fs_get_dir_content("/nonexistent/path/that/does/not/exist");
        assert!(content.dirs.is_empty());
        assert!(content.files.is_empty());
    }
}
