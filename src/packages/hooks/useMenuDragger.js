import { events } from '../events';
export function useMenuDragger(containerRef, data) {
  let currentComponent = null;

  const dragenter = (e) => {
    e.dataTransfer.dropEffect = 'move';
  };
  const dragover = (e) => {
    e.preventDefault();
  };
  const dragleave = (e) => {
    e.dataTransfer.dropEffect = 'none';
  };
  const drop = (e) => {
    let blocks = data.value.blocks;
    data.value = {
      ...data.value,
      blocks: [
        ...blocks,
        {
          top: e.offsetY,
          left: e.offsetX,
          zIndex: 1,
          key: currentComponent.key,
          alignCenter: true,
          props: {},
          model: {},
        },
      ],
    };
    currentComponent = null;
  };
  const dragStart = (e, component) => {
    // dragenter 进入元素中，添加一个移动的标识
    // dragover 在目标元素经过，必须要阻止默认行为 否则不能触发drop
    // dragleave 离开元素的时候，需要增加一个禁用标识
    // drop   松手的时候，根据拖拽的组件，添加一个组件
    containerRef.value.addEventListener('dragenter', dragenter);
    containerRef.value.addEventListener('dragover', dragover);
    containerRef.value.addEventListener('dragleave', dragleave);
    containerRef.value.addEventListener('drop', drop);
    currentComponent = component;
    events.emit('start');
  };
  const dragEnd = (e) => {
    containerRef.value.removeEventListener('dragenter', dragenter);
    containerRef.value.removeEventListener('dragover', dragover);
    containerRef.value.removeEventListener('dragleave', dragleave);
    containerRef.value.removeEventListener('drop', drop);
    events.emit('end');
  };
  return {
    dragStart,
    dragEnd,
  };
}
