import { useState } from 'react'
import { Button, Form, Upload, Modal } from 'antd'
import { UploadOutlined } from '@ant-design/icons'

// eslint-disable-next-line react/prop-types
function Test({ handleSubmit }) {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [importedFile, setImportedFile] = useState(null)
  const [form] = Form.useForm()

  const showModal = () => {
    setIsModalVisible(true)
  }

  const handleSubmitFile = (info) => {
    const file = info.file; // Get the original file object
    setImportedFile(file)
    info.onSuccess()
    return false
};

  const handleCancel = () => {
    setIsModalVisible(false)
    setImportedFile(null)
    form.resetFields()
  }

  const handleUpload = async () => {
    if (importedFile) {
      const formData = new FormData()
      formData.append('FileRequest', importedFile)
      await handleSubmit(formData)
      handleCancel()
    }
  }

  return (
    <>
      <Button onClick={showModal} type="primary" size="medium">
        Open Upload Form
      </Button>
      <Modal
        title="Upload Form"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleUpload}
            disabled={!importedFile}
          >
            Submit
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
        <div className="flex justify-center items-center h-full">
            <Form.Item name="imageFile">
                <Upload
                accept=".xlsx"
                maxCount={1}
                showUploadList={true}
                customRequest={handleSubmitFile}
                >
                <Button icon={<UploadOutlined />}>Upload File</Button>
                </Upload>
            </Form.Item>
            </div>
        </Form>
      </Modal>
    </>
  )
}

export default Test;
