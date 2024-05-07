import deepcopy from 'deepcopy';
import { onUnmounted } from 'vue';
import { events } from '../events';

export function useCommand(data, focusData) {
  const state = {
    current: -1, //前进后退需要指针
    queue: [], //存放所有的操作命令
    commands: {},
    commandArray: [],
    destoryArray: [],
  };

  const registry = (command) => {
    state.commandArray.push(command);
    state.commands[command.name] = (...args) => {
      const { redo, undo } = command.execute(...args);
      redo();
      if (!command.pushQueue) {
        //不需要放到队列中直接跳过即可
        return;
      }
      let { queue, current } = state;
      if (queue.length > 0) {
        queue = queue.slice(0, current + 1); //可能在放置的过程中，有撤销操作，根据当前最新的current值来计算新的队列
        state.queue = queue;
      }
      queue.push({ redo, undo });
      state.current = current + 1;
    };
  };

  registry({
    //重做
    name: 'redo',
    keyboard: 'ctrl+y',
    execute() {
      return {
        redo() {
          let item = state.queue[state.current + 1]; //找到当前的下一步还原操作
          if (item) {
            item.redo && item.redo();
            state.current++;
          }
        },
      };
    },
  });
  registry({
    name: 'undo',
    keyboard: 'ctrl+z',
    execute() {
      return {
        redo() {
          if (state.current == -1) return; //没有可撤销的
          let item = state.queue[state.current]; //找到上一个还原
          if (item) {
            item.undo && item.undo();
            state.current--;
          }
        },
      };
    },
  });
  //drag
  registry({
    name: 'drag',
    pushQueue: true,
    init() {
      this.before = null;
      //监控拖拽开始事件，保存状态
      const start = () => {
        this.before = deepcopy(data.value.blocks);
      };
      //拖拽之后，需要触发对应的指令
      const end = () => {
        state.commands.drag();
      };

      events.on('start', start);
      events.on('end', end);

      return () => {
        //销毁
        events.off('start', start);
        events.off('end', end);
      };
    },
    execute() {
      let before = this.before;
      let after = data.value.blocks;

      return {
        redo() {
          //重做
          data.value = { ...data.value, blocks: after };
        },
        undo() {
          //撤销
          data.value = { ...data.value, blocks: before };
        },
      };
    },
  });
  //updateContainer
  registry({
    name: 'updateContainer', //更新整个容器
    pushQueue: true,
    execute(newValue) {
      let state = {
        before: data.value,
        after: newValue,
      };
      return {
        redo() {
          //重做
          data.value = state.after;
        },
        undo() {
          //撤销
          data.value = state.before;
        },
      };
    },
  });
  registry({
    name: 'updateBlock',
    pushQueue: true,
    execute(newBlock, oldBlock) {
      let state = {
        before: data.value.blocks,
        after: (() => {
          let blocks = [...data.value.blocks];
          const index = data.value.blocks.indexOf(oldBlock); //找老的，需要通过老的查找
          if (index > -1) {
            blocks.splice(index, 1, newBlock);
          }
          return blocks;
        })(),
      };
      return {
        redo() {
          //重做
          data.value = {
            ...data.value,
            blocks: state.after,
          };
        },
        undo() {
          //撤销
          data.value = {
            ...data.value,
            blocks: state.before,
          };
        },
      };
    },
  });
  //placeTop
  registry({
    name: 'placeTop',
    pushQueue: true,
    execute() {
      let state = {
        before: deepcopy(data.value.blocks),
        after: (() => {
          let { focus, unfocused } = focusData.value;
          let maxZIndex = unfocused.reduce((prev, block) => {
            return Math.max(prev, block.zIndex);
          }, -Infinity);
          focus.forEach((focusBlock) => {
            focusBlock.zIndex = maxZIndex + 1;
          });
          return data.value.blocks;
        })(),
      };
      return {
        redo() {
          //重做
          data.value = { ...data.value, blocks: state.after };
        },
        undo() {
          //撤销
          data.value = { ...data.value, blocks: state.before };
        },
      };
    },
  });
  //placeBottom
  registry({
    name: 'placeBottom',
    pushQueue: true,
    execute() {
      let state = {
        before: deepcopy(data.value.blocks),
        after: (() => {
          let { focus, unfocused } = focusData.value;
          let minZIndex =
            unfocused.reduce((prev, block) => {
              return Math.min(prev, block.zIndex);
            }, Infinity) - 1;
          if (minZIndex < 0) {
            const dur = Math.abs(minZIndex);
            minZIndex = 0;
            unfocused.forEach((block) => {
              block.zIndex += dur;
            });
          }
          focus.forEach((focusBlock) => {
            focusBlock.zIndex = minZIndex;
          });
          return data.value.blocks;
        })(),
      };
      return {
        redo() {
          //重做
          data.value = { ...data.value, blocks: state.after };
        },
        undo() {
          //撤销
          data.value = { ...data.value, blocks: state.before };
        },
      };
    },
  });
  // delete
  registry({
    name: 'delete',
    pushQueue: true,
    execute() {
      let state = {
        before: deepcopy(data.value.blocks), //当前的值
        after: focusData.value.unfocused, //选中的都删除，留下的没选中的
      };

      return {
        redo() {
          //重做
          data.value = { ...data.value, blocks: state.after };
        },
        undo() {
          //撤销
          data.value = { ...data.value, blocks: state.before };
        },
      };
    },
  });
  const keyboardEvent = (() => {
    const keyCodes = {
      90: 'z',
      89: 'y',
    };
    const onKeydown = (e) => {
      const { ctrlKey, keyCode } = e;
      let keyString = [];
      if (ctrlKey) keyString.push('ctrl');
      keyString.push(keyCodes[keyCode]);
      keyString = keyString.join('+');
      state.commandArray.forEach(({ keyboard, name }) => {
        if (!keyboard) return;
        if (keyboard === keyString) {
          state.commands[name]();
          e.preventDefault();
        }
      });
    };
    const init = () => {
      window.addEventListener('keydown', onKeydown);
      return () => {
        window.removeEventListener('keydown', onKeydown);
      };
    };
    return init;
  })();
  (() => {
    state.destoryArray.push(keyboardEvent());
    state.commandArray.forEach(
      (command) => command.init && state.destoryArray.push(command.init())
    );
  })();
  onUnmounted(() => {
    //清理
    state.destoryArray.forEach((fn) => fn && fn());
  });
  return state;
}
