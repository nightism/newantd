import React from 'react'
import merge from 'lodash.merge'
import {
    Input, Form, Tooltip, Switch, Select, InputNumber, Checkbox,
} from 'antd'
import * as formUtils from '../utils/formUtils'

export function genericField(component, form, prop, label, initialValue, isRequired, extras) {
    if (!form || !prop || !component) {
        throw new Error('Invalid arguments')
    }
    const {
        formItemProps, decoratorProps, tooltipProps, customRules, customValidityMessage, postfixComp, hidden,
    } = extras || {}

    const rules = []
    if (isRequired) {
        const rule = {
            required: true,
            message: customValidityMessage || 'This field is required.'
        }
        if (component instanceof Input) {
            rule.whitespace = true
        }
        rules.push(rule)
    }

    if (customRules) {
        rules.push(...customRules)
    }

    let fieldDecorator = form.getFieldDecorator(prop, {
        rules,
        validateFirst: true,
        initialValue,
        ...decoratorProps,
    })(component)

    if (tooltipProps) {
        fieldDecorator = <Tooltip {...tooltipProps}>{fieldDecorator}</Tooltip>
    }

    const style = {}
    if (hidden) {
        style.display = 'none'
    }

    const postFix = postfixComp || ''

    return (
        <Form.Item {...formUtils.FORM_ITEM_LAYOUT} label={label} key={prop} style={style} {...formItemProps}>
            {fieldDecorator}
            {postFix}
        </Form.Item>
    )
}

export function genericInputField(form, name, label, initialValue, isRequired, extras) {
    const { inputProps } = extras || {}
    const component = <Input {...inputProps} />
    return genericField(component, ...arguments)
}

export function genericTextAreaInputField(form, name, label, initialValue, isRequired, extras) {
    const { textAreaProps } = extras || {}
    const component = <Input.TextArea {...textAreaProps} />
    return genericField(component, ...arguments)
}

export function genericNumberInputField(form, name, label, initialValue, isRequired, extras) {
    const { numberInputProps } = extras || {}
    const component = <InputNumber {...numberInputProps} />
    return genericField(component, ...arguments)
}

export function nameStringField(form, name, label, initialValue, isRequired = true, extras) {
    return genericInputField(
        form,
        name,
        label || 'Name',
        initialValue,
        isRequired,
        merge(
            {
                customRules: [formUtils.createValidationRule(formUtils.validateName, 'Only alphanumeric characters, "-", "_", or space allowed')],
                inputProps: {
                    placeholder: 'Alphanumeric characters, "-", "_", or space allowed',
                },
            },
            extras,
        ),
    )
}

export function switchField(form, name, label, initialValue, isRequired, extras) {
    const { switchProps } = extras || {}
    return genericField(
        <Switch {...switchProps} />,
        form,
        name,
        label,
        initialValue,
        isRequired,
        merge(
            {
                decoratorProps: {
                    valuePropName: 'checked',
                },
            },
            extras,
        ),
    )
}

function fetchProp(obj, prop) {
    return prop ? obj[prop] : obj
}

export function genericSelectorField(form, name, label, initialValue, isRequired, options, valueProp, textProp, extras) {
    const { selectorProps } = extras || {}
    return genericField(
        <Select {...selectorProps}>
            {(options || []).map(opt => (
                <Select.Option key={fetchProp(opt, valueProp)} value={fetchProp(opt, valueProp)}>
                    {fetchProp(opt, textProp)}
                </Select.Option>
            ))}
        </Select>,
        form,
        name,
        label,
        initialValue,
        isRequired,
        extras,
    )
}

/**
 * Note that unlike ant design selector, the checkbox group does not have a value associated with each option, hence the selected values are taken from display values.
 */
export function genericCheckboxGroupField(form, name, label, initialValue, isRequired, options, extras) {
    const { checkboxGroupProps } = extras || {}
    return genericField(
        (<Checkbox.Group options={options} {...checkboxGroupProps} />),
        form,
        name,
        label,
        initialValue,
        isRequired,
        extras,
    )
}
