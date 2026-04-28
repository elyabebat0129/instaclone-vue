import { computed, reactive } from 'vue'

export function usePagination() {
  const pagination = reactive({
    currentPage: 1,
    lastPage: 1,
  })

  const canGoBack = computed(() => pagination.currentPage > 1)
  const canGoNext = computed(() => pagination.currentPage < pagination.lastPage)

  function setPagination(data = {}, fallbackPage = 1) {
    pagination.currentPage = data.current_page || fallbackPage
    pagination.lastPage = data.last_page || 1
  }

  return {
    pagination,
    canGoBack,
    canGoNext,
    setPagination,
  }
}
