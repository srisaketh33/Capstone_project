import React, { useEffect, useState } from 'react';
import {
    Users,
    Activity,
    History,
    ChevronRight,
    ShieldCheck,
    LogOut,
    PackagePlus,
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LogEntry {
    email: string;
    timestamp: string;
    type: 'login' | 'story';
    content?: string;
}

interface AdminDashboardProps {
    token: string | null;
    onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ token, onLogout }) => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'users' | 'activity' | 'products'>('activity');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchLogs();
            fetchUsers();
        }
    }, [token]);

    const fetchLogs = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const resp = await fetch('http://127.0.0.1:8000/admin/logs', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resp.ok) {
                const data = await resp.json();
                setLogs(data);
            }
        } catch (err) {
            console.error("Failed to fetch logs:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsers = async () => {
        if (!token) return;
        try {
            const resp = await fetch('http://127.0.0.1:8000/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resp.ok) {
                const data = await resp.json();
                setUsers(data);
            }
        } catch (err) {
            console.error("Failed to fetch users:", err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar Nav */}
            <aside className="w-64 bg-slate-900 text-slate-400 p-6 flex flex-col border-r border-slate-800">
                <div className="mb-12 flex items-center gap-3">
                    <div className="bg-indigo-500 p-2 rounded-lg text-white">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-lg leading-none">Admin Hub</h1>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Story Forge v1.0</span>
                    </div>
                </div>

                <nav className="space-y-2 flex-1">
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'activity' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                        <Activity className="w-5 h-5" /> Activity Stream
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                        <Users className="w-5 h-5" /> User Directory
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'products' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                        <PackagePlus className="w-5 h-5" /> Product Management
                    </button>
                </nav>

                <div className="pt-6 border-t border-slate-800">
                    <button
                        onClick={() => navigate('/forge')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-slate-800 hover:text-white mb-2"
                    >
                        <ArrowLeft className="w-5 h-5" /> Exit Admin
                    </button>
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                    >
                        <LogOut className="w-5 h-5" /> Logout Admin
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold font-display text-slate-900">
                            {activeTab === 'activity' ? 'System Activity Feed' : activeTab === 'users' ? 'Registered Explorers' : 'Catalog Controls'}
                        </h2>
                        <p className="text-slate-500 text-sm">Reviewing {activeTab === 'users' ? `${users.length} registered accounts` : 'real-time events'}.</p>
                    </div>
                    <button onClick={activeTab === 'activity' ? fetchLogs : fetchUsers} className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
                        <svg className={`w-5 h-5 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </header>

                {activeTab === 'activity' && (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Live Stream Timeline</span>
                            <div className="flex gap-2">
                                <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-500"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Story</span>
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Login</span>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100 overflow-y-auto max-h-[calc(100vh-250px)]">
                            {logs.map((log, idx) => (
                                <div key={idx} className="p-6 hover:bg-slate-50 group transition-all flex gap-4">
                                    <div className={`mt-1 p-2 rounded-xl flex-shrink-0 ${log.type === 'login' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                        {log.type === 'login' ? <Activity className="w-5 h-5" /> : <History className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{log.email}</h4>
                                            <span className="text-[11px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full">{new Date(log.timestamp).toLocaleString()}</span>
                                        </div>
                                        <div className={`text-sm ${log.type === 'login' ? 'text-slate-500 font-medium italic' : 'text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-2'}`}>
                                            {log.content}
                                        </div>
                                    </div>
                                    <div className="flex items-center text-slate-300 opacity-0 group-hover:opacity-100 transition-all">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            ))}
                            {logs.length === 0 && !isLoading && (
                                <div className="p-20 text-center text-slate-400 italic">No activity recorded yet across the cluster.</div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">User Email</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Username</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map((user, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900">{user.email || user.username}</td>
                                        <td className="px-6 py-4 text-slate-600">{user.username}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="bg-white rounded-3xl p-20 text-center border border-slate-200">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Extended Controls Restricted</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">These modules are currently in development as part of the Phase 2 expansion.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
