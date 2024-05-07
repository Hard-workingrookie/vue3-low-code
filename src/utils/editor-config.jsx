// 列表区可以显示所有的物料
// key对应的组件映射关系
import { ElButton, ElInput, ElLink, ElOption, ElSelect } from 'element-plus';
import Range from '../components/Range';

function createEditorConfig() {
  const componentList = [];
  const conponentMap = {};

  return {
    componentList,
    conponentMap,
    register: (component) => {
      componentList.push(component);
      conponentMap[component.key] = component;
    },
  };
}

export let registerConfig = createEditorConfig();

const createInputProp = (label) => ({
  type: 'input',
  label,
});
const createColorProp = (label) => ({
  type: 'color',
  label,
});
const createSelectProp = (label, options) => ({
  type: 'select',
  label,
  options,
});
const createTableProp = (label, table) => ({
  type: 'table',
  label,
  table,
});
registerConfig.register({
  key: 'text',
  label: 'text',
  preview: () => 'preview text',
  render: ({ props, model }) => (
    <span style={{ color: props.color, fontSize: props.size }}>
      {props.text || 'render text'}
    </span>
  ),
  props: {
    text: createInputProp('Text'),
    color: createColorProp('Color'),
    size: createSelectProp('Size', [
      { label: '14px', value: '14px' },
      { label: '16px', value: '16px' },
      { label: '18px', value: '18px' },
      { label: '20px', value: '20px' },
      { label: '22px', value: '22px' },
      { label: '24px', value: '24px' },
    ]),
  },
});

registerConfig.register({
  key: 'button',
  label: 'button',
  resize: {
    width: true,
    height: true,
  },
  preview: () => <ElButton>preview button</ElButton>,
  render: ({ props, size }) => (
    <ElButton
      type={props.type}
      size={props.size}
      style={{ width: size.width + 'px', height: size.height + 'px' }}
    >
      {props.text || 'render button'}
    </ElButton>
  ),
  props: {
    text: createInputProp('Button Text'),
    type: createSelectProp('Button Type', [
      { label: 'Default', value: 'default' },
      { label: 'Primary', value: 'primary' },
      { label: 'Success', value: 'success' },
      { label: 'Info', value: 'info' },
      { label: 'Warning', value: 'warning' },
      { label: 'Danger', value: 'danger' },
    ]),
    size: createSelectProp('Size', [
      { label: 'Large', value: 'large' },
      { label: 'Default', value: 'default' },
      { label: 'Small', value: 'small' },
    ]),
  },
});
registerConfig.register({
  key: 'input',
  label: 'input',
  resize: {
    width: true,
  },
  preview: () => <ElInput placeholder="preview input" />,
  render: ({ model, props, size }) => (
    <ElInput
      type={props.type}
      size={props.size}
      placeholder="render input"
      style={{ width: size.width + 'px' }}
      {...model.default}
    />
  ),
  model: {
    default: 'Bound Field',
  },
  props: {
    type: createSelectProp('Type', [
      { label: 'Text', value: 'text' },
      { label: 'Textarea', value: 'textarea' },
      { label: 'Password', value: 'password' },
      { label: 'Button', value: 'button' },
      { label: 'Checkbox', value: 'checkbox' },
      { label: 'File', value: 'file' },
      { label: 'Number', value: 'number' },
      { label: 'Radio', value: 'radio' },
    ]),
    size: createSelectProp('Size', [
      { label: 'Large', value: 'large' },
      { label: 'Default', value: 'default' },
      { label: 'Small', value: 'small' },
    ]),
  },
});

registerConfig.register({
  key: 'range',
  label: 'range input',
  preview: () => <Range />,
  render: ({ model, props }) => (
    <Range
      {...{
        start: model.start.modelValue,
        'onUpdate:start': model.start['onUpdate:modelValue'],
        end: model.end.modelValue,
        'onUpdate:end': model.end['onUpdate:modelValue'],
      }}
    />
  ),
  model: {
    start: 'start field',
    end: 'end field',
  },
  props: {},
});

registerConfig.register({
  key: 'select',
  label: 'select',
  preview: () => <ElSelect modelValue="" />,
  render: ({ props, model }) => {
    return (
      <ElSelect size={props.size} {...model.default}>
        {(props.options || []).map((option) => (
          <ElOption {...option} key={option.value}></ElOption>
        ))}
      </ElSelect>
    );
  },
  model: {
    default: 'Bound Field',
  },
  props: {
    options: createTableProp('Select Options', {
      options: [
        { label: 'Label', field: 'label' },
        { label: 'Value', field: 'value' },
      ],
      key: 'label',
    }),
    size: createSelectProp('Size', [
      { label: 'Medium', value: 'medium' },
      { label: 'Small', value: 'small' },
      { label: 'Mini', value: 'mini' },
    ]),
  },
});

registerConfig.register({
  key: 'link',
  label: 'link',
  preview: () => <ElLink type="primary">link</ElLink>,
  render: ({ props, model }) => {
    console.log(model.default);
    return (
      <ElLink type={props.type || 'primary'} href={model.default.modelValue}>
        link
      </ElLink>
    );
  },
  model: {
    default: 'Bound Field',
  },
  props: {
    type: createSelectProp('Type', [
      { label: 'Primary', value: 'primary' },
      { label: 'Success', value: 'success' },
      { label: 'Warning', value: 'warning' },
      { label: 'Danger', value: 'danger' },
      { label: 'Info', value: 'info' },
      { label: 'Default', value: 'default' },
    ]),
  },
});
