/**
 * MyBricks Opensource
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * Mail:mybricks@126.com Wechat:ALJZJZ
 */

export function require(arr, callback) {
  if (!(arr instanceof Array)) {
    console.error("arr is not a Array");
    return false;
  }

  let REQ_TOTAL = 0,
    EXP_ARR = [],
    REQLEN = arr.length;

  arr.forEach(function (req_item, index, arr) {
    const $script = createScript(req_item, index);
    document.body.appendChild($script);

    (function ($script) {
      $script.onload = function () {
        REQ_TOTAL++;
        const script_index = $script.getAttribute('index');
        EXP_ARR[script_index] = this;

        if (REQ_TOTAL == REQLEN) {
          callback && callback.apply(this, EXP_ARR);
        }
      }
    })($script);
  })
}

function createScript(src, index) {
  const script = document.createElement('script');
  script.setAttribute('src', src);
  script.setAttribute('index', index);
  return script;
}