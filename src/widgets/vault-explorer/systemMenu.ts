import { LogicalPosition } from "@tauri-apps/api/dpi";
import { Menu, PredefinedMenuItemOptions } from "@tauri-apps/api/menu";

type ContextActionItem = {
    id: string;
    text: string;
    action: () => void;
};

type ContextPredefinedItem = PredefinedMenuItemOptions;

export type ContextMenuItem = ContextActionItem | ContextPredefinedItem;

export async function showSystemContextMenu(
    x: number,
    y: number,
    items: ContextMenuItem[],
) {
    const menu = await Menu.new({ items });

    try {
        await menu.popup(new LogicalPosition(x, y));
    } finally {
        await menu.close();
    }
}
