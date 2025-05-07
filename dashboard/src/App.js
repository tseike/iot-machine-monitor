# dashboard/src ディレクトリを作成
mkdir -p dashboard/src

# dashboard/src/App.jsファイルを作成
cat > dashboard/src/App.js << 'EOF'
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle, Play, Pause, Settings } from 'lucide-react';

const statusColors = {
  '稼働中': '#4caf50',
  '完成': '#ffeb3b',
  'エラー': '#f44336',
  'エラー (点滅)': '#ff9800',
  '停止中': '#9e9e9e',
  '中段取り中': '#2196f3',
  '稼働中 (点滅)': '#8bc34a',
  '完成 (点滅)': '#ffc107'
};

// ステータスアイコンの選択
const getStatusIcon = (status) => {
  switch(status) {
    case '稼働中':
    case '稼働中 (点滅)':
      return <Play className="w-5 h-5 text-green-500" />;
    case '完成':
    case '完成 (点滅)':
      return <CheckCircle className="w-5 h-5 text-yellow-500" />;
    case 'エラー':
    case 'エラー (点滅)':
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    case '停止中':
      return <Pause className="w-5 h-5 text-gray-500" />;
    case '中段取り中':
      return <Settings className="w-5 h-5 text-blue-500" />;
    default:
      return <Pause className="w-5 h-5 text-gray-500" />;
  }
};

// ステータスインジケーター
const StatusIndicator = ({ status }) => {
  const color = statusColors[status] || '#9e9e9e';
  
  return (
    <div className="flex items-center mb-2">
      <div 
        className="w-4 h-4 rounded-full mr-2"
        style={{ backgroundColor: color }}
      />
      <span className="text-sm">{status}</span>
    </div>
  );
};

// 機械ステータスカード
const MachineCard = ({ machine }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full">
      <div className="mb-3 border-b pb-2">
        <h3 className="text-lg font-medium">{machine.machine_name}</h3>
      </div>
      <div className="space-y-2">
        <StatusIndicator status={machine.state_name} />
        <p className="text-sm">
          大段取り: {machine.major_setup_count}
        </p>
        <p className="text-sm">
          中段取り: {machine.is_minor_setup ? 'ON' : 'OFF'}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          最終更新: {new Date(machine.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// 状態別稼働時間グラフ
const StateTimeChart = ({ machineData }) => {
  const chartData = [];
  
  // 状態ごとのデータを準備
  for (const stateName in machineData.states) {
    chartData.push({
      state: stateName,
      duration: Math.round(machineData.states[stateName] / 60), // 分単位に変換
      color: statusColors[stateName] || '#9e9e9e'
    });
  }
  
  return (
    <div className="mt-4 h-64">
      <h4 className="text-base font-medium mb-2">
        状態別稼働時間 (分)
      </h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="state" />
          <YAxis />
          <Tooltip formatter={(value) => `${value} 分`} />
          <Legend />
          <Bar dataKey="duration" name="稼働時間" fill="#8884d8">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 段取り別時間グラフ
const SetupTimeChart = ({ machineData }) => {
  const chartData = [];
  const stateNames = Object.keys(machineData.states);
  
  // 段取りごとのデータを準備
  for (const setupCount in machineData.setupTimes) {
    const dataPoint = {
      name: `段取り ${setupCount}`,
    };
    
    let total = 0;
    for (const stateName of stateNames) {
      const duration = machineData.setupTimes[setupCount][stateName] || 0;
      dataPoint[stateName] = Math.round(duration / 60); // 分単位に変換
      total += duration;
    }
    
    dataPoint.total = Math.round(total / 60);
    chartData.push(dataPoint);
  }
  
  return (
    <div className="mt-8 h-64">
      <h4 className="text-base font-medium mb-2">
        段取り別状態時間 (分)
      </h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {stateNames.map(stateName => (
            <Bar 
              key={stateName}
              dataKey={stateName} 
              stackId="a" 
              name={stateName}
              fill={statusColors[stateName] || '#9e9e9e'} 
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// メインアプリケーション
const App = () => {
  const [tabValue, setTabValue] = useState(0);
  const [statusData, setStatusData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // APIからのデータ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 現在の状態を取得
        const statusRes = await fetch('/api/status');
        const statusJson = await statusRes.json();
        
        // 履歴データを取得
        const historyRes = await fetch('/api/history');
        const historyJson = await historyRes.json();
        
        setStatusData(statusJson);
        setHistoryData(historyJson);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('データの取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };
    
    // 初回ロード時にデータ取得
    fetchData();
    
    // 5秒ごとにデータを更新
    const interval = setInterval(fetchData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // タブ切り替え処理
  const handleTabChange = (index) => {
    setTabValue(index);
  };

  // ローディング表示
  if (loading && !statusData && !historyData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        <h3 className="font-bold">エラー</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">IoT工作機械モニタリングシステム</h1>
      
      {/* タブナビゲーション */}
      <div className="border-b mb-6">
        <div className="flex">
          <button
            className={`py-2 px-4 font-medium ${tabValue === 0 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => handleTabChange(0)}
          >
            稼働状況
          </button>
          <button
            className={`py-2 px-4 font-medium ${tabValue === 1 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => handleTabChange(1)}
          >
            記録
          </button>
        </div>
      </div>
      
      {/* タブコンテンツ */}
      <div className="mt-4">
        {/* 稼働状況タブ */}
        {tabValue === 0 && statusData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statusData.machines.map((machine, index) => (
              <MachineCard key={index} machine={machine} />
            ))}
          </div>
        )}
        
        {/* 記録タブ */}
        {tabValue === 1 && historyData && (
          <div>
            {historyData.machines.map((machine, index) => (
              <div key={index} className="mb-8 bg-white rounded-lg shadow-md p-4">
                <h3 className="text-xl font-medium mb-4">{machine.name}</h3>
                <StateTimeChart machineData={machine} />
                <SetupTimeChart machineData={machine} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
EOF