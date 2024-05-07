import deepcopy from 'deepcopy';
import {
  ElDialog,
  ElButton,
  ElTable,
  ElTableColumn,
  ElInput,
} from 'element-plus';
import { defineComponent, createVNode, render, reactive } from 'vue';

const TableComponent = defineComponent({
  props: {
    option: {
      type: Object,
    },
  },
  setup(props, ctx) {
    const state = reactive({
      option: props.option,
      isShow: false,
      editData: [],
    });
    const methods = {
      show(option) {
        state.option = option;
        state.isShow = true;
        state.editData = deepcopy(option.data);
      },
    };
    const add = () => {
      state.editData.push({});
    };
    const onCancel = () => {
      state.isShow = false;
    };
    const onConfirm = () => {
      state.option.onConfirm(state.editData);
      onCancel();
    };
    ctx.expose(methods);

    return () => {
      return (
        <ElDialog v-model={state.isShow} title={state.option.config.label}>
          {{
            default: () => (
              <div>
                <div>
                  <ElButton onClick={add}>Add</ElButton>
                  <ElButton>Reset</ElButton>
                </div>
                <ElTable data={state.editData}>
                  <ElTableColumn type="index" />
                  {state.option.config.table.options.map((item) => (
                    <ElTableColumn label={item.label}>
                      {{
                        default: ({ row }) => (
                          <ElInput v-model={row[item.field]}></ElInput>
                        ),
                      }}
                    </ElTableColumn>
                  ))}
                  <ElTableColumn label="Operator">
                    <ElButton type="danger">Delete</ElButton>
                  </ElTableColumn>
                </ElTable>
              </div>
            ),
            footer: () => (
              <>
                <ElButton onClick={onCancel}>Cancel</ElButton>
                <ElButton type="primary" onClick={onConfirm}>
                  Confirm
                </ElButton>
              </>
            ),
          }}
        </ElDialog>
      );
    };
  },
});

let vm;
export const $tableDialog = (option) => {
  if (!vm) {
    const el = document.createElement('div');
    vm = createVNode(TableComponent, { option });
    document.body.appendChild((render(vm, el), el));
  }
  let { show } = vm.component.exposed;
  show(option);
};
