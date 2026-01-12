interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  color?: 'green' | 'red' | 'yellow' | 'default';
}

export default function StatsCard({ title, value, icon, color = 'default' }: StatsCardProps) {
  const colorConfig = {
    green: {
      text: 'text-emerald-400',
      bg: 'from-emerald-500/10 to-emerald-500/5',
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/15',
    },
    red: {
      text: 'text-red-400',
      bg: 'from-red-500/10 to-red-500/5',
      border: 'border-red-500/20',
      iconBg: 'bg-red-500/15',
    },
    yellow: {
      text: 'text-yellow-400',
      bg: 'from-yellow-500/10 to-yellow-500/5',
      border: 'border-yellow-500/20',
      iconBg: 'bg-yellow-500/15',
    },
    default: {
      text: 'text-white',
      bg: 'from-gray-800/50 to-gray-900/50',
      border: 'border-gray-700/50',
      iconBg: 'bg-gray-700/50',
    },
  };

  const config = colorConfig[color];

  return (
    <div className={`bg-gradient-to-br ${config.bg} backdrop-blur-lg rounded-2xl p-6 border ${config.border} shadow-xl shadow-black/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-sm font-medium">{title}</span>
        <div className={`p-2.5 rounded-xl ${config.iconBg}`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
      <p className={`text-3xl font-bold ${config.text} tracking-tight`}>{value}</p>
    </div>
  );
}
