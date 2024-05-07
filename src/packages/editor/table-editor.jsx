import deepcopy from 'deepcopy';
import { computed, defineComponent } from 'vue';
import { ElButton, ElTag } from 'element-plus';
import { $tableDialog } from '../../components/TableDialog';

export default defineComponent({
  props: {
    propConfig: { type: Object },
    modelValue: { type: Array },
  },
  emits: ['update:modelValue'],
  setup(props, ctx) {
    const data = computed({
      get() {
        return props.modelValue || [];
      },
      set(newValue) {
        ctx.emit('update:modelValue', deepcopy(newValue));
      },
    });
    const add = () => {
      $tableDialog({
        config: props.propConfig,
        data: data.value,
        onConfirm(newValue) {
          data.value = newValue;
        },
      });
    };
    return () => {
      return (
        <div>
          {(!data.value || data.value.length === 0) && (
            <ElButton onClick={add}>add</ElButton>
          )}

          {(data.value || []).map((item) => (
            <ElTag onClick={add}>{item[props.propConfig.table.key]}</ElTag>
          ))}
        </div>
      );
    };
  },
});
