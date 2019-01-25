import { useState } from 'react'
import difference from 'lodash/difference'
import xor from 'lodash/xor'

export default function useList(list, defaultSelected = []) {
  const [selected, setSelected] = useState(defaultSelected)

  const diff = difference(selected, list)
  if (diff.length) {
    setSelected(xor(selected, diff))
  }

  const allSelected = xor(list, selected).length === 0

  function toggleOne(item) {
    setSelected(xor(selected, [item]))
  }

  function toggleAll() {
    setSelected(allSelected ? [] : list)
  }

  function isSelected(item) {
    return selected.includes(item)
  }

  return {
    selected,
    allSelected,
    isSelected,
    toggleOne,
    toggleAll,
    setSelected,
  }
}
