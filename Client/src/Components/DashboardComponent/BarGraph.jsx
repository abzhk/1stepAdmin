
import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', user: 400, parent: 240, provider:730 },
  { name: 'Feb', user: 300, parent : 139 },
  { name: 'March', user: 200, parent: 980 },
];

const BarGraph = () => {
  return (
    <div>

        <div className="bg-white rounded-4xl p-4">
                     <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12 }} 
              />
              
              <Tooltip 
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              
              <Legend verticalAlign="top" align="right" iconType="circle" height={44}/>
              
              <Bar dataKey="parent" fill="#f2a794" radius={[4, 4, 0, 0]} barSize={10} />
              <Bar dataKey="user" fill="#2d4a36" radius={[4, 4, 0, 0]} barSize={10} />
               <Bar dataKey="provider" fill="#ed4a56" radius={[4, 4, 0, 0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
                  </div>
                  </div>
        

  )
}

export default BarGraph;