import { request } from '../utils/request';

/**
 * 添加用户
 * @param {import("../types/UserInfo").UserInfo} info
 * @returns {Promise<import("../types/Request").RequestResponse<any>>|Error}
 */
export function addUser(info) {
  if (!info.username) {
    return new Error('用户名不能为空');
  }
  return request.post('/user/addUser', info).then((res) => res.data);
}

/**
 * 删除用户
 * @param {number[]} ids
 * @returns {Promise<import("../types/Request").RequestResponse<any>>|Error}
 */
export function deleteUser(ids = []) {
  if (!ids.length) {
    return new Error('用户ID不能为空');
  }
  return request.post('/user/delUser', { ids }).then((res) => res.data);
}

/**
 * 更新用户
 * @param {import("../types/UserInfo").UserInfo} info
 * @returns {Promise<import("../types/Request").RequestResponse<any>>|Error}
 */
export function updateUser(info) {
  if (!info.id) {
    return new Error('用户ID不能为空');
  }
  // FIXME: 请求地址不友好
  return request.post('/user/setUserMessage', info).then((res) => res.data);
}

/**
 * 获取用户列表
 * @param {import("../types/Request").RequestParams} params
 * @returns {Promise<import("../types/Request").RequestResponse<import("../types/UserInfo").UserInfo[]>>|Error}
 */
export function getUserList(params) {
  if (!params?.page || !params?.page_size) {
    return new Error('页码和每页数量不能为空');
  }
  return request.post('/user/userList', params).then((res) => res.data);
}

/**
 * 用户登录
 * @param {string} username 用户名
 * @param {string} password 密码
 * @returns {Promise<import("../types/Request").RequestResponse<{ token: string, expiresAt: number, user: import("../types/UserInfo").UserInfo }>>|Error}
 */
export function login(username = '', password = '') {
  if (!username || !password) {
    return new Error('用户名和密码不能为空');
  }
  return request.post('/user/login', { username, password }).then((res) => res.data);
}

/**
 * 用户退出登录
 * @returns {Promise<import("../types/Request").RequestResponse<any>>|Error}
 */
export function logout() {
  return request.post('/user/loginOut').then((res) => res.data);
}

export default {
  getUserList,
  addUser,
  deleteUser,
  updateUser,
  login,
  logout,
};
