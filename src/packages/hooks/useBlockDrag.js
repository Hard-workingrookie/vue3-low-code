import { reactive } from 'vue';
import { events } from '../events';

export function useBlockDragger(focusData, lastSelectBlock, data) {
  let dragState = {
    startX: 0,
    startY: 0,
    dragging: false,
  };
  let markline = reactive({
    x: null,
    y: null,
  });
  const mousedown = (e) => {
    const { width: BWidth, height: BHeight } = lastSelectBlock.value;

    dragState = {
      startX: e.clientX,
      startY: e.clientY, //容器到顶部的距离
      startLeft: lastSelectBlock.value.left,
      startTop: lastSelectBlock.value.top,
      dragging: false,
      startPos: focusData.value.focus.map(({ top, left }) => ({ top, left })),
      lines: (() => {
        const { unfocused } = focusData.value; //获取没选中的，以他们的位置做辅助线
        let lines = {
          x: [],
          y: [],
        }; //计算横线的位置，用y来存放，x存的纵向的
        [
          ...unfocused,
          {
            //也会参照整个容器
            top: 0,
            left: 0,
            width: data.value.container.width,
            height: data.value.container.height,
          },
        ].forEach((block) => {
          const {
            top: ATop,
            left: ALeft,
            width: AWidth,
            height: AHeight,
          } = block;

          lines.y.push({ showTop: ATop, top: ATop }); //顶对顶
          lines.y.push({ showTop: ATop, top: ATop - AHeight }); //顶对底
          lines.y.push({
            showTop: ATop + AHeight / 2 - BHeight / 2,
            top: ATop + AHeight / 2,
          });
          lines.y.push({
            //底对顶
            showTop: ATop + AHeight,
            top: ATop + AHeight,
          });
          lines.y.push({
            //底对底
            showTop: ATop + AHeight,
            top: ATop + AHeight - BHeight,
          });

          lines.x.push({ showLeft: ALeft, left: ALeft }); //左对左
          lines.x.push({ showLeft: ALeft, left: ALeft - AWidth });
          lines.x.push({
            showLeft: ALeft + AWidth / 2 - BWidth / 2,
            left: ALeft + AWidth / 2,
          });
          lines.x.push({
            showLeft: ALeft + AWidth,
            left: ALeft + AWidth,
          });
          lines.x.push({
            showLeft: ALeft + AWidth,
            left: ALeft + AWidth - BWidth,
          });
        });
        return lines;
      })(),
    };
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
  };

  const mousemove = (e) => {
    let { clientX: moveX, clientY: moveY } = e;
    const { startX, startY, startPos, startLeft, startTop, lines } = dragState;
    if (!dragState.dragging) {
      dragState.dragging = true;
      events.emit('start');
    }
    //鼠标移动后 - 鼠标移动前 + left
    let left = moveX - startX + startLeft;
    let top = moveY - startY + startTop;

    // 先计算横线，距离参照物元素还有5px的时候，显示这根线
    let y = null,
      x = null;
    for (let i = 0; i < lines.y.length; i++) {
      const { top: t, showTop: s } = lines.y[i];
      if (Math.abs(t - top) < 5) {
        y = s; //线要显示的位置
        //实现快速和元素贴到一起
        moveY = startY - startTop + t; //容器距离顶部的距离 + 目标的高度
        break; //找到一根线就跳出循环
      }
    }

    for (let i = 0; i < lines.x.length; i++) {
      const { left: l, showLeft: s } = lines.x[i];
      if (Math.abs(l - left) < 5) {
        x = s; //线要显示的位置
        moveX = startX - startLeft + l;
        break; //找到一根线就跳出循环
      }
    }
    markline.x = x; //markline是一个响应式数据，x,y更新了会视图更新
    markline.y = y;

    let durX = moveX - startX, // 之前和之后拖拽的位移
      durY = moveY - startY;
    focusData.value.focus.forEach((block, index) => {
      const { top, left } = startPos[index];
      block.top = top + durY;
      block.left = left + durX;
    });
  };
  const mouseup = (e) => {
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
    markline.x = null; //鼠标抬起后，参照线需要消失
    markline.y = null;
    if (dragState.dragging) {
      events.emit('end');
    }
  };

  return {
    mousedown,
    markline,
  };
}
