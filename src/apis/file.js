import { request } from '../utils/request';

/**
 * 添加文件
 * @param {import("../types/FileInfo").FileInfo} info
 * @returns {Promise<import("../types/Request").RequestResponse<any>>|Error}
 */
export function addFile(info) {
  if (!info.file_name) {
    return new Error('文件名不能为空');
  }
  if (!info.file_type) {
    return new Error('文件类型不能为空');
  }
  if (!info.files) {
    return new Error('文件不能为空');
  }
  return request
    .post('/file/addFile', info, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 0,
    })
    .then((res) => res.data);
}

/**
 * 删除文件
 * @param {number[]} ids
 * @returns {Promise<import("../types/Request").RequestResponse<any>>|Error}
 */
export function deleteFile(ids = []) {
  if (!ids.length) {
    return new Error('文件ID不能为空');
  }
  return request.post('/file/delFile', { ids }).then((res) => res.data);
}

/**
 * 获取文件列表
 * @param {import("../types/Request").RequestParams} params
 * @returns {Promise<import("../types/Request").RequestResponse<import("../types/FileInfo").FileInfo[]>>|Error}
 */
export function getFileList(params) {
  if (!params?.page || !params?.page_size) {
    return new Error('页码和每页数量不能为空');
  }
  return request.post('/file/getFileList', params).then((res) => res.data);
}
