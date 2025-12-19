import { useState, useEffect, useCallback } from 'react'
import WebhookTable from './components/WebhookTable'
import WebhookDetail from './components/WebhookDetail'

function App() {
  const [webhooks, setWebhooks] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedWebhook, setSelectedWebhook] = useState(null)
  const [pathFilter, setPathFilter] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(false)

  const fetchWebhooks = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ page, limit: 50 })
      if (pathFilter) params.append('path', pathFilter)

      const response = await fetch(`/api/webhooks?${params}`)
      const data = await response.json()

      setWebhooks(data.webhooks)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to fetch webhooks:', error)
    } finally {
      setLoading(false)
    }
  }, [pathFilter])

  useEffect(() => {
    fetchWebhooks(pagination.page)
  }, [fetchWebhooks])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchWebhooks(pagination.page)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoRefresh, fetchWebhooks, pagination.page])

  const handleDelete = async (id) => {
    if (!confirm('Delete this webhook?')) return

    try {
      await fetch(`/api/webhooks/${id}`, { method: 'DELETE' })
      fetchWebhooks(pagination.page)
      setSelectedWebhook(null)
    } catch (error) {
      console.error('Failed to delete webhook:', error)
    }
  }

  const handlePageChange = (newPage) => {
    fetchWebhooks(newPage)
  }

  const handleFilterSubmit = (e) => {
    e.preventDefault()
    fetchWebhooks(1)
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Webhook Monitor</h1>
          <p className="text-gray-600">
            Send webhooks to: <code className="bg-gray-200 px-2 py-1 rounded">{window.location.origin}/webhook/your-path</code>
          </p>
        </header>

        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <form onSubmit={handleFilterSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Filter by path..."
                value={pathFilter}
                onChange={(e) => setPathFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Filter
              </button>
              {pathFilter && (
                <button
                  type="button"
                  onClick={() => { setPathFilter(''); fetchWebhooks(1); }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Clear
                </button>
              )}
            </form>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-600">Auto-refresh (5s)</span>
              </label>
              <button
                onClick={() => fetchWebhooks(pagination.page)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <WebhookTable
            webhooks={webhooks}
            loading={loading}
            onSelect={setSelectedWebhook}
            onDelete={handleDelete}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </div>

        {selectedWebhook && (
          <WebhookDetail
            webhook={selectedWebhook}
            onClose={() => setSelectedWebhook(null)}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  )
}

export default App
