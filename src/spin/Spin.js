import React from 'react'
import { Spin as AntSpin } from 'antd'
import './styles.css'

const Spin = (props) => {
    return <div className="spin-container"><AntSpin {...props} /></div>
}

export default Spin
