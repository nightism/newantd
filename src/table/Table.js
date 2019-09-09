import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import {
    Table as AntdTable, Divider, Row, Button, Input, Icon,
} from 'antd'

import { localizeDateTime, localizeDateTimeUnix } from '../utils/stringUtils'
import { DEFAULT_TABLE_PAGE_SIZE } from '../constants'
import { isEmpty } from '../utils/miscUtils'
import './styles.css'

export const ActionLink = {
    LINK: 0,
    ANCHOR: 1,
}

export class Table extends React.Component {
    static propTypes = {
        rowKey: PropTypes.string.isRequired,
        defaultPageSize: PropTypes.number,
        defaultCurrent: PropTypes.number,
        pageSizeOptions: PropTypes.arrayOf(PropTypes.string),
        showPagination: PropTypes.bool,
        serverPagination: PropTypes.object,
        headers: PropTypes.object,
        crossPageSelection: PropTypes.bool,
        selectionChanged: PropTypes.func,
        selectedItems: PropTypes.arrayOf(PropTypes.object),
    }

    static defaultProps = {
        defaultPageSize: DEFAULT_TABLE_PAGE_SIZE,
        defaultCurrent: 1,
        pageSizeOptions: ['10', '25', '50', '100'],
        showPagination: true,
        serverPagination: null,
        headers: null,
        crossPageSelection: false, //not compatible with serverPagination
        selectionChanged: () => { },
        selectedItems: [],
    }

    constructor(props) {
        super(props)

        this.state = {
            sorter: {},
            filteredDataSource: props.dataSource,
            filters: {},
        }

        this.renderPagination = this.renderPagination.bind(this)
    }

    componentDidUpdate(prevProps) {
        const { dataSource } = this.props
        if (dataSource !== prevProps.dataSource) {
            // reapply filters based on new data source
            const { filters } = this.state
            const filteredDataSource = this.searchAllFilters(filters, dataSource)
            this.setState({
                filteredDataSource,
            })
        }
    }

    // update sorting state
    onTableChange(pagination, filters, sorter) {
        this.setState({ sorter })
    }

    // helper method to update the state of a filter. Will return the updated filters, so you can setState afterwards
    updateAndGetFilterStates(key, { value, filtered, visible } = {}) {
        const { filters } = this.state
        const currentFilter = filters[key] || { value: '', filtered: false, visible: false }
        const newFilter = { ...currentFilter }
        if (value !== undefined) {
            newFilter.value = value
        }
        if (filtered !== undefined) {
            newFilter.filtered = filtered
        }
        if (visible !== undefined) {
            newFilter.visible = visible
        }
        return {
            ...filters,
            [key]: newFilter,
        }
    }

    // Go through all filters and apply the search for each active filter
    searchAllFilters(filters, dataSource) {
        const { columns } = this.props
        let filteredDataSource = dataSource
        Object.entries(filters).forEach(([filterKey, filter]) => {
            const targetColumn = columns.find(item => item.dataIndex === filterKey)
            if (filter.filtered && filter.value && targetColumn && targetColumn.searcher) {
                filteredDataSource = targetColumn.searcher(filteredDataSource, filter.value)
            }
        })
        return filteredDataSource
    }

    handleSearchInputChange(event, key) {
        const { value } = event.target
        const filters = this.updateAndGetFilterStates(key, { value })
        this.setState({ filters })
    }

    handleSearch(value, key) {
        const { dataSource } = this.props
        const filters = this.updateAndGetFilterStates(key, { value, visible: false, filtered: !!value.length }) // filter is false if value is empty
        const filteredDataSource = this.searchAllFilters(filters, dataSource)
        this.setState({
            filteredDataSource,
            filters,
        })
    }

    // We enforce that the rowkey is string although Antd table supports string or func
    // This is just to make things simpler
    extractRowKey(row) {
        const { rowKey } = this.props
        return row[rowKey]
    }

    handleSelect(record, selected) {
        const { selectionChanged, selectedItems } = this.props
        const index = selectedItems.findIndex(item => this.extractRowKey(item) === this.extractRowKey(record))

        if (selected && index === -1) {
            selectionChanged([...selectedItems, record])
        } else if (!selected && index > -1) {
            selectionChanged([...selectedItems.slice(0, index), ...selectedItems.slice(index + 1)])
        }
    }

    /**
     * Fires when "select all" button is clicked. Ant design table does NOT support select/deselect all across pages. We support this by setting the internal selection states manually.
     * @param  {boolean} selected - Indicates if this is a select or deselect all action.
     */
    handleSelectAllInCurrentPage(selected) {
        const { selectionChanged } = this.props
        if (selected) {
            const { filteredDataSource } = this.state
            selectionChanged(filteredDataSource)
        } else {
            selectionChanged([])
        }
    }

    // for normal html anchors
    renderAnchor(index, link) {
        const config = {
            href: link.link,
            key: 2 * index,
        }
        if (link.onClick) {
            config.onClick = link.onClick
        }
        return <a {...config}>{link.name}</a>
    }

    // for react-dom Links
    renderLink(index, link) {
        const config = {
            pathname: link.link,
        }
        if (link.state) {
            config.state = link.state
        }
        return <Link to={config} key={2 * index}>{link.name}</Link>
    }

    renderLinks(data) {
        const links = []
        for (const [index, link] of data.entries()) {
            if (!link.hide) {
                if (link.type === ActionLink.LINK) {
                    links.push(this.renderLink(index, link))
                } else if (link.type === ActionLink.ANCHOR) {
                    links.push(this.renderAnchor(index, link))
                }
                links.push(<Divider type="vertical" key={(2 * index) + 1} />)
            }
        }
        links.splice(-1, 1) // remove the last divider
        return <span>{links}</span>
    }

    renderHeaderButton(key, data, styles) {
        const config = {
            key,
            type: 'primary',
            style: {
                marginRight: '8px',
                marginBottom: '6px',
                ...styles,
            },
        }
        if (data.type) {
            config.type = data.type
        }
        if (data.onClick) {
            config.onClick = data.onClick
        }
        if (data.disabled) {
            config.disabled = data.disabled
        }
        if (data.icon) {
            config.icon = data.icon
        }
        return <Button {...config}>{data.name}</Button>
    }

    renderHeaderSearch(key, data, styles) {
        const config = {
            key,
            placeholder: 'search...',
            style: Object.assign({
                marginRight: '8px',
                marginBottom: '6px',
                width: '40%',
            }, styles),
        }
        Object.assign(config, data)
        return <Input.Search {...config} />
    }

    // for rendering stuff on top of table
    renderHeaders(headers, rowSelection) {
        const rows = []
        if (headers) {
            let index = 0
            const headerElements = []
            if (headers.leftButtons) {
                for (const [i, data] of headers.leftButtons.entries()) {
                    headerElements.push(this.renderHeaderButton(index + i, data, { marginLeft: '5px' }))
                }
                index = headers.leftButtons.length
            } else if (headers.leftSearchs) {
                for (const [i, data] of headers.rightSearchs.entries()) {
                    headerElements.push(this.renderHeaderSearch(index + i, data, { marginLeft: '5px' }))
                }
            }

            if (headers.rightButtons) {
                for (const [i, data] of headers.rightButtons.entries()) {
                    headerElements.push(this.renderHeaderButton(index + i, data, { textAlign: 'right', float: 'right' }))
                }
            } else if (headers.rightSearchs) {
                for (const [i, data] of headers.rightSearchs.entries()) {
                    headerElements.push(this.renderHeaderSearch(index + i, data, { float: 'right' }))
                }
            }
            rows.push(<Row key="header-buttons">{headerElements}</Row>)
        }

        if (rowSelection) {
            rows.push(<Row key="selected" className="p-r-md" style={{ textAlign: 'right' }}>{`Total Selected: ${rowSelection.selectedRowKeys.length}`}</Row>)
        }
        return rows
    }

    setUpPagination(tableConfig) {
        const {
            defaultPageSize, defaultCurrent, pageSizeOptions, serverPagination, showPagination,
        } = this.props
        const newTableConfig = { ...tableConfig }
        if (!showPagination) {
            newTableConfig.pagination = false
            return newTableConfig
        }
        const paginationConfig = {
            defaultPageSize,
            defaultCurrent,
            pageSizeOptions,
            showSizeChanger: true,
            showTotal: this.renderPagination,
        }
        if (serverPagination) {
            paginationConfig.onChange = serverPagination.onPageChange
            paginationConfig.onShowSizeChange = serverPagination.onPageChange
            paginationConfig.total = serverPagination.totalRecords
        }
        newTableConfig.pagination = {
            ...paginationConfig,
            ...tableConfig.pagination,
        }
        return newTableConfig
    }

    setUpColumns(tableConfig) {
        const { sorter } = this.state
        const newTableConfig = { ...tableConfig }
        for (const column of newTableConfig.columns) {
            if (column.colType === 'datetime') {
                column.render = dateStr => localizeDateTime(dateStr)
            } else if (column.colType === 'datetimeunix') {
                column.render = dateStr => localizeDateTimeUnix(dateStr)
            } else if (column.colType === 'links' && column.actions) {
                column.render = (value, record) => {
                    const data = column.actions(value, record)
                    return this.renderLinks(data)
                }
            }

            if (column.sorter) {
                column.sortOrder = sorter.columnKey === column.key && sorter.order
                newTableConfig.onChange = (pagination, filters, sorterFunc) => this.onTableChange(pagination, filters, sorterFunc)
            }

            if (column.searcher) {
                const { dataIndex } = column
                const filters = this.updateAndGetFilterStates(dataIndex)
                const filter = filters[dataIndex]

                column.filterIcon = <Icon type="search" style={{ color: filter.filtered ? '#108ee9' : '#aaa' }} />
                column.filterDropdownVisible = filter.visible
                column.onFilterDropdownVisibleChange = (visible) => {
                    const newFilters = this.updateAndGetFilterStates(dataIndex, { visible })
                    this.setState({ filters: newFilters })
                }
                column.filterDropdown = column.filterDropdownVisible ? (
                    <Row className="custom-filter-dropdown">
                        <Input.Group>
                            <Input
                                className="m-t-sm m-b-sm"
                                style={{ width: 200 }}
                                placeholder="Search"
                                value={filter.value}
                                onChange={event => this.handleSearchInputChange(event, dataIndex)}
                                onPressEnter={() => { this.handleSearch(filter.value, dataIndex) }}
                                autoFocus
                            />
                            <Button.Group className="m-t-sm m-b-sm">
                                <Button
                                    type="primary"
                                    onClick={() => this.handleSearch(filter.value, dataIndex)}
                                >
                                    <Icon type="search" />
                                </Button>
                                <Button
                                    type="danger"
                                    onClick={() => this.handleSearch('', dataIndex)}
                                >
                                    <Icon type="close" />
                                </Button>
                            </Button.Group>
                        </Input.Group>
                    </Row>
                ) : <div />
            }
        }

        return newTableConfig
    }

    setUpCrossPageSelection(tableConfig) {
        const { selectedItems, crossPageSelection } = this.props
        const newTableConfig = { ...tableConfig }

        if (crossPageSelection) {
            const selectedRowKeys = selectedItems.map(row => this.extractRowKey(row))

            newTableConfig.rowSelection = {
                selectedRowKeys,
                onSelect: (record, selected) => this.handleSelect(record, selected),
                onSelectAll: selected => this.handleSelectAllInCurrentPage(selected),
            }
        }
        return newTableConfig
    }

    setUpHeaders(tableConfig) {
        const { headers } = this.props
        if (!isEmpty(headers)) {
            const { rowSelection } = tableConfig
            const newTableConfig = { ...tableConfig }
            newTableConfig.title = () => this.renderHeaders(headers, rowSelection)
            return newTableConfig
        }
        return tableConfig
    }

    /* eslint-disable no-unused-vars */
    renderPagination(total, range) {
        return (
            <div>
                {`Total: ${total}`}
            </div>
        )
    }

    render() {
        let tableConfig = { ...this.props }
        const { filteredDataSource } = this.state

        tableConfig = this.setUpPagination(tableConfig)
        tableConfig = this.setUpColumns(tableConfig)
        tableConfig = this.setUpCrossPageSelection(tableConfig)
        tableConfig = this.setUpHeaders(tableConfig) //must come after setUpCrossPageSelection

        return (
            <AntdTable
                {...tableConfig}
                dataSource={filteredDataSource}
            />
        )
    }
}

export default Table

/*
column examples:
{
    //normal column
    title: 'Category',
    dataIndex: 'job_category',
    key: 'job_category',
    render: (value) => { something }
}
{
    //automatically help you render proper datetime
    title: 'Created Time',
    dataIndex: 'created_time',
    key: 'created_time',
    colType: 'datetime'
}
{
    //if the sorter property is active, the table will help you handle all sorting
    //if the searchText property is active, the column will allow you to search text
    title: 'Region',
    key: 'country',
    dataIndex: 'country',
    sorter: (a, b) => a.country > b.country ? 1 : -1,
    searcher: (records, search_val) => records,
}
{
    //automatically help you render a list of react-dom Links or html anchors
    title: 'Actions',
    colType: 'links',
    actions: (value, record) => {
        return [
            {
                type: ActionLink.LINK
                name: 'Details',
                link: formatPath(Paths.TOOLBOX_JOB_HISTORY_DETAIL, currProd.name, record.id),
                state: {query: this.state.query}    //optional state
            },
            {
                type: ActionLink.ANCHOR,
                name: 'Details',
                href: '/path/to/something',
                onClick: () => {something}
            }
        ]
    }
}

serverPagination example
{
    onPageChange: (page, pageSize) => {some logic},
    totalRecords: 0
}

headers example
{
    //leftButtons or rightButtons or both
    leftButtons: [{
        name: 'Add',
        type: 'primary', //antd Button type
        onClick: () => {something}
    }],
    rightButtons: [...]
}
*/
