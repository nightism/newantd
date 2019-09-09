import moment from 'moment'

export function defaultStringComparator(a, b) {
    if (a < b) {
        return -1
    }
    if (a > b) {
        return 1
    }
    return 0
}

export function compareIgnoreCase(a, b) {
    return a.localeCompare(b, undefined, { sensitivity: 'base' })
}

export function findIgnoreCase(s, search) {
    return s.toLowerCase().indexOf(search.toLowerCase())
}

export function includeIgnoreCase(s, search) {
    return findIgnoreCase(s, search) >= 0
}

export function selectFieldStringSearch(input, option) {
    return option.props.children.toLowerCase().includes(input.toLowerCase())
}

export function localizeDateTime(dateStr) {
    if (!dateStr) {
        return ''
    }
    return moment(dateStr).format('YYYY-MM-DD HH:mm:ss')
}

export function localizeDateTimeUnix(dateUnix) {
    if (!dateUnix) {
        return ''
    }
    return moment.unix(dateUnix).format('YYYY-MM-DD HH:mm:ss')
}


export function prettifyJSON(json, indent = 2) {
    try {
        const obj = JSON.parse(json)
        return JSON.stringify(obj, null, indent)
    } catch (_) {
        // just return the original string if it's not a valid JSON input
        return json
    }
}

export function encodeObjectAsQueryString(obj) {
    return Object
        .keys(obj)
        .filter(k => obj[k] !== null && obj[k] !== undefined)
        .map((k) => {
            if (Array.isArray(obj[k])) {
                return obj[k].map(v => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
            }
            return `${encodeURIComponent(k)}=${encodeURIComponent(typeof obj[k] === 'object' ? JSON.stringify(obj[k]) : obj[k])}`
        })
        .flat()
        .join('&')
}
