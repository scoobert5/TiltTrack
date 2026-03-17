import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { calculateRiskScore } from '../services/riskService';
import { generateInsights } from '../services/insightService';
import { Activity, ArrowRight, BrainCircuit, Target, Trophy } from 'lucide-react';
import clsx from 'clsx';

export default function DashboardScreen() {
  const navigate = useNavigate();
  const { activeProfileId, profiles, logs } = useStore();
  
  const profile = profiles.find(p => p.id === activeProfileId);
  const profileLogs = logs.filter(l => l.profileId === activeProfileId);
  
  const riskResult = useMemo(() => calculateRiskScore(profileLogs), [profileLogs]);
  const insights = useMemo(() => generateInsights(profileLogs), [profileLogs]);

  const stats = useMemo(() => {
    const total = profileLogs.filter(l => l.postGameData).length;
    let wins = 0;
    let losses = 0;
    let draws = 0;
    let totalTilt = 0;
    
    profileLogs.forEach(log => {
      if (log.postGameData) {
        if (log.postGameData.outcome === 'Win') wins++;
        else if (log.postGameData.outcome === 'Loss') losses++;
        else if (log.postGameData.outcome === 'Draw') draws++;
      }
      if (log.derivedTilt) {
        totalTilt += log.derivedTilt;
      }
    });

    return {
      total,
      wins,
      losses,
      draws,
      winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
      avgTilt: total > 0 ? (totalTilt / total).toFixed(1) : 0,
    };
  }, [profileLogs]);

  const pendingLog = useMemo(() => {
    return profileLogs.find(l => !l.postGameData);
  }, [profileLogs]);

  const stateRefreshStatus = useMemo(() => {
    if (profileLogs.length === 0) return 'none';
    const lastLog = profileLogs[profileLogs.length - 1];
    const hoursSinceLastLog = (Date.now() - lastLog.timestamp) / (1000 * 60 * 60);
    
    if (hoursSinceLastLog > 72) return 'reset_required';
    if (hoursSinceLastLog > 24) return 'warning';
    return 'ok';
  }, [profileLogs]);

  if (!profile) return null;

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-6 pb-24 overflow-y-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">{profile.name}</h1>
          <p className="text-sm text-zinc-500">Dashboard</p>
        </div>
        <button 
          onClick={() => navigate('/profiles')}
          className="text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-full"
        >
          Switch Game
        </button>
      </header>

      {stateRefreshStatus === 'warning' && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 flex items-start space-x-3">
          <Activity className="text-amber-400 shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="text-sm font-semibold text-amber-400">It's been a while</h4>
            <p className="text-xs text-amber-400/80 mt-1">Your mental state might have shifted since your last session. Consider logging a new baseline.</p>
          </div>
        </div>
      )}

      {stateRefreshStatus === 'reset_required' && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mb-6 flex items-start space-x-3">
          <Activity className="text-rose-400 shrink-0 mt-0.5" size={18} />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-rose-400">State Reset Required</h4>
            <p className="text-xs text-rose-400/80 mt-1 mb-3">It's been over 72 hours since your last log. We need a new baseline before your next match.</p>
            <button 
              onClick={() => navigate('/log/pre')}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold py-2 rounded-lg transition-colors"
            >
              Log Baseline State
            </button>
          </div>
        </div>
      )}

      {/* Risk Score Card */}
      <section className={clsx("mb-8", stateRefreshStatus === 'reset_required' && 'opacity-50 pointer-events-none')}>
        <div className={clsx(
          "rounded-2xl p-6 border relative overflow-hidden",
          riskResult.score === 'Low' ? 'bg-emerald-950/30 border-emerald-900/50' :
          riskResult.score === 'Medium' ? 'bg-amber-950/30 border-amber-900/50' :
          'bg-rose-950/30 border-rose-900/50'
        )}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Queue Risk</p>
              <h2 className={clsx(
                "text-4xl font-black tracking-tight",
                riskResult.score === 'Low' ? 'text-emerald-400' :
                riskResult.score === 'Medium' ? 'text-amber-400' :
                'text-rose-400'
              )}>
                {riskResult.score}
              </h2>
            </div>
            <Activity className={clsx(
              "w-8 h-8 opacity-50",
              riskResult.score === 'Low' ? 'text-emerald-400' :
              riskResult.score === 'Medium' ? 'text-amber-400' :
              'text-rose-400'
            )} />
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">{riskResult.explanation}</p>
          
          {pendingLog ? (
            <button 
              onClick={() => navigate(`/log/post/${pendingLog.id}`)}
              className="mt-6 w-full py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-colors bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              <span>Log Post-Game State</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <button 
              onClick={() => navigate('/log/pre')}
              className={clsx(
                "mt-6 w-full py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-colors",
                riskResult.score === 'Low' ? 'bg-emerald-500 hover:bg-emerald-600 text-zinc-950' :
                riskResult.score === 'Medium' ? 'bg-amber-500 hover:bg-amber-600 text-zinc-950' :
                'bg-rose-500 hover:bg-rose-600 text-zinc-950'
              )}
            >
              <span>Log Pre-Game State</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center space-x-2 text-zinc-400 mb-2">
            <Trophy size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">Record</span>
          </div>
          <div className="text-2xl font-bold text-zinc-100">{stats.wins}-{stats.losses}-{stats.draws}</div>
          <div className="text-xs text-zinc-500 mt-1">{stats.winRate}% Win Rate</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center space-x-2 text-zinc-400 mb-2">
            <Target size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">Avg Tilt</span>
          </div>
          <div className="text-2xl font-bold text-zinc-100">{stats.avgTilt} <span className="text-sm font-normal text-zinc-500">/ 10</span></div>
          <div className="text-xs text-zinc-500 mt-1">Derived from matches</div>
        </div>
      </section>

      {/* Top Insight */}
      <section>
        <div className="flex items-center space-x-2 mb-4">
          <BrainCircuit size={18} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">Latest Insight</h3>
        </div>
        
        {insights.length > 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h4 className="font-medium text-zinc-100 mb-1">{insights[0].title}</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">{insights[0].description}</p>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-5 text-center">
            <p className="text-sm text-zinc-500">Play more matches to generate insights.</p>
          </div>
        )}
      </section>
    </div>
  );
}
