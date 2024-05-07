import { defineComponent } from 'vue';
import { DropdownItem } from '../../components/Dropdown';
import { $dialog } from '../../components/Dialog';

export default defineComponent({
  props: {
    commands: {
      type: Object,
    },
    block: {
      type: Object,
    },
  },
  setup(props) {
    const { commands } = props;

    return () => {
      return (
        <>
          <DropdownItem
            label="Delete"
            icon="icon-delete"
            onClick={() => {
              commands.delete();
            }}
          ></DropdownItem>
          <DropdownItem
            label="Place Top"
            icon="icon-top"
            onClick={() => {
              commands.placeTop();
            }}
          ></DropdownItem>
          <DropdownItem
            label="Place Bottom"
            icon="icon-bottom"
            onClick={() => {
              commands.placeBottom();
            }}
          ></DropdownItem>
          <DropdownItem
            label="Preview"
            icon="icon-browse"
            onClick={() => {
              $dialog({
                title: 'View Node Data',
                content: JSON.stringify(props.block),
              });
            }}
          ></DropdownItem>
          <DropdownItem
            label="Import"
            icon="icon-import"
            onClick={() => {
              $dialog({
                title: 'Import Node Data',
                content: '',
                footer: true,
                onConfirm(text) {
                  text = JSON.parse(text);
                  commands.updateBlock(text, props.block);
                },
              });
            }}
          ></DropdownItem>
        </>
      );
    };
  },
});
