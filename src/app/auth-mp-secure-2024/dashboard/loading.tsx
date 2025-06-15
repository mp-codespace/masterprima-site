// src\app\auth-mp-secure-2024\dashboard\loading.tsx


export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Quick actions skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-3">
              <div className="w-2 h-2 bg-gray-200 rounded-full mt-2 animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-64 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}