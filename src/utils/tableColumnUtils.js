import React from 'react'
import { Icon } from 'antd'

import { defaultStringComparator } from 'utils/stringUtils'
import { ActionLink } from 'table/Table'

export function genericColumn(prop, title, extras) {
    return {
        title,
        key: prop,
        dataIndex: prop,
        ...extras,
    }
}

export function actionColumn(actions, extras) {
    return {
        title: 'Actions',
        colType: 'links',
        actions,
        ...extras,
    }
}

export function booleanToIconColumn(prop, title, extras) {
    return {
        title,
        key: prop,
        ...extras,
        render: (record) => {
            return record.enabled ?
                <Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" /> :
                <Icon type="close-circle" theme="twoTone" twoToneColor="#eb2f96" />
        },
    }
}

export function actionAnchor(name, onClick, extras) {
    return {
        type: ActionLink.ANCHOR,
        link: '#',
        name,
        onClick,
        ...extras,
    }
}

export function actionLink(name, link, state = undefined) {
    return {
        type: ActionLink.LINK,
        name,
        link,
        state,
    }
}

export function actionPopconfirm(name, title, onConfirm, extras) {
    return {
        type: ActionLink.POPCONFIRM,
        name,
        title,
        onConfirm,
        link: '#',
        ...extras,
    }
}

export function searchableStringColumn(prop, title, extras) {
    return genericColumn(prop, title, {
        ...extras,
        searcher: (list, val) => {
            if (!list || !val) {
                return list
            }
            return list.filter(item => `${item[prop] || ''}`.includes(`${val}`))
        },
    })
}

export function sortableStringColumn(prop, title, extras) {
    return genericColumn(prop, title, {
        ...extras,
        sorter: (a, b) => defaultStringComparator(a[prop], b[prop]),
    })
}

export function sortableBooleanColumn(prop, title, extras) {
    return booleanToIconColumn(prop, title, {
        ...extras,
        sorter: (a, b) => (a[prop] > b[prop] ? -1 : 1),
    })
}

export function sortableNumberColumn(prop, title, extras) {
    return genericColumn(prop, title, {
        ...extras,
        sorter: (a, b) => a[prop] - b[prop],
    })
}

export function sortableDateTimeColumn(prop, title, extras) {
    return genericColumn(prop, title, {
        ...extras,
        colType: 'datetime',
        sorter: (a, b) => Date.parse(a[prop]) - Date.parse(b[prop]),
    })
}

export function sortableUnixDateTimeColumn(prop, title, extras) {
    return genericColumn(prop, title, {
        ...extras,
        colType: 'datetimeunix',
        sorter: (a, b) => a[prop] - b[prop],
    })
}

export function sortableDateCreatedColumn(prop, extras) {
    return sortableDateTimeColumn(prop, 'Date Created', extras)
}

export function sortableLastUpdatedColumn(prop, extras) {
    return sortableDateTimeColumn(prop, 'Last Updated', extras)
}
