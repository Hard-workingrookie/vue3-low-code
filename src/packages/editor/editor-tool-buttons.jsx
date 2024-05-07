import { defineComponent } from 'vue';
import { $dialog } from '../../components/Dialog';

export default defineComponent({
  props: {
    commands: {
      type: Object,
    },
    data: {
      type: Object,
    },
    previewRef: {
      type: Object,
    },
    clearBlockFocus: {
      type: Function,
    },
    editorRef: {
      type: Object,
    },
  },
  setup(props) {
    const { previewRef, editorRef, commands, clearBlockFocus } = props;
    const buttons = [
      {
        label: 'undo',
        icon: 'icon-back',
        handler: () => commands.undo(),
      },
      {
        label: 'redo',
        icon: 'icon-forward',
        handler: () => commands.redo(),
      },
      {
        label: 'export',
        icon: 'icon-export',
        handler: () => {
          $dialog({
            title: 'Export Json To Use',
            content: JSON.stringify(props.data),
          });
        },
      },
      {
        label: 'import',
        icon: 'icon-import',
        handler: () => {
          $dialog({
            title: 'Import Json To Use',
            content: '',
            footer: true,
            onConfirm(text) {
              //   data.value = JSON.parse(text); //这样子更改无法保留历史记录
              commands.updateContainer(JSON.parse(text));
            },
          });
        },
      },
      {
        label: 'top',
        icon: 'icon-top',
        handler: () => commands.placeTop(),
      },
      {
        label: 'bottom',
        icon: 'icon-bottom',
        handler: () => commands.placeBottom(),
      },
      {
        label: 'delete',
        icon: 'icon-delete',
        handler: () => commands.delete(),
      },
      {
        label: () => (previewRef.value ? 'edit' : 'preview'),
        icon: () => (previewRef.value ? 'icon-edit' : 'icon-browse'),
        handler: () => {
          previewRef.value = !previewRef.value;
          clearBlockFocus();
        },
      },
      {
        label: 'close',
        icon: 'icon-close',
        handler: () => {
          editorRef.value = false;
          clearBlockFocus();
        },
      },
    ];
    return () => {
      return buttons.map((button, index) => {
        const icon =
          typeof button.icon === 'function' ? button.icon() : button.icon;
        const label =
          typeof button.label === 'function' ? button.label() : button.label;
        return (
          <div class="editor-top-button" onClick={button.handler}>
            <i class={icon}></i>
            <span>{label}</span>
          </div>
        );
      });
    };
  },
});
