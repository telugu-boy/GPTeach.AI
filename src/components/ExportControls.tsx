import React, { useState } from 'react';
import { FileJson, FileText, FileType, Copy, Check } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { exportJSON, exportPDF, exportDOCX } from '../lib/exporters';

export default function ExportControls() {
    const plans = useSelector((s: RootState) => s.plans.items);
    const currentId = useSelector((s: RootState) => s.plans.currentId) || plans[0]?.id;
    const plan = plans.find(p => p.id === currentId);
    const [justCopied, setJustCopied] = useState(false);
    const [isExporting, setIsExporting] = useState<null | 'pdf' | 'docx'>(null);

    const handleJsonExport = () => {
        if (!plan) return;
        exportJSON(plan);
    }

    const handleCopyJson = () => {
        if (!plan || justCopied) return;
        
        const jsonContent = JSON.stringify(plan.tableContent, null, 2);
        
        navigator.clipboard.writeText(jsonContent).then(() => {
            setJustCopied(true);
            setTimeout(() => setJustCopied(false), 2000); // Reset icon after 2 seconds
        });
    };
    
    const handlePdfExport = async () => {
        if (!plan || isExporting) return;
        setIsExporting('pdf');
        try {
            await exportPDF(plan);
        } catch (error) {
            console.error("Failed to export PDF:", error);
            alert("Sorry, there was an error creating the PDF.");
        } finally {
            setIsExporting(null);
        }
    }

    const handleDocxExport = async () => {
        if (!plan || isExporting) return;
        setIsExporting('docx');
        try {
            await exportDOCX(plan);
        } catch (error) {
            console.error("Failed to export DOCX:", error);
            alert("Sorry, there was an error creating the Word document.");
        } finally {
            setIsExporting(null);
        }
    }

    const isBusy = !!isExporting;

    return (
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 mr-2 ml-2">Export:</span>
            <button 
                onClick={handleJsonExport} 
                title="Export as JSON" 
                disabled={!plan || isBusy}
                className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
                <FileJson size={18} />
            </button>
            <button
                onClick={handleCopyJson}
                title="Copy JSON to clipboard"
                disabled={!plan || isBusy}
                className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
                {justCopied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
            </button>
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <button 
                onClick={handlePdfExport}
                disabled={!plan || isBusy} 
                title="Export as PDF" 
                className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isExporting === 'pdf' ? <span className="animate-spin h-4 w-4 rounded-full border-b-2 border-slate-500 block"></span> : <FileType size={18} />}
            </button>
            <button 
                onClick={handleDocxExport}
                disabled={!plan || isBusy}
                title="Export as Word" 
                className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isExporting === 'docx' ? <span className="animate-spin h-4 w-4 rounded-full border-b-2 border-slate-500 block"></span> : <FileText size={18} />}
            </button>
        </div>
    );
}