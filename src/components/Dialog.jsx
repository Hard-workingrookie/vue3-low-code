import { ElButton, ElDialog, ElInput } from 'element-plus';
import { createVNode, defineComponent, reactive, render } from 'vue';

const DialogComponent = defineComponent({
  props: {
    option: { type: Object },
  },
  setup(props, ctx) {
    const state = reactive({
      option: props.option,
      isShow: false,
    });
    ctx.expose({
      showDialog(option) {
        state.isShow = true;
        state.option = option;
      },
    });
    const onCancel = () => {
      state.isShow = false;
    };
    const onConfirm = () => {
      state.option.onConfirm && state.option.onConfirm(state.option.content);
      onCancel();
    };
    return () => {
      return (
        <ElDialog v-model={state.isShow} title={state.option.title}>
          {{
            default: () => (
              <ElInput
                type="textarea"
                v-model={state.option.content}
                rows={10}
              />
            ),
            footer: () =>
              state.option.footer && (
                <div>
                  <ElButton onClick={onCancel}>Cancel</ElButton>
                  <ElButton type="primary" onClick={onConfirm}>
                    Confirm
                  </ElButton>
                </div>
              ),
          }}
        </ElDialog>
      );
    };
  },
});
let vNode;
export function $dialog(option) {
  if (!vNode) {
    let el = document.createElement('div');
    vNode = createVNode(DialogComponent, { option });
    document.body.appendChild((render(vNode, el), el));
  }
  const { showDialog } = vNode.component.exposed;
  showDialog(option);
}
