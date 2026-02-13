use serde::Serialize;

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
    std::fs::remove_dir(path).is_ok()
}

#[tauri::command]
pub fn fs_rename_dir(old_path: &str, new_path: &str) -> bool {
    std::fs::rename(old_path, new_path).is_ok()
}
