export function isEmpty(obj) {
    for (const key in obj) {
        if ({}.hasOwnProperty.call(obj, key)) {
            return false
        }
    }
    return true
}

// add keys for all the items for rendering purposes
export function addKeys(menu) {
    for (const [i, menuItem] of menu.entries()) {
        menuItem.key = i.toString()
        if (menuItem.children) {
            for (const [j, child] of menuItem.children.entries()) {
                child.key = menuItem.key + j.toString()
            }
        }
    }
    return menu
}
