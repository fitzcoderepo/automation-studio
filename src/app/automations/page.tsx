"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardShell from "@/components/dashboard-shell";

import type { Automation, AutomationRun } from "@prisma/client";


export default function AutomationPage() {

    const [automations, setAutomations] = useState<Automation[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [runs, setRuns] = useState<AutomationRun[]>([]);
    const [text, setText] = useState("");
    const [running, setRunning] = useState(false);
    const [loadingRuns, setLoadingRuns] = useState(false);
    const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // load in automations
    useEffect(() => {
        async function loadAutomations() {
            const response = await fetch("/api/automations", { cache: "no-store" });

            if (!response.ok) { return };

            const data: Automation[] = await response.json();
            setAutomations(data);

            if (data.length > 0 && !selectedId) {
                setSelectedId(data[0].id);
            }
        }
        loadAutomations();

    }, [selectedId]);

    // track what is active selected. If nothing has changed on re-renders, reuse previous value
    const selectedAutomation = useMemo(
        () => automations.find(a => a.id === selectedId) ?? null, 
        [automations, selectedId]
    );

    // handle automation runs
    async function handleRun() {
        if (!selectedId || !text.trim() || running) { return };
        setRunning(true);
        try {
            const response = await fetch(`/api/automations/${selectedId}/run`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                console.error("Run failed");
                return;
            }

            const newRun: AutomationRun = await response.json();
            setRuns((prev) => [newRun, ...prev]);
            setText("");
        } catch (error) {
            console.error(error);
        } finally {
            setRunning(false);
        }
    }

    // when automation selection changes, load previous runs
    useEffect(() => {
        if (!selectedId) { return };

        async function loadRuns() {
            setLoadingRuns(true);
            try {
                const response = await fetch(`/api/automations/${selectedId}/runs`, {
                    cache: "no-store",
                });
                if (!response.ok) { return };

                const data: AutomationRun[] = await response.json();
                setRuns(data);
            } finally {
                setLoadingRuns(false);
            }
        }
        loadRuns();

    }, [selectedId]);

     // handle when re-run selected and use same input
    function handleReRun(run: AutomationRun) {
        try {
            const parsed = JSON.parse(run.input) as { text?: string };
            if (parsed.text) {
                setText(parsed.text);
            }
        } catch {
            //
        }
    }

    // handle file upload and change
    async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) { return };

        setSelectedFile(file); // track selected file

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/automations/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                console.error("File upload failed");
                return;
            }

            const data: { text?: string; filename?: string } = await response.json();

            if (data.text) {
                setText(data.text); // drop file text into textarea
            }
        } catch (error) {
            console.error(error);
        } finally {
            // allow reselecting same file
            e.target.value = "";
        }
    }

    // make the output somewhat readable
    function prettyJson(str: string | null) {
        if (!str) { return "" };

        try {
            return JSON.stringify(JSON.parse(str), null, 2);
        } catch {
            return str;
        }
    }

   



    return (
        <DashboardShell>
            <h1 className="text-2xl font-bold mb-6">Automations</h1>

            <div className="flex items-start gap-6">
                {/* Left: automation list */}
                <aside className="flex-none p-4 bg-slate-950 border border-slate-800 rounded-lg  ">
                    <h2 className="text-sm font-semibold text-slate-200 mb-3">
                        Automation Types
                    </h2>

                    {automations.length === 0 ? (
                        <p className="text-xs text-slate-500">
                            No automations defined. Hit /api/automations/seed first.
                        </p>
                    ) : (
                        <ul className="space-y-1">
                            {automations.map((a) => (
                                <li key={a.id} className="py-1">
                                
                                    <button
                                        onClick={() => setSelectedId(a.id)}
                                        className={`
                                            w-full px-2 py-2 rounded-md text-xs text-left 
                                            ${selectedId === a.id 
                                                ? "bg-slate-800 text-slate-100" 
                                                : "text-slate-400 hover:bg-slate-900 hover:text-slate-100 hover:cursor-pointer"}
                                        `} 
                                    >
                                        <div className="font-medium">{a.name}</div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </aside>

                {/* Runner */}
                <div className="grow bg-slate-950 border border-slate-800 rounded-lg p-4">
                    <h2 className="text-sm font-semibold text-slate-200 mb-3">
                        Run Automation
                    </h2>

                    {!selectedId ? (
                        <p className="text-xs text-slate-500">
                            Select an automation on the left.
                        </p>
                    ) : (
                        <>
                            <div className="mb-3 flex items-center gap-3">
                                <label className="cursor-pointer inline-flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-[11px] text-slate-200 hover:bg-slate-800">
                                    Upload file
                                    <input
                                        type="file"
                                        accept=".csv,.txt"
                                        className="hidden"
                                        onChange={handleFile}
                                    />

                                </label>
                                {selectedFile && (
                                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                                        <span>{selectedFile.name}</span>
                                        <button
                                            onClick={() => {
                                                setSelectedFile(null);
                                                setText(""); // clear textarea too
                                            }}
                                            className="text-red-400 hover:text-red-300 text-[11px]"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}
                                
                                <span className="text-[10px] text-slate-500">
                                    .csv/.xls/.xlsx/.txt/.doc/.docx/free-form text
                                </span>
                            </div>
                            <textarea
                                className="w-full h-32 rounded-md bg-slate-900 border border-slate-700 p-2 text-xs text-slate-100 mb-3"
                                placeholder={
                                    selectedAutomation?.type === "invoice_extraction" ? "Paste invoice text here..."
                                        : selectedAutomation?.type === "spreadsheet_summary" ? "Paste spreadsheet text here..."
                                            : selectedAutomation?.type === "text_summarization" ? "Paste any text to summarize..."
                                                : "Paste input text here..."
                                }
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />
                            <button
                                onClick={handleRun}
                                disabled={running || !text.trim()}
                                className="inline-flex items-center px-3 py-2 rounded-md text-xs font-medium bg-blue-600  text-white disabled:text-white/30"
                            >
                                {running ? "Running..." : "Run Automation"}
                            </button>
                        </>
                    )}
                </div>
                
                {/* runs history */}
                <div className="flex-none bg-slate-950 border border-slate-800 rounded-lg p-4">
                    <h2 className="text-sm font-semibold text-slate-200 mb-3">
                        Recent Runs
                    </h2>

                    {loadingRuns ? (
                        <p className="text-xs text-slate-500">Loading runs...</p>
                    ) : runs.length === 0 ? (
                        <p className="text-xs text-slate-500">
                            No runs yet for this automation.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {runs.map((run) => (
                                <div
                                    key={run.id}
                                    className="border border-slate-800 rounded-md p-3 text-xs"
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span
                                            className={
                                                run.status === "success"
                                                    ? "text-emerald-400"
                                                    : run.status === "error"
                                                        ? "text-red-400"
                                                        : "text-slate-400"
                                            }
                                        >
                                            {run.status.toUpperCase()}
                                        </span>
                                        <span className="text-[10px] text-slate-500">
                                            {new Date(run.createdAt).toLocaleString()}
                                        </span>
                                    </div>

                                    {run.error && (
                                        <p className="text-[11px] text-red-400 mb-1">
                                            {run.error}
                                        </p>
                                    )}

                                    <div className="flex gap-2 mb-2">
                                        <button
                                            onClick={() => handleReRun(run)}
                                            className="text-[11px] text-blue-400 hover:underline"
                                        >
                                            Re-run with this input
                                        </button>
                                        <button
                                            onClick={() =>
                                                setExpandedRunId(
                                                    expandedRunId === run.id ? null : run.id
                                                )
                                            }
                                            className="text-[11px] text-slate-400 hover:underline"
                                        >
                                            {expandedRunId === run.id
                                                ? "Hide output"
                                                : "View output JSON"}
                                        </button>
                                    </div>

                                    {expandedRunId === run.id && run.output && (
                                        <pre className="mt-2 text-[11px] bg-slate-900 border border-slate-800 rounded-md p-2 overflow-x-auto">
                                            {prettyJson(run.output)}
                                        </pre>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardShell>
    );

}