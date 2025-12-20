function WebhookTable({ webhooks, loading, onSelect, onDelete, pagination, onPageChange }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const truncateBody = (body) => {
    if (!body) return '-'
    const str = typeof body === 'string' ? body : JSON.stringify(body)
    return str.length > 60 ? str.substring(0, 60) + '...' : str
  }

  const getMethodColor = (method) => {
    const colors = {
      GET: 'bg-green-100 text-green-800',
      POST: 'bg-blue-100 text-blue-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      PATCH: 'bg-orange-100 text-orange-800',
      DELETE: 'bg-red-100 text-red-800'
    }
    return colors[method] || 'bg-gray-100 text-gray-800'
  }

  if (loading && webhooks.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading webhooks...
      </div>
    )
  }

  if (webhooks.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No webhooks received yet. Send a request to <code className="bg-gray-100 px-2 py-1 rounded">/webhook/your-path</code>
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Path</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Body Preview</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {webhooks.map((webhook) => (
              <tr
                key={webhook.id}
                className="hover:bg-brand-50 cursor-pointer"
                onClick={() => onSelect(webhook)}
              >
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                  {formatDate(webhook.created_at)}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getMethodColor(webhook.method)}`}>
                    {webhook.method}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-blue-900 text-white rounded text-xs font-medium">
                    {webhook.webhook_type || 'unknown'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-mono text-gray-900">
                  /{webhook.path}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                  {truncateBody(webhook.body)}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(webhook.id); }}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="px-4 py-3 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {webhooks.length} of {pagination.total} webhooks
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 rounded border border-brand-800 text-brand-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 hover:bg-brand-50 disabled:hover:bg-transparent"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 rounded border border-brand-800 text-brand-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 hover:bg-brand-50 disabled:hover:bg-transparent"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default WebhookTable
