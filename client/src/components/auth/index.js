import React, { useState, useRef } from 'react'
import { Form, Input, Button, Select, message } from 'antd'
import { requestAuthNum, validAuthNum } from '../../api/auth'

const { Option } = Select

const PHONE = 'phone'
const EMAIL = 'email'
const AUTH_NUM = 'authNum'

const Auth = () => {
  const [name, setName] = useState(PHONE)
  const [requested, setRequested] = useState(false)
  const formRef = useRef(null)
  const [form] = Form.useForm()

  const handleChange = (value) => {
    switch (value) {
      case PHONE:
        setName(PHONE)
        break

      case EMAIL:
        setName(EMAIL)
        break
    }
    formRef.current.setFieldsValue({
      type: value
    })
  }

  const handleRequestAuth = async () => {
    const form = formRef.current
    const { type, value } = form.getFieldValue()

    const body = {
      type,
      [name]: value
    }
    try {
      const res = await requestAuthNum(body)
      const { data } = res
      const { authNum } = data
      setRequested(true)
      message.info(`인증번호: ${authNum}`)
    } catch (e) {
      alert(e)
    }
  }

  const handleFinish = async (value) => {
    const { type, value: inputValue, authNum } = value

    const body = {
      type,
      [name]: inputValue,
      authNum
    }
    try {
      const res = await validAuthNum(body)
      const { data } = res
      const { msg } = data
      message.info(msg)
    } catch (e) {
      alert(e)
    }
  }

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Form form={form} ref={formRef} onFinish={handleFinish}>
        <Form.Item name="type" label="Type" rules={[{ required: true }]}>
          <Select
            placeholder="Select Type"
            onChange={handleChange}
            allowClear
          >
            <Option value={PHONE}>phone</Option>
            <Option value={EMAIL}>email</Option>
          </Select>
        </Form.Item>
        <Form.Item name="value" label='value' rules={[{ required: true }]}>
          <Input/>
        </Form.Item>
        {requested &&
        <Form.Item name={AUTH_NUM} label='token' rules={[{ required: true }]}>
          <Input/>
        </Form.Item>
        }
        <Form.Item>
          <Button style={{ marginRight: '8px' }} type="primary" htmlType="button" onClick={handleRequestAuth}>
            {requested ? '재요청' : '인증번호 요청'}
          </Button>
          {requested && <Button type="primary" htmlType="submit">Submit</Button>}
        </Form.Item>
      </Form>
    </div>

  )
}

export default Auth