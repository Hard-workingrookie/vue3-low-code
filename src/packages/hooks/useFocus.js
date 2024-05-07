import { computed, ref } from 'vue';
export function useFocus(data, previewRef, callback) {
  const selectIndex = ref(-1);
  const lastSelectBlock = computed(() => data.value.blocks[selectIndex.value]);
  const clearBlockFocus = () => {
    data.value.blocks.forEach((block) => (block.focus = false));
  };
  const containerMousedown = () => {
    if (previewRef.value) return;
    clearBlockFocus();
    selectIndex.value = -1;
  };

  const blockMousedown = (e, block, index) => {
    if (previewRef.value) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.shiftKey) {
      if (focusData.value.focus.length > 1) {
        block.focus = !block.focus;
      } else {
        block.focus = true;
      }
    } else {
      if (!block.focus) {
        clearBlockFocus();
        block.focus = true;
      }
    }
    selectIndex.value = index;
    callback(e);
  };
  const focusData = computed(() => {
    let focus = [],
      unfocused = [];
    data.value.blocks.forEach((block) =>
      (block.focus ? focus : unfocused).push(block)
    );
    return {
      focus,
      unfocused,
    };
  });

  return {
    blockMousedown,
    containerMousedown,
    focusData,
    lastSelectBlock,
    clearBlockFocus,
  };
}
