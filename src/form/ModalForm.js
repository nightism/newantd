import React from 'react'
import PropTypes from 'prop-types'
import { Form, Modal } from 'antd'

export default function createModalForm(
    WrappedComponent,
    onValidateSuccess,
    onValidateFailure,
    // (ModalForm, form) => void
    // The `propsFn` is be useful when you need to set custom props while having to
    //   reference modal methods (like ok/cancel handlers)
    propsFn,
) {
    class ModalForm extends React.Component {
        static propTypes = {
            onOk: PropTypes.func.isRequired,
            onCancel: PropTypes.func,
            title: PropTypes.string,
            initialData: PropTypes.object,
            isVisible: PropTypes.bool.isRequired,
        }

        static defaultProps = {
            onCancel: () => { },
            title: '',
            initialData: {},
        }

        modalOk() {
            const { initialData, form, onOk } = this.props
            form.validateFieldsAndScroll((err, values) => {
                if (!err) {
                    if (onValidateSuccess) {
                        onOk(onValidateSuccess(initialData, values))
                    } else {
                        onOk(values)
                    }
                } else if (onValidateFailure) {
                    onValidateFailure(initialData, values)
                }
            })
        }

        modalCancel() {
            const { onCancel } = this.props
            onCancel()
        }

        render() {
            const {
                isVisible, title, initialData, form, ...extraProps
            } = this.props
            return (
                <Modal
                    width="80%"
                    title={title}
                    visible={isVisible}
                    onOk={() => this.modalOk()}
                    onCancel={() => this.modalCancel()}
                    okText="Submit"
                    destroyOnClose
                    {...propsFn ? propsFn(this, form) : null}
                >
                    <Form layout="horizontal">
                        <WrappedComponent
                            initialData={initialData}
                            form={form}
                            {...extraProps}
                        />
                    </Form>
                </Modal>
            )
        }
    }

    return Form.create()(ModalForm)
}
