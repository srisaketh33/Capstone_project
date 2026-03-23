import React, { useEffect, useState } from 'react';
import {
    Users,
    Activity,
    History,
    X,
    ShieldCheck,
    LogIn,
    Trash2
} from 'lucide-react';

interface LogEntry {
    email: string;
    timestamp: string;
    type: 'login' | 'story';
    content?: string;
}

interface AdminDashboardProps {
    token: string | null;
    onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ token, onClose }) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'users' | 'logins' | 'prompts'>('logins');
    
    // No separate Admin build states needed anymore

    useEffect(() => {
        if (token) {
            fetchLogs();
            fetchUsers();
        }
    }, [token]);

    const fetchLogs = async () => {
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
        }
    };

    const fetchUsers = async () => {
        try {
            const resp = await fetch('http://127.0.0.1:8000/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resp.ok) {
                setUsers(await resp.json());
            }
        } catch (err) {
            console.error("Failed to fetch users:", err);
        }
    };

    const handleClearLogs = async () => {
        if (!window.confirm("Are you sure you want to permanently delete all system logs? This action cannot be undone.")) return;

        try {
            const resp = await fetch('http://127.0.0.1:8000/admin/clear-logs', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resp.ok) {
                alert("All logs have been cleared.");
                fetchLogs(); // Refresh the list
            }
        } catch (err) {
            console.error("Failed to clear logs:", err);
            alert("Error clearing logs.");
        }
    };

    const handlePromoteUser = async (email: string) => {
        if (!window.confirm(`Are you sure you want to promote ${email} to Administrator?`)) return;
        try {
            const resp = await fetch(`http://127.0.0.1:8000/admin/users/${email}/promote`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resp.ok) {
                alert("User successfully promoted to Admin!");
                fetchUsers(); // Refresh the list
            } else {
                const data = await resp.json();
                alert(data.detail || "Failed to promote user.");
            }
        } catch (err) {
            alert("Error connecting to server.");
        }
    };

    const handleDeleteUser = async (email: string) => {
        if (!window.confirm(`Are you sure you want to PERMANENTLY delete user ${email}? This action cannot be undone.`)) return;
        try {
            const resp = await fetch(`http://127.0.0.1:8000/admin/users/${email}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resp.ok) {
                alert("User deleted successfully!");
                fetchUsers(); // Refresh dashboard
            } else {
                const data = await resp.json();
                alert(data.detail || "Failed to delete user.");
            }
        } catch (err) {
            alert("Error connecting to server.");
        }
    };

    const loginLogs = logs.filter(l => l.type === 'login');
    const promptLogs = logs.filter(l => l.type === 'story');

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-5xl h-full max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
                {/* Header */}
                <div className="px-8 py-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-500 p-2 rounded-xl">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">Admin Control Center</h2>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-0.5">Story Forge Oversight</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">

                        <button
                            onClick={handleClearLogs}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-xl transition-all border border-rose-500/20"
                        >
                            <Trash2 className="w-4 h-4" /> Clear All Logs
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="px-8 border-b border-slate-100 flex gap-6 shrink-0 bg-slate-50/50">
                    <button
                        onClick={() => setActiveTab('logins')}
                        className={`py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'logins' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <LogIn className="w-4 h-4" /> User Logins
                    </button>
                    <button
                        onClick={() => setActiveTab('prompts')}
                        className={`py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'prompts' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <History className="w-4 h-4" /> Prompt History
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <Users className="w-4 h-4" /> User Directory
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    {activeTab === 'logins' && (
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                                <Activity className="w-3 h-3" /> Recent Authentication Activity
                            </h3>
                            <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                {loginLogs.map((log, idx) => (
                                    <div key={idx} className="p-5 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl">
                                                <LogIn className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{log.email}</p>
                                            </div>
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
                                            {new Date(log.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                        </span>
                                    </div>
                                ))}
                                {loginLogs.length === 0 && <p className="p-12 text-center text-slate-400 italic">No login events captured.</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'prompts' && (
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">User Prompt Stream (Archive)</h3>
                            <div className="space-y-4">
                                {promptLogs.map((log, idx) => (
                                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-3xl p-6 transition-all hover:border-indigo-200 hover:shadow-md group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-white p-2 rounded-xl border border-slate-200 text-indigo-600 group-hover:border-indigo-500 transition-colors">
                                                    <History className="w-5 h-5" />
                                                </div>
                                                <p className="font-bold text-slate-900 tracking-tight">{log.email}</p>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase bg-white border border-slate-200 px-3 py-1 rounded-full">
                                                {new Date(log.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                            </span>
                                        </div>
                                        <div className="bg-white border border-slate-100 rounded-2xl p-5 text-slate-700 text-sm leading-relaxed shadow-inner">
                                            <span className="text-[10px] font-black text-indigo-400 uppercase block mb-2">Original User Prompt:</span>
                                            {log.content}
                                        </div>
                                    </div>
                                ))}
                                {promptLogs.length === 0 && <p className="p-12 text-center text-slate-400 italic">No prompts generated yet.</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-4">Explorer Email</th>
                                        <th className="px-8 py-4 text-center">Identity</th>
                                        <th className="px-8 py-4 text-right">Access Level</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.map((user, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-8 py-5 font-bold text-slate-900 text-sm">{user.email || user.username}</td>
                                            <td className="px-8 py-5 text-center text-slate-500 text-sm">{user.username}</td>
                                            <td className="px-8 py-5 text-right flex items-center justify-end gap-3">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {user.role}
                                                </span>
                                                {user.role !== 'admin' && (
                                                    <button 
                                                        onClick={() => handlePromoteUser(user.email || user.username)}
                                                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg transition-all"
                                                    >
                                                        Promote to Admin
                                                    </button>
                                                )}
                                                {user.role !== 'admin' && (
                                                    <button 
                                                        onClick={() => handleDeleteUser(user.email || user.username)}
                                                        className="p-1 px-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors border border-rose-100 flex items-center justify-center"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>


        </div>
    );
};

export default AdminDashboard;
