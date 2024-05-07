import { computed, defineComponent, inject, ref } from 'vue';
import deepcopy from 'deepcopy';
import { ElButton } from 'element-plus';

import { useMenuDragger } from '../hooks/useMenuDragger';
import { useFocus } from '../hooks/useFocus';
import { useBlockDragger } from '../hooks/useBlockDrag';
import { useCommand } from '../hooks/useCommand';

import { $dropdown } from '../../components/Dropdown';

import ContextMenu from './context-menu';
import EditorBlock from './editor-block';
import EditorToolButtons from './editor-tool-buttons';
import EditorOperator from './editor-operator';

import './editor.scss';

export default defineComponent({
  props: {
    modelValue: {
      type: Object,
    },
    formData: {
      type: Object,
    },
  },
  emits: ['update:modelValue'],
  setup(props, ctx) {
    //预览的时候，内容不能在操作了，可以点击，输入内容，方便看效果
    const previewRef = ref(false);
    const editorRef = ref(true);

    const data = computed({
      get() {
        return props.modelValue;
      },
      set(newValue) {
        ctx.emit('update:modelValue', deepcopy(newValue));
      },
    });
    const containerStyles = computed(() => ({
      width: data.value.container.width + 'px',
      height: data.value.container.height + 'px',
    }));
    const config = inject('config');
    const containerRef = ref(null);

    // 菜单拖拽
    const { dragStart, dragEnd } = useMenuDragger(containerRef, data);
    // 获取焦点,后拖拽
    const {
      blockMousedown,
      focusData,
      containerMousedown,
      lastSelectBlock,
      clearBlockFocus,
    } = useFocus(data, previewRef, (e) => {
      mousedown(e);
    });
    const { mousedown, markline } = useBlockDragger(
      focusData,
      lastSelectBlock,
      data
    );
    const { commands } = useCommand(data, focusData);

    const onContextMenuBlock = (e, block) => {
      e.preventDefault();
      $dropdown({
        el: e.target,
        content: () => <ContextMenu commands={commands} block={block} />,
      });
    };

    //实现拖拽多个元素的功能
    return () =>
      !editorRef.value ? (
        <>
          <div
            class="editor-container-canvas__content"
            style={{ ...containerStyles.value, margin: 0 }}
          >
            {data.value.blocks.map((block) => (
              <EditorBlock
                block={block}
                class="editor-block-preview"
                formData={props.formData}
              ></EditorBlock>
            ))}
          </div>
          <div>
            <ElButton type="primary" onClick={() => (editorRef.value = true)}>
              Continue Editing
            </ElButton>
            {JSON.stringify(props.formData)}
          </div>
        </>
      ) : (
        <div class="editor">
          <div class="editor-left">
            {config.componentList.map((component) => (
              <div
                class="editor-left-item"
                draggable
                onDragstart={(e) => dragStart(e, component)}
                onDragEnd={dragEnd}
              >
                <span>{component.label}</span>
                <div>{component.preview()}</div>
              </div>
            ))}
          </div>
          <div class="editor-top">
            <EditorToolButtons
              data={data.value}
              commands={commands}
              clearBlockFocus={clearBlockFocus}
              editorRef={editorRef}
              previewRef={previewRef}
            />
          </div>
          <div class="editor-right">
            <EditorOperator
              block={lastSelectBlock.value}
              data={data.value}
              updateContainer={commands.updateContainer}
              updateBlock={commands.updateBlock}
            ></EditorOperator>
          </div>
          <div class="editor-container">
            <div class="editor-container-canvas">
              <div
                class="editor-container-canvas__content"
                style={containerStyles.value}
                ref={containerRef}
                onMousedown={containerMousedown}
              >
                {data.value.blocks.map((block, index) => {
                  let blockClass = block.focus ? 'editor-block-focus' : '';
                  blockClass += previewRef.value ? 'editor-block-preview' : '';

                  return (
                    <EditorBlock
                      onMousedown={(e) => {
                        blockMousedown(e, block, index);
                      }}
                      block={block}
                      class={blockClass}
                      //右击菜单
                      onContextmenu={(e) => {
                        onContextMenuBlock(e, block);
                      }}
                      formData={props.formData}
                    ></EditorBlock>
                  );
                })}
                {markline.x !== null && (
                  <div class="line-x" style={{ left: markline.x + 'px' }}></div>
                )}
                {markline.y !== null && (
                  <div class="line-y" style={{ top: markline.y + 'px' }}></div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
  },
});
