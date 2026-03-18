import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { calculateRiskScore } from '../services/riskService';
import { generateInsights } from '../services/insightService';
import { Activity, ArrowRight, BrainCircuit, Target, Trophy, AlertTriangle, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

export default function DashboardScreen() {
  const navigate = useNavigate();
  const { activeProfileId, profiles, logs, setActiveProfile } = useStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const profile = profiles.find(p => p.id === activeProfileId);
  const profileLogs = logs.filter(l => l.profileId === activeProfileId);
  
  const riskResult = useMemo(() => calculateRiskScore(profileLogs), [profileLogs]);
  const insights = useMemo(() => generateInsights(profileLogs), [profileLogs]);

  const stats = useMemo(() => {
    let total = 0;
    let wins = 0;
    let losses = 0;
    let draws = 0;
    
    profileLogs.forEach(log => {
      if (log.postGameData) {
        total++;
        if (log.postGameData.outcome === 'Win') wins++;
        else if (log.postGameData.outcome === 'Loss') losses++;
        else if (log.postGameData.outcome === 'Draw') draws++;
      }
    });

    return {
      total,
      wins,
      losses,
      draws,
      winRate: (wins + losses) > 0 ? Math.round((wins / (wins + losses)) * 100) : 0,
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

  const latestTilt = useMemo(() => {
    const logsWithTilt = profileLogs.filter(l => l.postGameData?.derivedTilt !== undefined);
    if (logsWithTilt.length === 0) return null;
    return logsWithTilt[logsWithTilt.length - 1].postGameData!.derivedTilt!;
  }, [profileLogs]);

  const tiltPercentage = latestTilt !== null ? Math.round(latestTilt) : null;
  const tiltLabel = tiltPercentage !== null 
    ? (tiltPercentage < 35 ? 'Low' : tiltPercentage < 65 ? 'Moderate' : 'High')
    : 'No Data';

  if (!profile) return null;

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-6 pb-24 overflow-y-auto">
      <header className="flex items-center justify-between mb-8 relative z-50">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 text-sm font-medium text-zinc-200 hover:text-white bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full transition-colors"
          >
            <span>{profile.name}</span>
            <ChevronDown size={16} className={clsx("transition-transform", isDropdownOpen && "rotate-180")} />
          </button>
          
          {isDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                <div className="py-1 max-h-60 overflow-y-auto">
                  {profiles.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActiveProfile(p.id);
                        setIsDropdownOpen(false);
                      }}
                      className={clsx(
                        "w-full text-left px-4 py-3 text-sm transition-colors",
                        p.id === activeProfileId ? "bg-indigo-500/10 text-indigo-400 font-medium" : "text-zinc-300 hover:bg-zinc-800"
                      )}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                <div className="border-t border-zinc-800 py-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate('/profiles');
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                  >
                    Manage Profiles
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
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

      {/* 1. Tilt Card (NEW - HIGHEST PRIORITY) */}
      <section className="mb-6">
        <div className={clsx(
          "rounded-3xl p-6 border relative overflow-hidden flex flex-col items-center justify-center text-center",
          tiltPercentage === null ? 'bg-zinc-900 border-zinc-800' :
          tiltPercentage < 35 ? 'bg-emerald-950/40 border-emerald-900/50' :
          tiltPercentage < 65 ? 'bg-amber-950/40 border-amber-900/50' :
          'bg-rose-950/40 border-rose-900/50'
        )}>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Current Tilt Level</p>
          <div className="flex items-baseline space-x-1 mb-1">
            <h2 className={clsx(
              "text-6xl font-black tracking-tighter",
              tiltPercentage === null ? 'text-zinc-500' :
              tiltPercentage < 35 ? 'text-emerald-400' :
              tiltPercentage < 65 ? 'text-amber-400' :
              'text-rose-400'
            )}>
              {tiltPercentage !== null ? tiltPercentage : '--'}
            </h2>
            <span className={clsx(
              "text-2xl font-bold",
              tiltPercentage === null ? 'text-zinc-600' :
              tiltPercentage < 35 ? 'text-emerald-500/50' :
              tiltPercentage < 65 ? 'text-amber-500/50' :
              'text-rose-500/50'
            )}>%</span>
          </div>
          <div className={clsx(
            "text-sm font-medium px-3 py-1 rounded-full mt-2",
            tiltPercentage === null ? 'bg-zinc-800 text-zinc-400' :
            tiltPercentage < 35 ? 'bg-emerald-500/20 text-emerald-300' :
            tiltPercentage < 65 ? 'bg-amber-500/20 text-amber-300' :
            'bg-rose-500/20 text-rose-300'
          )}>
            {tiltLabel}
          </div>
        </div>
      </section>

      {/* 2. Queue Risk (existing) */}
      <section className={clsx("mb-6", stateRefreshStatus === 'reset_required' && 'opacity-50 pointer-events-none')}>
        <div className={clsx(
          "rounded-2xl p-5 border relative overflow-hidden flex items-center justify-between",
          riskResult.score === 'Low' ? 'bg-emerald-950/20 border-emerald-900/30' :
          riskResult.score === 'Medium' ? 'bg-amber-950/20 border-amber-900/30' :
          'bg-rose-950/20 border-rose-900/30'
        )}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Queue Risk</p>
            <div className="flex items-center space-x-2">
              <h3 className={clsx(
                "text-xl font-bold",
                riskResult.score === 'Low' ? 'text-emerald-400' :
                riskResult.score === 'Medium' ? 'text-amber-400' :
                'text-rose-400'
              )}>
                {riskResult.score}
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-[200px]">{riskResult.explanation}</p>
          </div>
          <AlertTriangle className={clsx(
            "w-10 h-10 opacity-20",
            riskResult.score === 'Low' ? 'text-emerald-400' :
            riskResult.score === 'Medium' ? 'text-amber-400' :
            'text-rose-400'
          )} />
        </div>
      </section>

      {/* 3. Performance Block */}
      <section className="mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center space-x-2 text-zinc-400 mb-4">
            <Trophy size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">Performance</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-zinc-100">{stats.winRate}%</div>
              <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-semibold">Win Rate</div>
            </div>
            <div className="flex space-x-4 text-center">
              <div>
                <div className="text-xl font-bold text-emerald-400">{stats.wins}</div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold">W</div>
              </div>
              <div>
                <div className="text-xl font-bold text-rose-400">{stats.losses}</div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold">L</div>
              </div>
              <div>
                <div className="text-xl font-bold text-zinc-400">{stats.draws}</div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold">D</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Insights Preview */}
      <section className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <BrainCircuit size={16} className="text-indigo-400" />
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Recent Insights</h3>
        </div>
        
        {insights.length > 0 ? (
          <div className="space-y-3">
            {insights.slice(0, 2).map((insight, idx) => (
              <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <h4 className="text-sm font-medium text-zinc-200 mb-1">{insight.title}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{insight.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-xl p-4 text-center">
            <p className="text-xs text-zinc-500">Play more matches to generate insights.</p>
          </div>
        )}
      </section>

      {/* 5. Logging Controls */}
      <section className={clsx("mt-auto", stateRefreshStatus === 'reset_required' && 'opacity-50 pointer-events-none')}>
        {pendingLog ? (
          <button 
            onClick={() => navigate(`/log/post/${pendingLog.id}`)}
            className="w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-colors bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
          >
            <span>Log Post-Game State</span>
            <ArrowRight size={20} />
          </button>
        ) : (
          <button 
            onClick={() => navigate('/log/pre')}
            className={clsx(
              "w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-colors shadow-lg",
              riskResult.score === 'Low' ? 'bg-emerald-500 hover:bg-emerald-600 text-zinc-950 shadow-emerald-500/20' :
              riskResult.score === 'Medium' ? 'bg-amber-500 hover:bg-amber-600 text-zinc-950 shadow-amber-500/20' :
              'bg-rose-500 hover:bg-rose-600 text-zinc-950 shadow-rose-500/20'
            )}
          >
            <span>Log Pre-Game State</span>
            <ArrowRight size={20} />
          </button>
        )}
      </section>
    </div>
  );
}
