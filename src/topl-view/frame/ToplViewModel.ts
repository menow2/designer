/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * MyBricks team @2019
 * mailTo:mybricks@126.com wechatID:ALJZJZ
 */

import FrameModel from './FrameModel';

import {I_Frame, I_Pin, I_Runner} from '@mybricks/compiler-js';
import {ToplComModel} from '../com/ToplComModel';
import {clone, Ignore, Serializable} from 'rxui';
import {SerializeNS, VIEW_TOPL_NAME} from '../constants';

@Serializable(SerializeNS + 'topl.ToplViewModel')
export default class ToplViewModel extends FrameModel {
  name: string = VIEW_TOPL_NAME

  isFrame: boolean = false

  @Ignore
  runner: I_Runner
}


function getInitFn(model: ToplComModel, instResolve?) {
  return (dataModel) => (fn, inst) => {
    let executor;
    let frames = {}
    model.frames && model.frames.forEach((frame: I_Frame) => {
      frames[frame.hostId] = {
        exe() {
          return executor.frame(frame, arguments)
        },
        get inputs() {
          let rtn = {};
          frame.inputPins.forEach(pin => {
            rtn[pin.hostId] = {id: pin.id, title: pin.title}
          })
          return rtn;
        },
        get outputs() {
          let rtn = {};
          frame.outputPins.forEach(pin => {
            rtn[pin.hostId] = {id: pin.id, title: pin.title}
          })
          return rtn;
        }
      }
    })

    inst['_pipe_'] = (exe, pinId, params) => {
      let outputRtn = exe.apply(inst, params)
      if (model.outputPins) {
        model.outputPins.forEach((pin: I_Pin) => {
          if (pin.hostId == pinId) {
            executor.pin(pin, outputRtn)
          }
        })
      }
    }

    instResolve && (executor = instResolve(inst))

    fn({
      env: 'runtime',
      data: clone(dataModel),
      frames: frames,
      get curFrame() {
        let th = model, cur = function (): FrameModel {
          let frame
          if (th.frames) {
            let curId = th.runtime.activeFrameId
            if (curId) {
              frame = th.frames.find(fra => fra.hostId == curId)
            } else {
              frame = th.frames[0]
            }
          }
          return frame
        }
        return {
          get title() {
            let frame = cur()
            return frame.title
          },
          get id() {
            return th.runtime.activeFrameId
          },
          get input() {
            let frame = cur()
            return {
              get(hostId?: string) {
                let pin;
                if (hostId) {
                  pin = frame.inputPins.find(pin => pin.hostId == hostId);
                  return {id: pin.id, name: pin.name}
                } else {
                  return frame.inputPins.map(pin => ({id: pin.hostId, name: pin.name}))
                }
              },
              add(templateId, {id, name}) {
                frame.addInputPin(id, name, templateId)
              },
              update(hostId, name) {
                frame.upateInputPin(hostId, name)
              },
              remove(hostId) {
                frame.removeInputPin(hostId)
              }
            }
          },
          get output() {
            let frame = cur()
            return {
              get(hostId?: string) {
                let pin;
                if (hostId) {
                  pin = frame.outputPins.find(pin => pin.hostId == hostId);
                  return {id: pin.id, name: pin.name}
                } else {
                  return frame.outputPins.map(pin => ({id: pin.hostId, name: pin.name}))
                }
              },
              add(templateId, {id, name}) {
                frame.addOutputPin(id, name, templateId)
              },
              update(hostId, name) {
                frame.upateOutputPin(hostId, name)
              },
              remove(hostId) {
                frame.removeOutputPin(hostId)
              }
            }
          }
        }
      },
      get inputs() {
        let rtn = {};
        model.inputPins.forEach((pin, index) => {
          rtn[pin.hostId] = {id: pin.hostId, name: pin.name, templateId: pin.templateId, index}
        })
        return rtn
      },
      get outputs() {
        let rtn = {};
        model.outputPins.forEach((pin, index) => {
          rtn[pin.hostId] = {id: pin.hostId, name: pin.name, templateId: pin.templateId, index}
        })
        return rtn
      }
    })
  }
}
