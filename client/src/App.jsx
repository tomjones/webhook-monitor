import { useState, useEffect, useCallback, useMemo } from 'react'
import WebhookTable from './components/WebhookTable'
import WebhookDetail from './components/WebhookDetail'

function App() {
  const [webhooks, setWebhooks] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedWebhook, setSelectedWebhook] = useState(null)
  const [pathFilter, setPathFilter] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(false)

  // Client-side filters
  const [methodFilter, setMethodFilter] = useState('')
  const [pathDropdownFilter, setPathDropdownFilter] = useState('')

  // Clear server-side filter when client-side filters are applied
  const handleMethodFilterChange = (value) => {
    setMethodFilter(value)
    if (value && pathFilter) {
      setPathFilter('')
    }
  }

  const handlePathDropdownFilterChange = (value) => {
    setPathDropdownFilter(value)
    if (value && pathFilter) {
      setPathFilter('')
    }
  }

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
    // Clear client-side filters when performing server-side search
    setMethodFilter('')
    setPathDropdownFilter('')
    fetchWebhooks(1)
  }

  // Get unique methods and paths from current webhooks
  const uniqueMethods = useMemo(() => {
    const methods = new Set(webhooks.map(w => w.method))
    return Array.from(methods).sort()
  }, [webhooks])

  const uniquePaths = useMemo(() => {
    const paths = new Set(webhooks.map(w => w.path))
    return Array.from(paths).sort()
  }, [webhooks])

  // Client-side filtering
  const filteredWebhooks = useMemo(() => {
    return webhooks.filter(webhook => {
      const matchesMethod = !methodFilter || webhook.method === methodFilter
      const matchesPath = !pathDropdownFilter || webhook.path === pathDropdownFilter
      return matchesMethod && matchesPath
    })
  }, [webhooks, methodFilter, pathDropdownFilter])

  // Clear all filters
  const handleClearFilters = () => {
    setMethodFilter('')
    setPathDropdownFilter('')
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-brand-800 mb-2">Webhook Monitor</h1>
          <p className="text-gray-600">
            Send webhooks to: <code className="bg-gray-200 px-2 py-1 rounded">{window.location.origin}/webhook/your-path</code>
          </p>
        </header>

        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex flex-wrap gap-4 items-start justify-between">
            <div className="flex-1 min-w-[300px]">
              <form onSubmit={handleFilterSubmit} className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Search by path..."
                  value={pathFilter}
                  onChange={(e) => setPathFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-800 flex-1"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-800 text-white rounded-lg hover:bg-brand-900"
                >
                  Search
                </button>
                {pathFilter && (
                  <button
                    type="button"
                    onClick={() => {
                      setPathFilter('')
                      fetchWebhooks(1)
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Clear
                  </button>
                )}
              </form>

              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Method:</label>
                  <select
                    value={methodFilter}
                    onChange={(e) => handleMethodFilterChange(e.target.value)}
                    className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-800 text-sm bg-white"
                  >
                    <option value="">All</option>
                    {uniqueMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Path:</label>
                  <select
                    value={pathDropdownFilter}
                    onChange={(e) => handlePathDropdownFilterChange(e.target.value)}
                    className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-800 text-sm bg-white"
                  >
                    <option value="">All</option>
                    {uniquePaths.map(path => (
                      <option key={path} value={path}>{path}</option>
                    ))}
                  </select>
                </div>

                {(methodFilter || pathDropdownFilter) && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                  >
                    Clear Filters
                  </button>
                )}

                <div className="text-sm text-gray-600 ml-auto">
                  {(methodFilter || pathDropdownFilter) ? (
                    <span>
                      Showing {filteredWebhooks.length} of {webhooks.length} requests
                      <span className="text-gray-500 italic"> (current page only)</span>
                    </span>
                  ) : (
                    <span>Showing {webhooks.length} requests</span>
                  )}
                </div>
              </div>
            </div>

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
            webhooks={filteredWebhooks}
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
