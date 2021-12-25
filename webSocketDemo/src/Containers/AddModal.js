import {Modal, Input} from 'antd'

export default function AddModal(props) {
    const {visible, onCreate, onCancel, inputRef} = props
    return (
        <Modal
            title="Enter the start time of the new frame:"
            visible={visible}
            onOk={onCreate}
            onCancel={onCancel}
            okText="Create"
        >
            <Input placeholder="Start" ref={inputRef}/>
            
        </Modal>
    )
}
