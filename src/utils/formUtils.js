export const FORM_ITEM_LAYOUT = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
}

export const FORM_ITEM_LAYOUT_ZERO = {
    labelCol: { span: 0 },
    wrapperCol: { span: 0 },
}

export const FORM_ITEM_LAYOUT_FULL = {
    wrapperCol: { span: 24 },
}

export function createValidationRule(validateFunc, errorStr) {
    return {
        validator: (rule, value, callback) => {
            if (!validateFunc(value)) {
                callback(errorStr)
            } else {
                callback()
            }
        },
    }
}

export function validateName(name) {
    const regex = /^[A-Za-z0-9-_ ]+$/
    return regex.test(name)
}

export function validateIP(ipAddress) {
    return (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipAddress))
}

export function validateSubnet(subnet) {
    return (/^((\b|\.)(1|2(?!5(?=6|7|8|9)|6|7|8|9))?\d{1,2}){4}(-((\b|\.)(1|2(?!5(?=6|7|8|9)|6|7|8|9))?\d{1,2}){4}|\/((1|2|3(?=1|2))\d|\d))\b$/.test(subnet))
}

export function validateFileName({ file }) {
    if (!file) {
        return false
    }
    return (/^[A-Za-z0-9-_ .]+$/.test(file.name))
}

export function validateTagKey(key) {
    const regex = /^[A-Za-z0-9-_]+$/
    return regex.test(key)
}

export function validateEmpty(input) {
    return input.length === 0
}

export function validateOTP(str) {
    if (!str) {
        return false
    }
    const regex = /^\d{6}$/
    return regex.test(str)
}

export function validateScript(script) {
    return script.content && script.content.length > 0
}

export function validateFilePath(path) {
    const regex = /^(\/([a-zA-z0-9-_])*)+$/
    return regex.test(path)
}

export function validateFileMode(fileMode) {
    if (fileMode === '') {
        return true
    }
    const regex = /^[0-7]{3}$/
    return regex.test(fileMode)
}

export function validateFileOwnAndGrp(usr) {
    if (usr === '') {
        return true
    }
    const regex = /^[a-zA-Z][a-zA-Z0-9-_]{0,49}$/
    return regex.test(usr)
}
