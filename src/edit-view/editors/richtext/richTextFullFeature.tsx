import React, { useState, useEffect, useCallback } from 'react'
import { useObservable } from 'rxui'
import { Modal, message } from 'antd'
import uploadimage from './plugins/uploadimage'
import { isValid, hasScripts, loadScript } from '../utils'
import css from './index.less'

const tinymceCDN: string = 'https://cdn.jsdelivr.net/npm/tinymce@5.7.0/tinymce.min.js'
const disabledStyle = {
  color: 'rgba(0,0,0,.25)',
  background: '#f5f5f5',
  borderColor: '#d9d9d9',
  cursor: 'not-allowed'
} as {
  color: string
  background: string
  borderColor: string
  cursor: string
}
let POWEROS_ENV: string = ''
let Uploadimage: any
// let modalTimy: any
export default function(editConfig): any {
  const [editor, setEditor]: any = useState();
  const [editorFullScreen, setEditorFullScreen]: any = useState();
  const { value } = editConfig;
  const env = 'dev'
  const model = useObservable({
    val: isValid(value.get()) ? value.get() : "",
    value}, [value.get()]);
  const imgModalContext = useObservable({
    visible: false,
    url: '',
    noUpdate: false
  })
  const tmcModalContext = useObservable({
    visible: false
  })

  const openImgModal = useCallback((isUpdate = false) => {
    imgModalContext.visible = true
    imgModalContext.noUpdate = isUpdate
  }, [])

  const closeImgModal = useCallback(() => {
    imgModalContext.visible = false
    imgModalContext.url = ''
    imgModalContext.noUpdate = false
  }, [])

  const imgSet = useCallback((url) => {
    imgModalContext.url = url
  }, [])

  const update = useCallback((bool) => {
    let content = model.val || ''
    if (tmcModalContext.visible || bool) {
      content = editorFullScreen?.getContent();
      editor?.setContent(content)
    } else {
      content = editor?.getContent();
      editorFullScreen?.setContent(content)
    }
    model.val = content;
    model.value.set(model.val);
  }, [editor, editorFullScreen])
  
  const load = useCallback(async () => {
    await loadScript(tinymceCDN, 'tinyMCE')
    editorInit(model, editorFullScreen, setEditor, openImgModal, 'tinyMce2', tmcModalContext)
    addCustomIcons()
  }, [])

  // useEffect(() => {
  //   if (!tmcModalContext.visible) {
  //     const content = editor?.getContent()
  //     editorFullScreen?.setContent(content)
  //   }
  // }, [value.get()])

  useEffect(() => {
    if (!tmcModalContext.visible) {
      const content = editor?.getContent()
      editorFullScreen?.setContent(content)
    }
  }, [model.val])

  useEffect(() => {
    if (env !== 'pro') {
      POWEROS_ENV = env + '-'
    } else {
      POWEROS_ENV = ''
    }
    if (!hasScripts(tinymceCDN)) {
      load()
    } else {
      editorInit(model, editorFullScreen, setEditor, openImgModal, 'tinyMce2', tmcModalContext)
      addCustomIcons()
    }
    return () => {
      (window as any).tinyMCE.remove(editor);
      (window as any).tinyMCE.remove(editorFullScreen);
      // (window as any).tinyMCE.remove(modalTimy)
    }
  }, []);

  return (
    <div className={css['editor-rich-text']}>
      {/* <textarea id="tinyMce" value={model.val} readOnly style={{visibility: 'hidden'}}/> */}
      <textarea ref={() => {
            if (!editor) {
              editorInit(model, editorFullScreen, setEditor, openImgModal, 'tinyMce2', tmcModalContext)
            }
          }}
          id="tinyMce2"
          hidden
          readOnly
          value={model.val}
        />
      <Modal
        title="富文本编辑器"
        width="100%"
        style={{top: 0}}
        visible={tmcModalContext.visible}
        onCancel={() => {
          tmcModalContext.visible = false
        }}
        afterClose={() => {
          update(true)
        }}
        footer={null}
        className={css['customModal']}
        zIndex={1001}
      >
        <textarea ref={() => {
            if (!editorFullScreen) {
              editorInit(model, editor, setEditorFullScreen, openImgModal, 'tinyMce', tmcModalContext)
            }
          }}
          id="tinyMce"
          hidden
          readOnly
          value={model.val}
        />
      </Modal>
      <RenderImgModal {...imgModalContext} close={closeImgModal} set={imgSet} update={update} paste={paste} editor={tmcModalContext.visible ? editorFullScreen : editor}/>
    </div>
    )
}

function RenderImgModal (props: any) {
  let container: any = null
  const { visible , url, close, set, update, paste, editor } = props
  return (
    <>
      <input
        style={{display: 'none'}}
        type='file'
        accept="image/*"
        ref={(node) => container = node}
        className={css['editor-upload__input']}
        onChange={(evt) => {
          const file: any = (evt.target && evt.target.files && evt.target.files[0]) || null
          if (file) {
            upload(file, set)
            evt.target.value = ''
          }
        }}
      />
      <Modal
        title="上传图片"
        visible={visible}
        width={520}
        bodyStyle={{
          padding: '8px 24px'
        }}
        footer={[
          <div className={css['editor-rich-text__footBtn']} key="button">
            <div 
              className={`${css['editor-rich-text__modalbtn']} ${css['editor-rich-text__footBtn-determine']}`}
              style={url?.length ? {} : disabledStyle}
              onClick={() => {
                if (!url?.length) return
                Uploadimage.setUrl(url, editor)
                close()
                update()
              }}
            >
              确定
            </div>
          </div>
        ]}
        onCancel={() => {
          close()
        }}
        zIndex={1002}
      >
        <div className={css['editor-rich-text__modalbtn']} onClick={() => {
          container?.click()
        }}>文件选择</div>
        <div className={css['editor-rich-text__modal']}>
          <textarea
            onPaste={(e) => paste(e, set)}
            className={css['editor-rich-text__modal-text']}
            ref={e => {
              if (visible) {
                e?.focus()
              } else if (e) {
                resetTextArea(e)
              }
            }}
          />
          <div className={css['editor-rich-text__modal-placeholder']}>
            {!url?.length ? 
              <div className={css['editor-rich-text__modal-placeholder-text']}>
                <div>可直接粘贴截屏内容</div>
                <div>若粘贴后未响应请点击此处后再试</div>
              </div> :
              <div className={css['editor-rich-text__modal-placeholder-img']} style={{backgroundImage:`url(${url})`}}/>
            }
          </div>
        </div>
      </Modal>
    </>
  )
}

function resetTextArea(e: any) {
  e.value = ''
}
function paste(e: any, imgSet: any) {
  const cbd = e.clipboardData
  
  if (!(e.clipboardData && e.clipboardData.items)) return
  if(cbd.items && cbd.items.length === 2 && cbd.items[0].kind === "string" && cbd.items[1].kind === "file" && cbd.types && cbd.types.length === 2 && cbd.types[0] === "text/plain" && cbd.types[1] === "Files") return

  for(let i = 0; i < cbd.items.length; i++) {
    const item = cbd.items[i]

    if(item.kind == "file"){
      const file = item.getAsFile()
      if (file?.size === 0) return
      upload(file, imgSet)
      e.target.value = ''
    }
  }
}

function init(selector: any, height: any, isFullScreen: any, setup: any) {
  if (!(window as any).tinyMCE) return
  //  'codesample', 'hr', 'lists'
  const plugins: any = ['table', 'link', 'uploadimage', 'paste', 'fullpage', 'customfullscreen', 'customfullscreenexit']
  let toolbar = `
    undo 
    redo 
    fontsizeselect 
    bold 
    italic 
    underline 
    strikethrough 
    alignleft 
    aligncenter 
    alignright 
    forecolor 
    backcolor 
    removeforma 
    link 
    uploadimage 
    table 
    `;
    // link 
    // alignjustify 
    // codesample 
    // numlist 
    // bullist 
  if (!isFullScreen) {
    // plugins.push('customfullscreen')
    toolbar = toolbar + 'customfullscreen'
  } else {
    // 
    toolbar = toolbar + 'customfullscreenexit'
  }
  (window as any).tinyMCE.init({
    // selector: `#tinyMce`,
    selector,
    height,
    menubar: false,
    branding: false,
    statusbar: false,
    icons: 'customIcons',
    // plugins: [
    //   // 'paste',
    //   // 'link',
    //   'table',
    //   // 'image',
    //   // 'imagetools',
    //   'uploadimage',
    //   // 'fullscreen',
    //   'customfullscreen'
    // ],
    plugins,
    // toolbar: `
    // undo 
    // redo 
    // fontsizeselect 
    // formatselect 
    // bold 
    // alignleft 
    // aligncenter 
    // alignright 
    // alignjustify 
    // link 
    // table 
    // forecolor 
    // backcolor 
    // removeforma 
    // uploadimage 
    // customfullscreen 
    // `,
    toolbar,
    // image
    // fullscreen
    // toolbar: false,
    fontsize_formats: '12px 14px 16px 18px 20px 22px 24px 26px 28px 30px 32px 34px 36px 38px 40px 42px 46px 48px 50px 56px 60px 72px',
    fullpage_default_font_size: '12px',
    skin: `oxide`,
    theme: 'silver',
    // setup: (editor: any) => {
    //   setEditor(editor);
    //   editor.on("keyup change", () => {
    //     const content = editor.getContent();
    //     model.val = content;
    //     model.value.set(model.val);
    //   });
    // }
    setup,
    content_style: "p {margin: 0px; border:0px ; padding: 0px;}",
    // content_css: './index.less'
    placeholder: '请在此输入内容'
  });
}

function editorInit(model: any, stateEditor: any, setEditor: any, openImgModal: any, id: string, tmcModalContext: any) {
  if ((window as any).tinyMCE) {
    // window.tinyMCE.IconManager.add('customIcons', {
    //   icons: {
    //     'close': '<svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M444.444 418.37v66.667a72.691 72.691 0 0 1-64.987 72.395h-34.568c-101.037 0-183.012 58.074-183.012 159.21s81.975 162.864 183.012 162.864h282.37a183.111 183.111 0 0 0 183.111-183.11V418.37z" fill="#FF6B5B"/><path d="M444.247 269.136h366.025V418.37H444.247z" fill="#DC4E45"/><path d="M731.358 269.136v427.26a183.012 183.012 0 0 1-183.012 183.11h79.012a183.111 183.111 0 0 0 183.012-183.11v-427.26z" fill="#DC4E45"/><path d="M448.296 160.198h358.025a51.457 51.457 0 0 1 51.457 51.456v115.062a51.457 51.457 0 0 1-51.457 51.457H448.296a51.457 51.457 0 0 1-51.456-51.457V211.654a51.358 51.358 0 0 1 51.456-51.456z" fill="#C9FBF2"/><path d="M806.321 160.198h-73.383a51.358 51.358 0 0 1 51.358 51.456v115.062a51.358 51.358 0 0 1-51.358 51.457h73.383a51.457 51.457 0 0 0 51.457-51.457V211.654a51.457 51.457 0 0 0-51.457-51.456zm-279.012 310.42a27.95 27.95 0 1 1-27.951-27.951 27.95 27.95 0 0 1 27.95 27.95zm0 82.468a27.95 27.95 0 1 1-27.951-27.851 27.95 27.95 0 0 1 27.95 27.851z" fill="#A9ECEB"/></svg>',
    //   }
    // });
    // Uploadimage = uploadimage({
    //   click: (type: string) => {
    //     switch (type) {
    //       case 'uploadimage':
    //         openImgModal('')
    //         break
    //       // case 'customfullscreen':
    //       //   fullscreenTinyMce(model, () => {
    //       //     (window as any).tinyMCE.remove(editor);
    //       //     init('#tinyMce', 500, false, (editor: any) => {
    //       //       setEditor(editor);
    //       //       editor.on("keyup change", () => {
    //       //         const content = editor.getContent();
    //       //         model.val = content;
    //       //         model.value.set(model.val);
    //       //       });
    //       //     })
    //       //   })
    //       //   break
    //       // case 'customlink':
    //       //   console.log('链接')
    //       //   break
    //       default:
    //         break
    //     }
    //   }
    // });

    // init('#tinyMce', 500, false, (editor: any) => {
    //   setEditor(editor);
    //   editor.on("keyup change", () => {
    //     const content = editor.getContent();
    //     model.val = content;
    //     model.value.set(model.val);
    //   });
    // })

    const { visible } = tmcModalContext

    // 100vh - 相应的宽高
    init(`#${id}`, visible ? '100%' : 500, visible, (editor: any) => {
      Uploadimage = uploadimage({
        click: (type: string) => {
          switch (type) {
            case 'uploadimage':
              openImgModal('')
              break
            case 'customfullscreen':
              tmcModalContext.visible = true
              break
            case 'customfullscreenexit':
              tmcModalContext.visible = false
              break
            default:
              break
          }
        },
        editor
      });
      setEditor(editor);
      if (!visible) {
        editor.on("keyup change", () => {
          const content = editor.getContent();
          model.val = content;
        });
      }

      // if (isFullScreen) {
      //   editor.on("change", () => {
      //     const content = editor.getContent();
      //     console.log('full keyupchange')
      //     model.val = content;
      //   });
      // }

      editor.on('blur', () => {
        const content = editor.getContent();
        model.val = content;
        model.value.set(content)
        // console.log(stateEditor, 'stateEditor')
        // stateEditor?.setContent(content)
      })

    })
  }
}

function upload(file: any, set: any) {
  readAsDataURL(file,base64=>{
    set(base64)
    message.success('上传成功(注意:演示版仅做Base64处理.)')
  })
}

function addCustomIcons() {
  if ((window as any).tinyMCE && !(window as any).tinyMCE?.IconManager.has('customIcons')) {
    (window as any).tinyMCE?.IconManager.add('customIcons', {
      icons: {
        'fullscreenexit': '<svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 1024 1024" width="24" height="24"><path d="M391 240.9c-.8-6.6-8.9-9.4-13.6-4.7l-43.7 43.7L200 146.3a8.03 8.03 0 0 0-11.3 0l-42.4 42.3a8.03 8.03 0 0 0 0 11.3L280 333.6l-43.9 43.9a8.01 8.01 0 0 0 4.7 13.6L401 410c5.1.6 9.5-3.7 8.9-8.9L391 240.9zm10.1 373.2L240.8 633c-6.6.8-9.4 8.9-4.7 13.6l43.9 43.9L146.3 824a8.03 8.03 0 0 0 0 11.3l42.4 42.3c3.1 3.1 8.2 3.1 11.3 0L333.7 744l43.7 43.7A8.01 8.01 0 0 0 391 783l18.9-160.1c.6-5.1-3.7-9.4-8.8-8.8zm221.8-204.2L783.2 391c6.6-.8 9.4-8.9 4.7-13.6L744 333.6 877.7 200c3.1-3.1 3.1-8.2 0-11.3l-42.4-42.3a8.03 8.03 0 0 0-11.3 0L690.3 279.9l-43.7-43.7a8.01 8.01 0 0 0-13.6 4.7L614.1 401c-.6 5.2 3.7 9.5 8.8 8.9zM744 690.4l43.9-43.9a8.01 8.01 0 0 0-4.7-13.6L623 614c-5.1-.6-9.5 3.7-8.9 8.9L633 783.1c.8 6.6 8.9 9.4 13.6 4.7l43.7-43.7L824 877.7c3.1 3.1 8.2 3.1 11.3 0l42.4-42.3c3.1-3.1 3.1-8.2 0-11.3L744 690.4z"/></svg>'
      }
    });
  }
  
}

function readAsDataURL(file,callback){
  const reader = new FileReader();
  const image = new Image();
  const canvas = createCanvas();
  const ctx = canvas.getContext("2d");
  reader.onload = function(){
    const result = this.result;
    image.onload = function(){
      const imgScale = imgScaleW(800,this.width,this.height);
      canvas.width = imgScale.width;
      canvas.height = imgScale.height;
      ctx.drawImage(image,0,0,imgScale.width,imgScale.height);
      var dataURL = canvas.toDataURL('image/jpeg');
      ctx.clearRect(0,0,imgScale.width,imgScale.height);
      callback (dataURL);
    }
    image.src = result;
  };
  reader.readAsDataURL(file);
}

function createCanvas(){
  var canvas = document.getElementById('canvas');
  if(!canvas){
    var canvasTag = document.createElement('canvas');
    canvasTag.setAttribute('id','canvas');
    canvasTag.setAttribute('style','display:none;');//隐藏画布
    document.body.appendChild(canvasTag);
    canvas = document.getElementById('canvas');
  }
  return canvas;
}

function imgScaleW(maxWidth,width,height){
  let imgScale = {};
  let w = 0;
  let h = 0;
  if(width <= maxWidth && height <= maxWidth){
    imgScale = {
      width:width,
      height:height
    };
  }else{
    if(width >= height){
      w = maxWidth;
      h = Math.ceil(maxWidth * height / width);
    }else{
      h = maxWidth;
      w = Math.ceil(maxWidth * width / height);
    }
    imgScale = {
      width:w,
      height:h
    }
  }
  return imgScale;
}