import api from '../utils/apiUtils'

const API_SERVER = '/api'

// 인증번호 요청
export const requestAuthNum = (body) => {
  try {
    return api.post(`${API_SERVER}/auth-nums`, body)
  } catch (e) {
    throw e
  }
}

//
export const validAuthNum = (body) => {
  try {
    return api.post(`${API_SERVER}/auth-num-tokens`, body)
  } catch (e) {
    console.log(e)
    throw e
  }

}