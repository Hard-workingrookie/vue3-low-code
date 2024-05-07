import deepcopy from 'deepcopy';
import {
  ElButton,
  ElColorPicker,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElOption,
  ElSelect,
} from 'element-plus';
import { defineComponent, inject, reactive, watch } from 'vue';
import TableEditor from './table-editor';

export default defineComponent({
  props: {
    block: {
      type: Object,
    },
    data: {
      type: Object,
    },
    updateContainer: {
      type: Function,
    },
    updateBlock: {
      type: Function,
    },
  },
  setup(props) {
    const state = reactive({
      editData: {},
    });
    const config = inject('config');
    const reset = () => {
      if (!props.block) {
        state.editData = deepcopy(props.data.container);
      } else {
        state.editData = deepcopy(props.block);
      }
    };
    const apply = () => {
      if (!props.block) {
        //更改容器的大小
        props.updateContainer({ ...props.data, container: state.editData });
      } else {
        //更改组件的大小
        props.updateBlock(state.editData, props.block);
      }
    };
    watch(() => props.block, reset, {
      immediate: true,
    });
    return () => {
      let content = [];
      if (!props.block) {
        content.push(
          <>
            <ElFormItem label="Container Width">
              <ElInputNumber v-model={state.editData.width}></ElInputNumber>
            </ElFormItem>
            <ElFormItem label="Container Height">
              <ElInputNumber v-model={state.editData.height}></ElInputNumber>
            </ElFormItem>
          </>
        );
      } else {
        const component = config.conponentMap[props.block.key];
        if (component?.props) {
          content.push(
            Object.entries(component.props).map(([propName, propConfig]) => {
              return (
                <ElFormItem key={propName} label={propConfig.label}>
                  {{
                    input: () => (
                      <ElInput v-model={state.editData.props[propName]} />
                    ),
                    color: () => (
                      <ElColorPicker v-model={state.editData.props[propName]} />
                    ),
                    select: () => (
                      <ElSelect v-model={state.editData.props[propName]}>
                        {propConfig.options.map((opt) => {
                          return (
                            <ElOption
                              label={opt.label}
                              value={opt.value}
                              key={opt.value}
                            ></ElOption>
                          );
                        })}
                      </ElSelect>
                    ),
                    table: () => (
                      <TableEditor
                        propConfig={propConfig}
                        v-model={state.editData.props[propName]}
                      />
                    ),
                  }[propConfig.type]()}
                </ElFormItem>
              );
            })
          );
        }
        if (component && component.model) {
          content.push(
            Object.entries(component.model).map(([modelName, label]) => {
              return (
                <ElFormItem key={modelName} label={label}>
                  <ElInput v-model={state.editData.model[modelName]} />
                </ElFormItem>
              );
            })
          );
        }
      }
      return (
        <ElForm labelPosition="top" style={{ padding: '30px' }}>
          {content}
          <ElFormItem>
            <ElButton type="primary" onClick={() => apply()}>
              Apply
            </ElButton>
            <ElButton onClick={reset}>Reset</ElButton>
          </ElFormItem>
        </ElForm>
      );
    };
  },
});
