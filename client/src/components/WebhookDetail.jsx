function WebhookDetail({ webhook, onClose, onDelete }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const formatJson = (obj) => {
    if (!obj) return 'null'
    try {
      return JSON.stringify(obj, null, 2)
    } catch {
      return String(obj)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between bg-brand-50">
          <h2 className="text-xl font-semibold text-brand-800">Webhook Details</h2>
          <button
            onClick={onClose}
            className="text-brand-700 hover:text-brand-900 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">ID</label>
              <p className="text-gray-900">{webhook.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Time</label>
              <p className="text-gray-900">{formatDate(webhook.created_at)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Method</label>
              <p className="text-gray-900 font-mono">{webhook.method}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Path</label>
              <p className="text-gray-900 font-mono">/{webhook.path}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Source IP</label>
              <p className="text-gray-900 font-mono">{webhook.source_ip || 'Unknown'}</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-500 mb-2">Query Parameters</label>
            <pre className="json-view">{formatJson(webhook.query_params)}</pre>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-500 mb-2">Headers</label>
            <pre className="json-view">{formatJson(webhook.headers)}</pre>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-500 mb-2">Body</label>
            <pre className="json-view">{formatJson(webhook.body)}</pre>
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={() => onDelete(webhook.id)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default WebhookDetail
