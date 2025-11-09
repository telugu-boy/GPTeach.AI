import React, { useState } from 'react';
import { FileJson, FileText, FileType, Copy, Check } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { downloadText } from '../lib/exporters';

export default function ExportControls() {
    const plans = useSelector((s: RootState) => s.plans.items);
    const currentId = useSelector((s: RootState) => s.plans.currentId) || plans[0]?.id;
    const plan = plans.find(p => p.id === currentId);
    const [justCopied, setJustCopied] = useState(false);

    const handleJsonExport = () => {
        if (!plan) return;
        
        const jsonContent = JSON.stringify(plan.tableContent, null, 2);
        
        const sanitizedTitle = (plan.title || 'untitled').replace(/[^a-z0-9-_]+/gi, '_');
        downloadText(`${sanitizedTitle}-template.json`, jsonContent, 'application/json');
    }

    const handleCopyJson = () => {
        if (!plan || justCopied) return;
        
        const jsonContent = JSON.stringify(plan.tableContent, null, 2);
        
        navigator.clipboard.writeText(jsonContent).then(() => {
            setJustCopied(true);
            setTimeout(() => setJustCopied(false), 2000); // Reset icon after 2 seconds
        });
    };

    return (
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 mr-2 ml-2">Export:</span>
            <button 
                onClick={handleJsonExport} 
                title="Export as JSON" 
                className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
                <FileJson size={18} />
            </button>
            <button
                onClick={handleCopyJson}
                title="Copy JSON to clipboard"
                className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
                {justCopied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
            </button>
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <button 
                disabled 
                title="Export as PDF (coming soon)" 
                className="p-2 rounded-md text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <FileType size={18} />
            </button>
            <button 
                disabled 
                title="Export as Word (coming soon)" 
                className="p-2 rounded-md text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <FileText size={18} />
            </button>
        </div>
    );
}