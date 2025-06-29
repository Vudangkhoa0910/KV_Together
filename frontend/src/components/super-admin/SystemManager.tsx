'use client';

import { useState, useEffect } from 'react';
import { superAdminAPI } from '@/services/superAdminApi';
import { 
  Settings,
  RefreshCw,
  Terminal,
  Database,
  Shield,
  Server,
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
  Download,
  Upload,
  Eye,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default function SystemManager() {
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'database' | 'logs' | 'settings'>('overview');

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    setLoading(true);
    try {
      const [systemRes, logsRes] = await Promise.all([
        superAdminAPI.getSystemInfo(),
        superAdminAPI.getSystemLogs(50)
      ]);

      if (systemRes.data) {
        setSystemInfo(systemRes.data);
      }
      
      if (logsRes.data) {
        setLogs(logsRes.data.logs || []);
      }
    } catch (error) {
      console.error('Failed to load system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      const response = await superAdminAPI.clearCache();
      if (response.data) {
        alert('Cache đã được xóa thành công');
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert('Không thể xóa cache');
    }
  };

  const handleBackup = () => {
    alert('Tính năng sao lưu đang được phát triển');
  };

  const handleRestore = () => {
    alert('Tính năng khôi phục đang được phát triển');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Đang tải thông tin hệ thống...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveSection('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeSection === 'overview'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tổng quan hệ thống
          </button>
          <button
            onClick={() => setActiveSection('database')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeSection === 'database'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Cơ sở dữ liệu
          </button>
          <button
            onClick={() => setActiveSection('logs')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeSection === 'logs'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Nhật ký hệ thống
          </button>
          <button
            onClick={() => setActiveSection('settings')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeSection === 'settings'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Cài đặt
          </button>
        </div>
      </div>

      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* System Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Trạng thái hệ thống</p>
                  <p className="text-lg font-bold text-green-600">Hoạt động tốt</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Uptime</p>
                  <p className="text-lg font-bold text-gray-900">99.9%</p>
                </div>
                <Server className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng bảng dữ liệu</p>
                  <p className="text-lg font-bold text-gray-900">
                    {systemInfo?.database_info?.total_tables || 0}
                  </p>
                </div>
                <Database className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bảo mật</p>
                  <p className="text-lg font-bold text-green-600">An toàn</p>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin hệ thống</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Cpu className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">PHP Version</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">8.2.0</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Database className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Laravel Version</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">10.x</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <HardDrive className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Database</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">MySQL 8.0</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <MemoryStick className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Cache Driver</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Redis</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Công cụ quản trị</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={clearCache}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
                >
                  <RefreshCw className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">Xóa Cache</div>
                </button>
                
                <button
                  onClick={handleBackup}
                  className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-center"
                >
                  <Download className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">Sao lưu DB</div>
                </button>
                
                <button
                  onClick={handleRestore}
                  className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-center"
                >
                  <Upload className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">Khôi phục DB</div>
                </button>
                
                <button
                  onClick={() => setActiveSection('logs')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-center"
                >
                  <Terminal className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">Xem Logs</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'database' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cơ sở dữ liệu</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemInfo?.database_info?.tables?.map((table: any) => (
                <div key={table.name} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{table.name}</h4>
                      <p className="text-sm text-gray-500">
                        {table.records_count} bản ghi • {table.columns.length} cột
                      </p>
                    </div>
                    <Database className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              )) || (
                <div className="col-span-3 text-center text-gray-500 py-8">
                  Không có thông tin bảng dữ liệu
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'logs' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Nhật ký hệ thống</h3>
              <button
                onClick={loadSystemData}
                className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="font-mono text-sm text-green-400 space-y-1">
                {logs.length > 0 ? (
                  logs.map((log, index) => (
                    <div key={index} className="whitespace-pre-wrap">
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400">Không có log nào để hiển thị</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cài đặt hệ thống</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên ứng dụng
                </label>
                <input
                  type="text"
                  value="KV Together"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL ứng dụng
                </label>
                <input
                  type="url"
                  value="http://localhost:3000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Múi giờ
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Chế độ bảo trì</h4>
                  <p className="text-sm text-gray-500">Kích hoạt để tạm dừng truy cập của người dùng</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="pt-4">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Lưu cài đặt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
