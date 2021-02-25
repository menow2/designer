/**
 * XGraph Opensource
 * This source code is licensed under the MIT license.
 * 
 * CheMingjun @2019
 * Mail:chemingjun@126.com Wechat:ALJZJZ
 */

export function copy(content) {
  const input = document.createElement('input');
  document.body.appendChild(input);
  input.setAttribute('value', content);
  input.select();
  if (document.execCommand('copy')) {
    document.execCommand('copy');
  }
  document.body.removeChild(input);
  return true
}