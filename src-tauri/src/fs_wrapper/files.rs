#[tauri::command]
pub fn fs_file_exist(filename: &str) -> bool {
    std::fs::File::open(filename).is_ok()
}

#[tauri::command]
pub fn fs_read_file(filename: &str) -> String {
    std::fs::read_to_string(filename).unwrap()
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
pub fn fs_delete_file(filename: &str) -> bool {
    std::fs::remove_file(filename).is_ok()
}

#[tauri::command]
pub fn fs_rename_file(old_filename: &str, new_filename: &str) -> bool {
    std::fs::rename(old_filename, new_filename).is_ok()
}
