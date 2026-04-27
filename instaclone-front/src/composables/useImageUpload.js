import { computed, onBeforeUnmount, ref } from 'vue'

export function useImageUpload({ validTypes, maxSizeInMb }) {
  const file = ref(null)
  const previewUrl = ref('')

  function revokePreview() {
    if (previewUrl.value?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl.value)
    }

    previewUrl.value = ''
  }

  function clear() {
    revokePreview()
    file.value = null
  }

  function setFile(nextFile) {
    revokePreview()
    file.value = nextFile

    if (nextFile) {
      previewUrl.value = URL.createObjectURL(nextFile)
    }
  }

  function validate(nextFile) {
    if (!nextFile) {
      return { valid: true, errors: [] }
    }

    if (!validTypes.includes(nextFile.type)) {
      return { valid: false, errors: ['Tipo de arquivo invalido.'] }
    }

    if (nextFile.size > maxSizeInMb * 1024 * 1024) {
      return { valid: false, errors: [`O arquivo deve ter no maximo ${maxSizeInMb} MB.`] }
    }

    return { valid: true, errors: [] }
  }

  function handleFileChange(event) {
    const nextFile = event.target.files?.[0] || null
    const validation = validate(nextFile)

    if (!validation.valid) {
      clear()
      event.target.value = ''
      return validation
    }

    setFile(nextFile)
    return validation
  }

  const hasFile = computed(() => Boolean(file.value))

  onBeforeUnmount(() => {
    revokePreview()
  })

  return {
    file,
    hasFile,
    previewUrl,
    clear,
    setFile,
    validate,
    handleFileChange,
  }
}
