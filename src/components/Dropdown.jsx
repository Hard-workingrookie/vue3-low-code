import {
  provide,
  inject,
  computed,
  createVNode,
  defineComponent,
  onBeforeUnmount,
  reactive,
  ref,
  render,
  onMounted,
} from 'vue';

const DropdownItem = defineComponent({
  props: {
    label: String,
    icon: String,
  },
  setup(props, ctx) {
    let { label, icon } = props;
    let hide = inject('hide');
    return () => (
      <div class="dropdown-item" onClick={hide}>
        <i class={icon} />
        <span>{label}</span>
      </div>
    );
  },
});
const DropdownComponent = defineComponent({
  props: {
    option: { type: Object },
  },
  setup(props, ctx) {
    const state = reactive({
      option: props.option,
      isShow: false,
      top: 0,
      left: 0,
    });
    ctx.expose({
      showDropdown(option) {
        state.isShow = true;
        state.option = option;
        let { top, left, height, width } = option.el.getBoundingClientRect();

        state.top = top + height;
        state.left = left + width / 2;
      },
    });
    const classes = computed(() => [
      'dropdown',
      {
        'dropdown-isShow': state.isShow,
      },
    ]);
    const styles = computed(() => ({
      top: state.top + 'px',
      left: state.left + 'px',
    }));

    const el = ref(null);
    const onMousedownDocument = (e) => {
      //如果点击的是dropdown内部，什么都不做
      if (!el.value.contains(e.target)) {
        state.isShow = false;
      }
    };
    provide('hide', () => {
      state.isShow = false;
    });
    onMounted(() => {
      document.addEventListener('mousedown', onMousedownDocument, true);
    });
    onBeforeUnmount(() => {
      document.body.removeEventListener('mousedown', onMousedownDocument);
    });
    return () => {
      return (
        <div style={styles.value} class={classes.value} ref={el}>
          {state.option.content()}
        </div>
      );
    };
  },
});
let vNode;
export function $dropdown(option) {
  if (!vNode) {
    let el = document.createElement('div');
    vNode = createVNode(DropdownComponent, { option });
    document.body.appendChild((render(vNode, el), el));
  }
  const { showDropdown } = vNode.component.exposed;
  showDropdown(option);
}

export { DropdownItem };
