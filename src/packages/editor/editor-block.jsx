import { computed, defineComponent, inject, ref, onMounted } from 'vue';
import BlockResize from './block-resize';

export default defineComponent({
  props: {
    block: {
      type: Object,
    },
    formData: {
      type: Object,
    },
  },
  setup(props) {
    const blockStyles = computed(() => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
      zIndex: props.block.zIndex,
    }));
    const config = inject('config');
    const blockRef = ref(null);
    onMounted(() => {
      let { offsetWidth, offsetHeight } = blockRef.value;
      //拖拽的居中显示
      if (props.block.alignCenter) {
        props.block.left = props.block.left - offsetWidth / 2;
        props.block.top = props.block.top - offsetHeight / 2;
        props.block.alignCenter = false;
      }
      props.block.width = offsetWidth;
      props.block.height = offsetHeight;
    });
    return () => {
      const component = config.conponentMap[props.block.key];
      const RenderComponent = component.render({
        props: props.block.props,
        // props.block.model->{default:'username'} modelName->default
        model: Object.keys(component.model || {}).reduce((prev, modelName) => {
          let propName = props.block.model[modelName]; //'username'
          console.log('props.formData,propName', props.formData, propName);
          prev[modelName] = {
            modelValue: props.formData[propName],
            'onUpdate:modelValue': (v) => (props.formData[propName] = v),
          };
          return prev;
        }, {}),
        size: props.block.hasResize
          ? { width: props.block.width, height: props.block.height }
          : {},
      });
      const { width, height } = component.resize || {};
      return (
        <div class="editor-block" ref={blockRef} style={blockStyles.value}>
          {RenderComponent}
          {props.block.focus && (width || height) && (
            <BlockResize block={props.block} component={component} />
          )}
        </div>
      );
    };
  },
});
