import React from 'react';
import { Package, Wrench, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const StudioMap = () => {
  const { equipment, updateEquipment } = useAppContext();

  const totalItems = equipment.reduce((sum, eq) => sum + eq.total, 0);
  const totalAvailable = equipment.reduce((sum, eq) => sum + eq.available, 0);
  const totalInReparation = equipment.reduce((sum, eq) => sum + eq.inReparation, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="w-8 h-8" />
            Studio Equipment Map
          </h1>
          <p className="text-gray-600 mt-1">Track equipment availability and maintenance status</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="text-sm text-gray-500">Total Equipment</div>
            <div className="text-3xl font-bold text-gray-800">{totalItems}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-xl shadow-md border border-green-200">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="w-4 h-4" />
              Available Now
            </div>
            <div className="text-3xl font-bold text-green-800">{totalAvailable}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-xl shadow-md border border-yellow-200">
            <div className="flex items-center gap-2 text-sm text-yellow-700">
              <AlertTriangle className="w-4 h-4" />
              In Use
            </div>
            <div className="text-3xl font-bold text-yellow-800">{totalItems - totalAvailable - totalInReparation}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-xl shadow-md border border-red-200">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <Wrench className="w-4 h-4" />
              In Reparation
            </div>
            <div className="text-3xl font-bold text-red-800">{totalInReparation}</div>
          </div>
        </div>

        {/* Equipment List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Equipment Inventory</h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {equipment.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1 text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        Available: {item.available}
                      </span>
                      <span className="flex items-center gap-1 text-yellow-700">
                        <Package className="w-4 h-4" />
                        Total: {item.total}
                      </span>
                      {item.inReparation > 0 && (
                        <span className="flex items-center gap-1 text-red-700">
                          <Wrench className="w-4 h-4" />
                          In Repair: {item.inReparation}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Status Bar */}
                  <div className="w-48">
                    <div className="flex h-3 rounded-full overflow-hidden bg-gray-200">
                      <div 
                        className="bg-green-500" 
                        style={{ width: `${(item.available / item.total) * 100}%` }}
                        title={`Available: ${item.available}`}
                      />
                      <div 
                        className="bg-yellow-500" 
                        style={{ width: `${((item.total - item.available - item.inReparation) / item.total) * 100}%` }}
                        title={`In Use: ${item.total - item.available - item.inReparation}`}
                      />
                      <div 
                        className="bg-red-500" 
                        style={{ width: `${(item.inReparation / item.total) * 100}%` }}
                        title={`In Repair: ${item.inReparation}`}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Available</span>
                      <span>In Use</span>
                      <span>Repair</span>
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="mt-3 flex gap-2">
                  {item.inReparation > 0 && (
                    <button
                      onClick={() => updateEquipment(item.id, { 
                        inReparation: item.inReparation - 1,
                        available: item.available + 1 
                      })}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      Mark as Fixed (+1 Available)
                    </button>
                  )}
                  {item.available > 0 && (
                    <button
                      onClick={() => updateEquipment(item.id, { 
                        available: item.available - 1,
                        inReparation: item.inReparation + 1 
                      })}
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Send to Repair (-1 Available)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white p-4 rounded-xl shadow-md">
          <h3 className="font-semibold text-gray-800 mb-2">Legend</h3>
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Available for use</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Currently in use by clients</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Under maintenance/repair</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioMap;
