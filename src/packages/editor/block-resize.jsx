import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    block: { type: Object },
    component: { type: Object },
  },
  setup(props) {
    const { width, height } = props.component.resize || {};
    let data = {};

    const onmousemove = (e) => {
      let { clientX, clientY } = e;
      let {
        startX,
        startY,
        startWidth,
        startHeight,
        startLeft,
        startTop,
        direction,
      } = data;

      if (direction.horizontal === 'center') {
        clientX = startX;
      }
      if (direction.vertical === 'center') {
        clientY = startY;
      }

      let durX = clientX - startX;
      let durY = clientY - startY;

      if (direction.horizontal === 'start') {
        durX = -durX;
        props.block.left = startLeft - durX;
      }
      if (direction.vertical === 'start') {
        durY = -durY;
        props.block.top = startTop - durY;
      }

      let width = startWidth + durX;
      let height = startHeight + durY;

      props.block.width = width;
      props.block.height = height; //拖拽时候改变了宽高
      props.block.hasResize = true;
    };

    const onmouseup = () => {
      document.body.removeEventListener('mousemove', onmousemove);
      document.body.removeEventListener('mouseup', onmouseup);
    };

    const onMousedown = (e, direction) => {
      e.stopPropagation();
      data = {
        startX: e.clientX,
        startY: e.clientY,
        startWidth: props.block.width,
        startHeight: props.block.height,
        startLeft: props.block.left,
        startTop: props.block.top,
        direction,
      };
      document.body.addEventListener('mousemove', onmousemove);
      document.body.addEventListener('mouseup', onmouseup);
    };
    return () => {
      return (
        <div>
          {width && (
            <>
              <div
                onMousedown={(e) =>
                  onMousedown(e, {
                    horizontal: 'start',
                    vertical: 'center',
                  })
                }
                class="block-resize block-resize-left"
              ></div>
              <div
                onMousedown={(e) =>
                  onMousedown(e, {
                    horizontal: 'end',
                    vertical: 'center',
                  })
                }
                class="block-resize block-resize-right"
              ></div>
            </>
          )}
          {height && (
            <>
              <div
                onMousedown={(e) =>
                  onMousedown(e, {
                    horizontal: 'center',
                    vertical: 'start',
                  })
                }
                class="block-resize block-resize-top"
              ></div>
              <div
                onMousedown={(e) =>
                  onMousedown(e, {
                    horizontal: 'center',
                    vertical: 'end',
                  })
                }
                class="block-resize block-resize-bottom"
              ></div>
            </>
          )}
          {width && height && (
            <>
              <div
                onMousedown={(e) =>
                  onMousedown(e, {
                    horizontal: 'start',
                    vertical: 'start',
                  })
                }
                class="block-resize block-resize-top-left"
              ></div>
              <div
                onMousedown={(e) =>
                  onMousedown(e, {
                    horizontal: 'end',
                    vertical: 'start',
                  })
                }
                class="block-resize block-resize-top-right"
              ></div>
              <div
                onMousedown={(e) =>
                  onMousedown(e, {
                    horizontal: 'start',
                    vertical: 'end',
                  })
                }
                class="block-resize block-resize-bottom-left"
              ></div>
              <div
                onMousedown={(e) =>
                  onMousedown(e, {
                    horizontal: 'end',
                    vertical: 'end',
                  })
                }
                class="block-resize block-resize-bottom-right"
              ></div>
            </>
          )}
        </div>
      );
    };
  },
});
