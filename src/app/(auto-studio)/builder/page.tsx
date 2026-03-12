"use client"

import { useEffect, useMemo, useState } from "react";
import type { Builder } from "@prisma/client";

export default function BuilderPage() {

    const [builds, setBuilders] = useState<Builder[]>([]);

    // load in different builders
    useEffect(() => {
        async function loadBuilders() {
            const response = await fetch('/api/builder', { cache: 'no-store' });
            if (!response.ok) { return };
            
            const data: Builder[] = await response.json();
            setBuilders(data);
            

        }
        loadBuilders();
    })

    return (
        <>
            <h1 className="text-2xl font-bold mb-6">Builder</h1>
            <div className="flex items-start gap-6">
                <aside className="flex-none p-4 panel rounded-lg">
                    <h2 className="text-sm font-semibold mb-3">
                        Types
                    </h2>
                    {builds.length === 0 ? (
                        <p className="text-xs muted">No types defined. Hit /api/builder/seed first.</p>
                    ) : (
                        <ul className="space-y-1">
                            {builds.map((b) => (
                                <li key={b.id} className="py-1">
                                    <button className="w-full px-2 py-2 rounded-md text-xs text-left">
                                        <div className="font-medium">{b.name}</div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </aside>
            </div>

            
        </>
    );
}