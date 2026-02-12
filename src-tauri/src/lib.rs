mod fs_wrapper {
    pub mod dirs;
    pub mod files;
}

use fs_wrapper::dirs::*;
use fs_wrapper::files::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            fs_file_exist,
            fs_read_file,
            fs_write_file,
            fs_create_file,
            fs_delete_file,
            fs_rename_file,
            fs_get_dir_content,
            fs_create_dir,
            fs_delete_dir,
            fs_rename_dir
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
